"""Tests for POST /api/predict: risk-band threshold boundaries, feature-vector
ordering against model_metadata.json, and behavior when no trained model is
loaded.

Both the model and the DB session are mocked -- these tests don't need a
real .pkl on disk or a live Postgres/PostGIS instance.
"""

from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from main import app
from app.db.session import get_db
from app.ml import model_loader

FEATURE_COLUMNS = [
    "rainfall_1h_cm",
    "rainfall_3h_cm",
    "rainfall_24h_cm",
    "rainfall_7d_cm",
    "humidity_pct",
    "temperature_c",
    "month",
    "is_monsoon",
    "avg_elevation_m",
    "drainage_capacity_score",
    "impervious_surface_pct",
    "proximity_to_water_km",
]

FAKE_METADATA = {
    "feature_columns": FEATURE_COLUMNS,
    "risk_thresholds": {"LOW": 0.25, "MODERATE": 0.55, "HIGH": 0.80, "CRITICAL": 1.0},
}


@pytest.fixture(autouse=True)
def _reset_model_loader_state():
    """model_loader caches _model/_metadata/_is_loaded as module globals the
    first time anything calls it; reset them around every test so mocking in
    one test can't leak into the next.
    """
    original = (model_loader._model, model_loader._metadata, model_loader._is_loaded)
    yield
    model_loader._model, model_loader._metadata, model_loader._is_loaded = original


# ---------------------------------------------------------------------------
# classify_risk: probability -> band, at each threshold boundary
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "probability, expected_band",
    [
        (0.0, "LOW"),
        (0.24, "LOW"),
        (0.25, "MODERATE"),  # LOW -> MODERATE boundary (thresholds are exclusive upper bounds)
        (0.54, "MODERATE"),
        (0.55, "HIGH"),  # MODERATE -> HIGH boundary
        (0.79, "HIGH"),
        (0.80, "CRITICAL"),  # HIGH -> CRITICAL boundary
        (1.0, "CRITICAL"),
    ],
)
def test_classify_risk_thresholds(monkeypatch, probability, expected_band):
    monkeypatch.setattr(model_loader, "_metadata", FAKE_METADATA)
    monkeypatch.setattr(model_loader, "_is_loaded", True)
    assert model_loader.classify_risk(probability) == expected_band


# ---------------------------------------------------------------------------
# Feature vector must be built in model_metadata.json's feature_columns order
# ---------------------------------------------------------------------------


class _RecordingModel:
    """Stands in for the LightGBM model; records the array it was scored on."""

    def __init__(self):
        self.received = None

    def predict_proba(self, x):
        self.received = x
        return [[0.9, 0.1]]


def test_feature_vector_matches_metadata_column_order(monkeypatch):
    monkeypatch.setattr(model_loader, "_metadata", FAKE_METADATA)
    fake_model = _RecordingModel()
    monkeypatch.setattr(model_loader, "_model", fake_model)
    monkeypatch.setattr(model_loader, "_is_loaded", True)

    # A distinct value per column so a reordering bug shows up as a value in
    # the wrong position, not two columns silently matching by coincidence.
    features = {col: float(i) for i, col in enumerate(FEATURE_COLUMNS)}

    model_loader.predict_flood_risk(features)

    assert fake_model.received is not None
    got = list(fake_model.received[0])
    expected = [features[col] for col in FEATURE_COLUMNS]
    assert got == expected


# ---------------------------------------------------------------------------
# POST /api/predict, with the DB session and model both mocked
# ---------------------------------------------------------------------------


def _fake_zone(zone_id: int = 1):
    return SimpleNamespace(
        id=zone_id,
        zone_name="Adyar",
        avg_elevation_m=4.2,
        drainage_capacity="LOW",
        impervious_surface_pct=72.0,
        proximity_to_water_km=0.3,
    )


class _FakeQuery:
    def __init__(self, result):
        self._result = result

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return self._result


class _FakeDB:
    """Enough of a SQLAlchemy Session surface for PredictionService.predict():
    a Zone lookup via query().filter().first(), and add()/commit() for the
    FloodPrediction insert. No engine, no connection, nothing touches Postgres.
    """

    def __init__(self, zone):
        self._zone = zone
        self.added = []

    def query(self, model):
        return _FakeQuery(self._zone)

    def add(self, obj):
        self.added.append(obj)

    def commit(self):
        pass


@pytest.fixture
def client_with_fake_db():
    fake_db = _FakeDB(_fake_zone())

    def _override_get_db():
        yield fake_db

    app.dependency_overrides[get_db] = _override_get_db
    yield TestClient(app), fake_db
    app.dependency_overrides.pop(get_db, None)


PREDICT_PAYLOAD = {
    "zone_id": 1,
    "rainfall_1h_cm": 5.0,
    "rainfall_24h_cm": 20.0,
    "rainfall_7d_cm": 45.0,
    "humidity_pct": 92.0,
}


def test_predict_endpoint_uses_trained_model_when_available(monkeypatch, client_with_fake_db):
    client, fake_db = client_with_fake_db
    monkeypatch.setattr(model_loader, "_metadata", FAKE_METADATA)
    monkeypatch.setattr(model_loader, "_model", _RecordingModel())
    monkeypatch.setattr(model_loader, "_is_loaded", True)

    response = client.post("/api/predict", json=PREDICT_PAYLOAD)

    assert response.status_code == 200
    body = response.json()
    assert body["model_type"] == "lightgbm"
    assert body["zone_id"] == 1
    assert 0.0 <= body["flood_probability"] <= 1.0
    assert len(fake_db.added) == 1  # one flood_predictions row written


def test_predict_endpoint_falls_back_to_heuristic_when_model_missing(monkeypatch, client_with_fake_db):
    """Pins down the ACTUAL behavior, which differs from the original spec.

    The brief this endpoint was built against called for a 503 when no
    trained model is present. What's actually implemented in
    app/ml/model_loader.py instead falls back to a rule-based heuristic
    score and still returns 200. This test documents that real behavior so
    a future change to it is a deliberate, visible diff -- not a silent
    regression -- rather than asserting the 503 that was never built.
    """
    client, fake_db = client_with_fake_db
    monkeypatch.setattr(model_loader, "_metadata", FAKE_METADATA)
    monkeypatch.setattr(model_loader, "_model", None)
    monkeypatch.setattr(model_loader, "_is_loaded", True)

    response = client.post("/api/predict", json=PREDICT_PAYLOAD)

    assert response.status_code == 200
    body = response.json()
    assert body["model_type"] == "heuristic_fallback"
    assert len(fake_db.added) == 1

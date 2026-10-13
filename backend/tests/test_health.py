"""Tests for FastAPI core health check, root, and documentation endpoints."""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root_endpoint():
    """Test / root endpoint returns online status, version 1.1.0, and deployment metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["version"] == "1.1.0"
    assert "deployment" in data


def test_health_check():
    """Test /health endpoint returns 200 and ok status."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_openapi_documentation_endpoint():
    """Test /openapi.json schema returns 200 and valid project metadata."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert schema["info"]["title"] == "Chennai Flood Prediction API"
    assert schema["info"]["version"] == "1.1.0"


def test_not_found_route():
    """Test non-existent route returns 404 Not Found."""
    response = client.get("/nonexistent-endpoint")
    assert response.status_code == 404

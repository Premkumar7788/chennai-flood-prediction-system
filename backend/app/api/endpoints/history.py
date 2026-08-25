"""Historical flood event endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.historical_flood import HistoricalFlood
from app.models.zone import Zone
from app.schemas.history import HistoricalFloodEvent, HistoricalFloodResponse

router = APIRouter(tags=["History"])


@router.get("/history", response_model=HistoricalFloodResponse)
async def get_flood_history(
    zone_id: Optional[int] = Query(None, description="Filter by zone ID (omit for all zones)"),
    db: Session = Depends(get_db),
):
    """Retrieve historical Chennai flood events with inundation depths and rainfall records.

    Returns documented flood events (2015 Chennai Floods, 2021 Floods, Cyclone Michaung 2023).
    Optionally filter by zone_id to see events affecting a specific zone.
    """
    query = db.query(HistoricalFlood, Zone.zone_name).join(
        Zone, HistoricalFlood.zone_id == Zone.id
    )

    if zone_id is not None:
        query = query.filter(HistoricalFlood.zone_id == zone_id)

    query = query.order_by(HistoricalFlood.event_date.desc())
    results = query.all()

    events = [
        HistoricalFloodEvent(
            id=flood.id,
            zone_id=flood.zone_id,
            zone_name=zone_name,
            event_date=flood.event_date,
            event_name=flood.event_name,
            flood_depth_cm=flood.flood_depth_cm,
            flood_duration_hours=flood.flood_duration_hours,
            rainfall_24h_cm=flood.rainfall_24h_cm,
            source=flood.source,
        )
        for flood, zone_name in results
    ]

    return HistoricalFloodResponse(
        zone_id=zone_id,
        total_events=len(events),
        events=events,
    )

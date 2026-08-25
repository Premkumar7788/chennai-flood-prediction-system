"""Pydantic schemas for historical flood event responses."""

from typing import List, Optional
from datetime import date
from pydantic import BaseModel, Field


class HistoricalFloodEvent(BaseModel):
    """Single historical flood event record."""

    id: int
    zone_id: int
    zone_name: Optional[str] = None
    event_date: date
    event_name: Optional[str] = None
    flood_depth_cm: Optional[float] = Field(None, description="Recorded water depth in cm")
    flood_duration_hours: Optional[int] = Field(None, description="Duration of flooding in hours")
    rainfall_24h_cm: Optional[float] = Field(None, description="24-hour rainfall that caused the event")
    source: Optional[str] = Field(None, description="Data source (IMD, NDMA, etc.)")

    model_config = {"from_attributes": True}


class HistoricalFloodResponse(BaseModel):
    """Response containing list of historical flood events."""

    zone_id: Optional[int] = Field(None, description="Zone filter applied (null = all zones)")
    total_events: int = Field(..., description="Total number of events returned")
    events: List[HistoricalFloodEvent]

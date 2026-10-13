"""Chennai Flood Prediction System - Main FastAPI Application Entrypoint.

This module initializes the FastAPI application, sets up middleware (CORS),
defines core endpoints (root and health check), and provides integration points
for API routers and background schedulers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import router as api_router

app = FastAPI(
    title="Chennai Flood Prediction API",
    description="Backend API for real-time and predictive flood risk monitoring in Chennai.",
    version="1.1.0",
)

# Configure CORS middleware (allowing all origins for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint returning welcome and service status."""
    return {
        "message": "Welcome to the Chennai Flood Prediction API",
        "status": "online",
        "version": "1.1.0",
        "deployment": "Sprint 09 Automated CI/CD",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for container probes and monitoring."""
    return {"status": "ok"}


app.include_router(api_router, prefix="/api")

# ---------------------------------------------------------------------------
# Scheduler Integration (Scaffold Placeholder)
# ---------------------------------------------------------------------------
# TODO: Start APScheduler on startup event / lifespan:
# @app.on_event("startup")
# async def start_scheduler():
#     from app.schedulers.rainfall_scheduler import start_rainfall_scheduler
#     start_rainfall_scheduler()

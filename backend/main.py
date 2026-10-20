"""Chennai Flood Prediction System - Main FastAPI Application Entrypoint.

This module initializes the FastAPI application, sets up middleware (CORS and Request Logging),
defines core endpoints (root and health check), and provides integration points
for API routers and background schedulers.
"""

import time
import uuid
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.core.logging_config import setup_logging
from app.api.router import router as api_router

# Initialize structured application logging
setup_logging()
logger = logging.getLogger("backend.main")

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


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log inbound HTTP requests and execution latency with unique request IDs."""
    req_id = f"req-{uuid.uuid4().hex[:6]}"
    start_time = time.time()
    logger.info("[request_id=%s] - Inbound %s %s", req_id, request.method, request.url.path)
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        logger.info(
            "[request_id=%s] - %s %s - %d OK (%.2fms)",
            req_id,
            request.method,
            request.url.path,
            response.status_code,
            process_time,
        )
        return response
    except Exception as exc:
        process_time = (time.time() - start_time) * 1000
        logger.error(
            "[request_id=%s] - %s %s - 500 Exception (%.2fms): %s",
            req_id,
            request.method,
            request.url.path,
            process_time,
            str(exc),
        )
        raise exc


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

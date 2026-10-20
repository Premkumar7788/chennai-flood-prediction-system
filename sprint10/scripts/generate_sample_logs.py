#!/usr/bin/env python3
"""
Chennai Street-Level Flood Prediction System - Sample Log Streamer
Sprint 10: Activity D Log Ingestion Verification Tool

Author: Hema Priyadharshni G (23MIS1133)
Purpose:
  Generates realistic application and sensor telemetry log entries adhering to
  the Logstash Grok pattern into the shared log volume for ELK verification.
"""

import os
import sys
import time
import random
from datetime import datetime

DEFAULT_LOG_PATH = os.getenv("LOG_PATH", "/var/log/chennai-flood/app.log")
FALLBACK_LOG_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "logs", "app.log")

ZONES = [
    "Adyar", "Velachery", "T-Nagar", "Guindy", "Mylapore",
    "Perambur", "Madipakkam", "Tambaram", "Sholinganallur", "Perungudi"
]

TEMPLATES = [
    ("INFO", "backend.services.prediction_service", "Prediction requested for zone {zone} - Rainfall: {rain:.1f}mm"),
    ("INFO", "backend.services.prediction_service", "Prediction generated for zone {zone}: Risk={risk}, Water_Level={water:.2f}m, Inundation_Prob={prob:.2f}"),
    ("INFO", "backend.api.router", "GET /api/zones - 200 OK - Retrieved active monitoring zones"),
    ("INFO", "backend.api.router", "GET /health - 200 OK - Health probe verified operational"),
    ("INFO", "backend.ml.model_loader", "Loaded LightGBM model weights from /app/ml/models/flood_classifier.joblib"),
    ("WARN", "backend.services.telemetry_service", "Telemetry latency high: Sensor node {zone}-STATION response delayed by {latency}ms"),
    ("WARN", "backend.ml.model_loader", "Incomplete telemetry received for {zone} - Falling back to heuristic risk model"),
    ("WARN", "backend.database", "Connection pool utilization reached {pool}% (41/50 connections active)"),
    ("ERROR", "backend.database", "Database connection timeout: Failed to acquire connection to PostgreSQL host within 5000ms"),
    ("ERROR", "backend.services.sensor_client", "Connection refused: IoT water level sensor station {zone}-IoT is offline"),
    ("ERROR", "backend.api.router", "POST /api/predict failed for {zone} - 500 Internal Server Error: Pipeline exception"),
]


def resolve_log_path():
    try:
        os.makedirs(os.path.dirname(DEFAULT_LOG_PATH), exist_ok=True)
        with open(DEFAULT_LOG_PATH, "a") as f:
            pass
        return DEFAULT_LOG_PATH
    except (PermissionError, OSError):
        os.makedirs(os.path.dirname(FALLBACK_LOG_PATH), exist_ok=True)
        return FALLBACK_LOG_PATH


def generate_entry(req_id):
    level, logger_name, text = random.choice(TEMPLATES)
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S,%f")[:-3]
    zone = random.choice(ZONES)
    rain = random.uniform(10.0, 150.0)
    water = random.uniform(0.1, 1.8)
    prob = round(random.uniform(0.2, 0.98), 2)
    risk = "LOW" if prob < 0.4 else ("MODERATE" if prob < 0.7 else ("HIGH" if prob < 0.88 else "CRITICAL"))
    latency = random.randint(1200, 3500)
    pool = random.randint(80, 96)

    msg = text.format(zone=zone, rain=rain, water=water, prob=prob, risk=risk, latency=latency, pool=pool)
    return f"{now} [{level}] [{logger_name}] [request_id=req-{req_id}] - {msg}\n"


def main():
    target_path = resolve_log_path()
    print(f"Streaming Chennai Flood log telemetry to: {target_path}")
    count = 25
    with open(target_path, "a") as f:
        for i in range(1050, 1050 + count):
            entry = generate_entry(i)
            f.write(entry)
            print(f"Logged: {entry.strip()}")
            time.sleep(0.02)
    print(f"\nSuccessfully emitted {count} log entries to {target_path}.")


if __name__ == "__main__":
    main()

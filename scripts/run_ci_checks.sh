#!/usr/bin/env bash
# ==============================================================================
# Chennai Flood Prediction System - Local CI Verification Script
# Matches the Jenkinsfile stages: Setup -> Test / Validate -> Docker Build
# ==============================================================================

set -euo pipefail

echo "=========================================="
echo " 🌊 Running CI Pipeline Verification Checks "
echo "=========================================="

# 1. Environment Setup
echo "--> [Stage 1/3] Setting up Python 3.11 Virtual Environment..."
if command -v python3.11 >/dev/null 2>&1; then
    PYTHON_BIN="python3.11"
else
    PYTHON_BIN="python3"
fi

$PYTHON_BIN -m venv venv
source venv/bin/activate
pip install --upgrade pip -q
pip install -r backend/requirements.txt -q

# 2. Automated Testing
echo "--> [Stage 2/3] Executing Automated Pytest Test Suite..."
export PYTHONPATH="$(pwd)/backend:${PYTHONPATH:-}"
pytest backend/tests/ -v

# 3. Docker Image Build Validation
echo "--> [Stage 3/3] Validating Docker Container Build..."
docker build -t chennai-flood-backend:local-ci -t chennai-flood-backend:latest ./backend
docker images | grep chennai-flood-backend

echo "=========================================="
echo " ✅ All CI Stages Verified Successfully!   "
echo "=========================================="

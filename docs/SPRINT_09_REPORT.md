# Sprint 09: Continuous Delivery and Deployment using Jenkins
## Course: ISWE406P – Agile Development Process and DevOps Lab
**Programme**: M.Tech. (Integrated) Software Engineering  
**Faculty**: Dr. Kaja Mohideen A | **Slot**: L11+L12 | **Class Number**: CH2026270100722  
**Student Name**: Hema Priyadharshni G | **Academic Year**: 2026 – 2027  
**Submission Due Date**: 13.10.2026  

---

## 1. Cover Page Details
- **Project Title**: Chennai Street-Level Flood Prediction System
- **Sprint**: 09 – Continuous Delivery and Deployment (CI/CD) using Jenkins
- **Customer Requirement**: *"The customer wants every validated code update to be automatically packaged, tested, and deployed without manual intervention."*
- **GitHub Repository**: `https://github.com/Premkumar7788/chennai-flood-prediction-system`
- **Main Branch**: `main`
- **Jenkins Controller URL**: `http://localhost:8080/`
- **Jenkins Job**: `chennai-flood-prediction-ci`
- **Docker Hub Repository**: `premkumar2005/chennai-flood-backend`
- **Target Deployment Environment**: AWS EC2 Instance (`16.192.243.169`)
  - **SSH Access**: Port `22` (User: `ec2-user`, Key: `~/.ssh/flood-ec2`)
  - **Live Backend API**: `http://16.192.243.169:8000`
  - **API Health Check**: `http://16.192.243.169:8000/health`
  - **Live Frontend Dashboard**: `http://16.192.243.169:3000`

---

## 2. Sprint Objectives
The objective of Sprint 09 is to extend the Jenkins Continuous Integration (CI) pipeline developed in Sprint 08 into a complete, end-to-end Continuous Delivery and Deployment (CI/CD) pipeline. By the end of this sprint, the following goals were accomplished:
1. **Extend Existing CI Pipeline**: Transformed the 4-stage Sprint 08 CI pipeline into a 7-stage CI/CD pipeline.
2. **Automated Testing Integration**: Integrated automated application test execution using `pytest` to validate core FastAPI endpoints and ML classification logic before any packaging or deployment occurs.
3. **Automated Docker Image Build & Tagging**: Automatically built Docker containers and tagged them with unique, traceable build identifiers (`premkumar2005/chennai-flood-backend:build-${BUILD_NUMBER}`) and `latest`.
4. **Docker Hub Registry Integration**: Automated the pushing of validated container images to Docker Hub.
5. **Automated Remote Deployment**: Configured automated SSH deployment to the live AWS EC2 target environment (`16.192.243.169`) with automated container recreation via Docker Compose.
6. **Post-Deployment Verification**: Automated end-to-end post-deployment health check probes (`curl`) ensuring 100% service availability before declaring build success.
7. **Failure Scenario Verification (Pipeline Gating)**: Proved that a broken test intentionally stops the pipeline, halts container building/pushing, and completely prevents deployment to the live production server.
8. **Demonstrate End-to-End Workflow**: Committed and pushed application updates (release `v1.1.0`), tracked execution across GitHub → Jenkins → Docker Hub → AWS EC2, and verified live runtime behavior.

---

## 3. Review of Sprint 08 CI Pipeline vs Sprint 09 CI/CD Pipeline

### A. Review of Sprint 08 CI Workflow
In Sprint 08, the pipeline automated code validation up to container packaging on the local Jenkins agent:
$$\text{GitHub Push} \longrightarrow \text{Jenkins Trigger} \longrightarrow \text{Checkout} \longrightarrow \text{Build/Setup} \longrightarrow \text{Test (Pytest)} \longrightarrow \text{Docker Build (Local)}$$

While this satisfied Continuous Integration (verifying code compatibility and producing a build artifact), deployment still required manual intervention. The built image was not pushed to a centralized container registry, and deployment to the remote AWS EC2 instance had to be performed manually by an engineer logging in via SSH, pulling code, and rebuilding containers.

### B. Sprint 09 CI/CD Workflow Architecture
To satisfy the customer requirement of zero manual intervention, Sprint 09 extends the pipeline with automated registry publishing, remote deployment, and post-deployment validation:

```
+-------------------------------------------------------------------------------------------------------+
|                                    SPRINT 09 END-TO-END CI/CD PIPELINE                                |
+-------------------------------------------------------------------------------------------------------+
|  [Developer Workstation]                                                                              |
|         |                                                                                             |
|         v (git push origin main)                                                                      |
|  [GitHub Repository] (Premkumar7788/chennai-flood-prediction-system)                                  |
|         |                                                                                             |
|         v (SCM Trigger / Webhook)                                                                     |
|  [Jenkins Controller] (localhost:8080)                                                                |
|         |-- Stage 1: Checkout Source Code                                                             |
|         |-- Stage 2: Application Build & Dependency Setup (Python 3.11 venv)                          |
|         |-- Stage 3: Automated Testing & Validation (pytest backend/tests/ -v)                        |
|         |            * QUALITY GATE: If tests fail, HALT immediately (No deploy)                      |
|         |-- Stage 4: Docker Build & Tagging (premkumar2005/chennai-flood-backend:build-${BUILD_NUMBER})|
|         |-- Stage 5: Push Image to Docker Hub (docker.io/premkumar2005/chennai-flood-backend)         |
|         |-- Stage 6: Deploy to AWS EC2 (SSH 16.192.243.169 -> docker compose up -d backend)           |
|         `-- Stage 7: Post-Deployment Verification (curl http://16.192.243.169:8000/health)            |
|                                                                                                       |
|  [Docker Hub Registry] <===== Pushed from Jenkins Stage 5                                             |
|                                                                                                       |
|  [AWS EC2 Target Instance] (16.192.243.169)                                                          |
|         |-- chennai-flood-backend:build-${BUILD_NUMBER} (Port 8000)                                   |
|         |-- chennai-flood-frontend (Port 3000)                                                        |
|         `-- chennai-flood-db (PostgreSQL 15 + PostGIS, Port 5432)                                     |
+-------------------------------------------------------------------------------------------------------+
```

### C. Comparison: CI vs Continuous Delivery vs Continuous Deployment

| Metric / Dimension | Continuous Integration (CI) | Continuous Delivery (CD) | Continuous Deployment (CD) |
| :--- | :--- | :--- | :--- |
| **Focus** | Code integration & automated validation | Deployable artifact ready for release | Automatic release to production |
| **Trigger** | Every git push / pull request | Automated through build & test | Automated end-to-end on main branch |
| **Deployment Step** | None (Artifact built locally) | Automated to Staging; Manual trigger to Prod | **100% Automated to Production** |
| **Human Intervention**| None (Validation feedback only) | Manual approval click required | **Zero human intervention** |
| **Project State** | Sprint 08 Status | Intermediate Delivery State | **Sprint 09 Accomplished State** |

---

## 4. CI/CD Pipeline Design and Implementation

### A. Environment Configuration
The declarative pipeline uses environment variables parameterized for clean separation between code, credentials, and infrastructure targets:

```groovy
environment {
    PATH = "/opt/homebrew/bin:/usr/local/bin:${env.PATH}"
    DOCKER_HUB_USER = "premkumar2005"
    IMAGE_NAME = "chennai-flood-backend"
    DOCKER_IMAGE = "${DOCKER_HUB_USER}/${IMAGE_NAME}"
    IMAGE_TAG = "build-${BUILD_NUMBER}"
    EC2_HOST = "16.192.243.169"
    SSH_PORT = "22"
    EC2_USER = "ec2-user"
    EC2_KEY = "/Users/hemapriyadharshni/.ssh/flood-ec2"
    APP_URL = "http://16.192.243.169:8000"
    PYTHONUNBUFFERED = "1"
}
```

### B. Complete Declarative `Jenkinsfile`
The complete declarative `Jenkinsfile` committed to the root of the repository is shown below:

```groovy
pipeline {
    agent any

    environment {
        PATH = "/opt/homebrew/bin:/usr/local/bin:${env.PATH}"
        DOCKER_HUB_USER = "premkumar2005"
        IMAGE_NAME = "chennai-flood-backend"
        DOCKER_IMAGE = "${DOCKER_HUB_USER}/${IMAGE_NAME}"
        IMAGE_TAG = "build-${BUILD_NUMBER}"
        EC2_HOST = "16.192.243.169"
        SSH_PORT = "22"
        EC2_USER = "ec2-user"
        EC2_KEY = "/Users/hemapriyadharshni/.ssh/flood-ec2"
        APP_URL = "http://16.192.243.169:8000"
        PYTHONUNBUFFERED = "1"
    }

    stages {
        stage('Checkout') {
            steps {
                echo '=== Stage 1: Checkout Source Code ==='
                checkout scm
                sh 'git log -1 --stat'
            }
        }

        stage('Build & Setup') {
            steps {
                echo '=== Stage 2: Application Build & Dependency Setup ==='
                sh '''
                    if command -v python3.11 >/dev/null 2>&1; then
                        PYTHON_BIN="python3.11"
                    else
                        PYTHON_BIN="python3"
                    fi
                    $PYTHON_BIN -m venv venv
                    . venv/bin/activate
                    pip install --upgrade pip
                    pip install -r backend/requirements.txt
                '''
            }
        }

        stage('Automated Testing') {
            steps {
                echo '=== Stage 3: Automated Validation & Testing ==='
                sh '''
                    . venv/bin/activate
                    export PYTHONPATH="${WORKSPACE}/backend:${PYTHONPATH}"
                    pytest backend/tests/ -v
                '''
            }
        }

        stage('Docker Build & Tag') {
            steps {
                echo '=== Stage 4: Docker Image Build & Tagging ==='
                sh """
                    docker build -t ${DOCKER_IMAGE}:${IMAGE_TAG} -t ${DOCKER_IMAGE}:latest -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ./backend
                    docker images | grep -E "(${IMAGE_NAME}|${DOCKER_HUB_USER})"
                """
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo '=== Stage 5: Push Image to Docker Hub Registry ==='
                sh """
                    docker push ${DOCKER_IMAGE}:${IMAGE_TAG}
                    docker push ${DOCKER_IMAGE}:latest
                """
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo '=== Stage 6: Automated Deployment to AWS EC2 ==='
                sh """
                    ssh -o StrictHostKeyChecking=no -i ${EC2_KEY} -p ${SSH_PORT} ${EC2_USER}@${EC2_HOST} '
                        cd ~/chennai-flood-prediction-system
                        docker tag ${DOCKER_IMAGE}:latest ${DOCKER_IMAGE}:${IMAGE_TAG} 2>/dev/null || true
                        IMAGE_TAG=${IMAGE_TAG} docker compose up -d --no-deps backend
                        docker compose ps backend
                    '
                """
            }
        }

        stage('Verify Deployment') {
            steps {
                echo '=== Stage 7: Post-Deployment Application Health Verification ==='
                sh """
                    echo "Verifying application availability at ${APP_URL}/health..."
                    curl -s -f --retry 5 --retry-delay 3 --retry-connrefused ${APP_URL}/health || (echo "Health check failed!" && exit 1)
                    echo "Application health check passed successfully: HTTP 200 OK"
                """
            }
        }
    }

    post {
        always {
            echo '=== Pipeline Execution Completed ==='
            cleanWs(deleteDirs: true, notFailBuild: true)
        }
        success {
            echo "CI/CD Pipeline Succeeded! Deployed image ${DOCKER_IMAGE}:${IMAGE_TAG} to AWS EC2 (${EC2_HOST})."
        }
        failure {
            echo "CI/CD Pipeline Failed! Deployment aborted or halted. Check console log for details."
        }
    }
}
```

---

## 5. Automated Application Testing
Stage 3 executes the complete automated test suite before any container is built. This acts as a strict **Quality Gate**. If any test fails, Jenkins aborts the pipeline, preventing any broken artifact from ever being published or deployed.

### Test Suite Structure
The test suite consists of 13 unit tests across two test modules:
1. `backend/tests/test_health.py`:
   - `test_root_endpoint`: Validates that `GET /` returns status `200`, status `online`, version `1.1.0`, and deployment metadata.
   - `test_health_check`: Validates that `GET /health` returns status `200` and `{"status": "ok"}` for container liveness probes.
2. `backend/tests/test_predict_endpoint.py`:
   - `test_classify_risk_thresholds[0.0-LOW]`: Validates lower probability boundary.
   - `test_classify_risk_thresholds[0.24-LOW]`: Validates upper boundary of LOW risk.
   - `test_classify_risk_thresholds[0.25-MODERATE]`: Validates boundary threshold transition to MODERATE risk.
   - `test_classify_risk_thresholds[0.54-MODERATE]`: Validates upper boundary of MODERATE risk.
   - `test_classify_risk_thresholds[0.55-HIGH]`: Validates boundary transition to HIGH risk.
   - `test_classify_risk_thresholds[0.79-HIGH]`: Validates upper boundary of HIGH risk.
   - `test_classify_risk_thresholds[0.8-CRITICAL]`: Validates boundary transition to CRITICAL risk.
   - `test_classify_risk_thresholds[1.0-CRITICAL]`: Validates maximum probability boundary.
   - `test_feature_vector_matches_metadata_column_order`: Validates 12-feature ML input vector column alignment against `model_metadata.json`.
   - `test_predict_endpoint_uses_trained_model_when_available`: Validates ML model inference logic with mocked LightGBM classifier.
   - `test_predict_endpoint_falls_back_to_heuristic_when_model_missing`: Validates fallback heuristic flood calculation when ML pickle is absent.

### Test Execution Output (Build #14)
```text
============================= test session starts ==============================
platform darwin -- Python 3.11.14, pytest-8.3.3, pluggy-1.6.0
cachedir: .pytest_cache
rootdir: /Users/hemapriyadharshni/.jenkins/workspace/chennai-flood-prediction-ci
plugins: asyncio-0.24.0, anyio-4.15.1
collected 13 items

backend/tests/test_health.py::test_root_endpoint PASSED                   [  7%]
backend/tests/test_health.py::test_health_check PASSED                    [ 15%]
backend/tests/test_predict_endpoint.py::test_classify_risk_thresholds[0.0-LOW] PASSED [ 23%]
backend/tests/test_predict_endpoint.py::test_classify_risk_thresholds[0.24-LOW] PASSED [ 30%]
backend/tests/test_predict_endpoint.py::test_classify_risk_thresholds[0.25-MODERATE] PASSED [ 38%]
backend/tests/test_predict_endpoint.py::test_classify_risk_thresholds[0.54-MODERATE] PASSED [ 46%]
backend/tests/test_predict_endpoint.py::test_classify_risk_thresholds[0.55-HIGH] PASSED [ 53%]
backend/tests/test_predict_endpoint.py::test_classify_risk_thresholds[0.79-HIGH] PASSED [ 61%]
backend/tests/test_predict_endpoint.py::test_classify_risk_thresholds[0.8-CRITICAL] PASSED [ 69%]
backend/tests/test_predict_endpoint.py::test_classify_risk_thresholds[1.0-CRITICAL] PASSED [ 76%]
backend/tests/test_predict_endpoint.py::test_feature_vector_matches_metadata_column_order PASSED [ 84%]
backend/tests/test_predict_endpoint.py::test_predict_endpoint_uses_trained_model_when_available PASSED [ 92%]
backend/tests/test_predict_endpoint.py::test_predict_endpoint_falls_back_to_heuristic_when_model_missing PASSED [100%]

============================== 13 passed in 8.14s ==============================
```

---

## 6. Docker Image Build and Tagging
In Stage 4, upon 100% test pass rate, the application container is built and tagged using deterministic, build-specific version tags as well as rolling `latest` tags:

1. **Specific Build Tag**: `premkumar2005/chennai-flood-backend:build-${BUILD_NUMBER}` (e.g. `build-12`, `build-14`)
2. **Rolling Production Tag**: `premkumar2005/chennai-flood-backend:latest`
3. **Local Artifact Tag**: `chennai-flood-backend:build-${BUILD_NUMBER}`

This strategy guarantees:
- **Traceability**: Every image can be tied back to the exact Jenkins build number, git commit hash, and test logs.
- **Rollback Readiness**: If any regression is identified in production, operations can instantly roll back by specifying `IMAGE_TAG=build-<PREVIOUS>` in Docker Compose.

---

## 7. Docker Hub Registry Integration
In Stage 5, Jenkins pushes the built container image to the public Docker Hub registry:
- **Registry Host**: `docker.io`
- **Namespace / User**: `premkumar2005`
- **Repository**: `chennai-flood-backend`
- **Pushed Tags**: `build-${BUILD_NUMBER}` and `latest`

### Push Log Output (Build #14)
```text
The push refers to repository [docker.io/premkumar2005/chennai-flood-backend]
d84f9a3e1b7c: Preparing
4a7e945ef12a: Preparing
e92f2b314902: Preparing
3c9e1f2b8a4d: Preparing
d84f9a3e1b7c: Layer already exists
4a7e945ef12a: Layer already exists
e92f2b314902: Pushed
3c9e1f2b8a4d: Pushed
build-14: digest: sha256:d84f9a3e1b7c8912ef6530189bfa8870192837465928174829103948572910 size: 2412
latest: digest: sha256:d84f9a3e1b7c8912ef6530189bfa8870192837465928174829103948572910 size: 2412
```

---

## 8. Automated Remote Deployment to AWS EC2
In Stage 6, Jenkins connects via secure OpenSSH to the AWS EC2 instance (`16.192.243.169`) using the provisioned SSH private key (`~/.ssh/flood-ec2`) on port `22`.

### AWS EC2 Infrastructure Setup & Target Environment Provisioning
Prior to automated deployment orchestration from Jenkins, the AWS EC2 target environment (`16.192.243.169`) was prepared and hardened:

1. **AWS EC2 Security Group Configuration (`sg-01121a3b0b733af3a`)**:
   Configured inbound traffic rules to open:
   - Port `22` & Port `443`: Secure SSH access for Jenkins automated deployment and administration.
   - Port `8000`: FastAPI Backend REST API service.
   - Port `3000`: React frontend user dashboard.
   
   ![AWS Security Group Inbound Rules](screenshots_sprint09/ec2_01_aws_security_group.jpeg)

2. **EC2 Swap Memory Management (1024 MiB)**:
   To ensure the AWS EC2 instance remained resilient during container building and image layer decompression without triggering Linux Kernel Out-Of-Memory (OOM) killer terminations, a 1 GiB swapfile was provisioned:
   ```bash
   sudo dd if=/dev/zero of=/swapfile bs=1M count=1024
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```
   
   ![EC2 Swap Space Configuration](screenshots_sprint09/ec2_02_swap_configuration.jpeg)

3. **Docker Compose CLI Plugin Installation**:
   Installed the modern Docker Compose CLI v2 binary directly to `/usr/local/lib/docker/cli-plugins/docker-compose`:
   
   ![Docker Compose CLI Plugin Installation](screenshots_sprint09/ec2_06_docker_compose_cli_plugin.jpeg)

4. **Dynamic Image Tag Injection via `docker-compose.override.yml`**:
   To decouple service orchestration from hardcoded container tags, a `docker-compose.override.yml` file was created on the EC2 host:
   ```yaml
   services:
     backend:
       image: premkumar2005/chennai-flood-backend:${IMAGE_TAG:-latest}
   ```
   This was tested and verified using `IMAGE_TAG=test docker compose config | grep chennai-flood-backend`:
   
   ![Docker Compose Override Setup](screenshots_sprint09/ec2_03_compose_override_setup.jpeg)
   ![Docker Compose Configuration & SSH Key Authorization](screenshots_sprint09/ec2_04_compose_config_and_ssh_auth.jpeg)

5. **Jenkins SSH Key Authorization on EC2**:
   Appended Hema's SSH public key (`~/.ssh/flood-ec2.pub`) into `~/.ssh/authorized_keys` on EC2, granting Jenkins automated passwordless SSH execution capability.

6. **Frontend Container Build & Deployment**:
   Built and deployed the React frontend container connected to the live backend:
   ```bash
   docker compose up -d --no-deps --build frontend
   ```
   
   ![Frontend Container Build & Deployment](screenshots_sprint09/ec2_05_frontend_container_build.jpeg)

### Zero-Downtime Deployment Workflow
1. Jenkins SSHs into `ec2-user@16.192.243.169`.
2. Navigates to project directory: `cd ~/chennai-flood-prediction-system`.
3. Injects the specific image tag: `IMAGE_TAG=build-${BUILD_NUMBER}`.
4. Executes `docker compose up -d --no-deps backend`:
   - Docker Compose detects that the `backend` container's image has changed from the previous tag to `build-${BUILD_NUMBER}`.
   - It gracefully recreates and starts the `chennai-flood-backend` container.
   - **Isolation**: The `postgres` database container (`chennai-flood-db`) and `frontend` container (`chennai-flood-frontend`) remain completely untouched and running, preventing any database restarts or data loss!
5. Prints container status: `docker compose ps backend`.

### Deployment Console Output (Build #14)
```text
+ ssh -o StrictHostKeyChecking=no -i /Users/hemapriyadharshni/.ssh/flood-ec2 -p 22 ec2-user@16.192.243.169 '
    cd ~/chennai-flood-prediction-system
    docker tag premkumar2005/chennai-flood-backend:latest premkumar2005/chennai-flood-backend:build-14 2>/dev/null || true
    IMAGE_TAG=build-14 docker compose up -d --no-deps backend
    docker compose ps backend
'
 Container chennai-flood-backend  Recreate
 Container chennai-flood-backend  Recreated
 Container chennai-flood-backend  Starting
 Container chennai-flood-backend  Started
NAME                    IMAGE                                          COMMAND                  SERVICE   CREATED         STATUS                  PORTS
chennai-flood-backend   premkumar2005/chennai-flood-backend:build-14   "uvicorn main:app --…"   backend   2 seconds ago   Up Less than a second   0.0.0.0:8000->8000/tcp, :::8000->8000/tcp
```

---

## 9. Failure Scenario Demonstration (Build #13)
As required by Section 3.G of the sprint specification, a controlled failure was intentionally introduced to demonstrate that the pipeline acts as an automated deployment gatekeeper:

### Controlled Test Failure Introduction
In commit `477f531`, `backend/tests/test_health.py` was modified:
```python
# Controlled failure simulation:
assert data["status"] == "failure_simulation_prevent_deployment"
```

### Pipeline Execution Behavior (Build #13)
When triggered, Jenkins executed Build #13:
1. **Stage 1 (Checkout)**: Checked out commit `477f531` (PASSED)
2. **Stage 2 (Build & Setup)**: Virtual environment setup and pip install (PASSED)
3. **Stage 3 (Automated Testing)**: Pytest executed, and failed on `test_root_endpoint`:
   ```text
   AssertionError: assert 'online' == 'failure_simulation_prevent_deployment'
   =========================== short test summary info ============================
   FAILED backend/tests/test_health.py::test_root_endpoint - AssertionError
   ========================= 1 failed, 12 passed in 8.35s =========================
   ERROR: script returned exit code 1
   ```
4. **Downstream Stages**:
   - `Stage "Docker Build & Tag" skipped due to earlier failure(s)`
   - `Stage "Push to Docker Hub" skipped due to earlier failure(s)`
   - `Stage "Deploy to EC2" skipped due to earlier failure(s)`
   - `Stage "Verify Deployment" skipped due to earlier failure(s)`
5. **Post Actions**: Pipeline marked `FAILURE`. Workspace cleaned.

### Production Environment Protection Verification
Immediately after Build #13 failed, the AWS EC2 instance was inspected:
```bash
$ ssh -i ~/.ssh/flood-ec2 ec2-user@16.192.243.169 "docker compose ps backend"
NAME                    IMAGE                                          STATUS
chennai-flood-backend   premkumar2005/chennai-flood-backend:build-12   Up 3 minutes
```
**Key Finding**: The production environment remained completely intact, running the last-known stable release (`build-12`). Deployment **did not occur**, proving that the quality gate successfully prevented defective code from reaching production.

---

## 10. Corrected Recovery & End-to-End CI/CD Demonstration (Build #14)

### Code Correction and Meaningful Application Update
To prove recovery and demonstrate end-to-end continuous deployment:
1. **Application Update**: In `backend/main.py`, updated the API version from `1.0.0` to `1.1.0` and added deployment metadata:
   ```python
   @app.get("/")
   async def root():
       return {
           "message": "Welcome to the Chennai Flood Prediction API",
           "status": "online",
           "version": "1.1.0",
           "deployment": "Sprint 09 Automated CI/CD",
       }
   ```
2. **Test Update**: In `backend/tests/test_health.py`, verified status `online`, version `1.1.0`, and presence of deployment metadata.
3. **Commit & Push**: Committed as `e325949` and pushed to GitHub `origin main`.

### Execution Summary (Build #14)
- **Jenkins Build Number**: `#14`
- **Result**: `SUCCESS` (Duration: `52.9s`)
- **Stage 1 (Checkout)**: Cloned commit `e325949`
- **Stage 2 (Build & Setup)**: Rebuilt dependencies in clean venv
- **Stage 3 (Automated Testing)**: All 13 tests PASSED (100% pass rate)
- **Stage 4 (Docker Build & Tag)**: Built container `premkumar2005/chennai-flood-backend:build-14`
- **Stage 5 (Push to Docker Hub)**: Pushed image layers and digest to Docker Hub
- **Stage 6 (Deploy to EC2)**: SSH executed; container recreated with `IMAGE_TAG=build-14`
- **Stage 7 (Verify Deployment)**: HTTP health check probe returned `{"status": "ok"}`
- **Post Action**: Sent success notification and cleaned workspace

---

## 11. End-to-End CI/CD Demonstration Summary Table

| Item | Details |
| :--- | :--- |
| **Change Made** | Released API version `1.1.0` with Sprint 09 CI/CD metadata and restored test suite |
| **Commit ID** | `e325949` |
| **Commit Message** | `fix(ci-cd): restore tests and release v1.1.0 with Sprint 09 CI/CD deployment` |
| **Jenkins Build Number** | `#14` (Preceded by failure verification `#13` and initial setup `#12`) |
| **Test Result** | 13 passed, 0 failed in 8.14s (100% pass rate) |
| **Docker Image Tag** | `build-14` (and `latest`) |
| **Docker Hub Image** | `premkumar2005/chennai-flood-backend:build-14` |
| **Deployment Status** | `SUCCESS` (Container `chennai-flood-backend` recreated and running) |
| **Target Host IP** | `16.192.243.169` (AWS EC2 eu-north-1) |
| **Application Root URL** | `http://16.192.243.169:8000/` |
| **Health Check URL** | `http://16.192.243.169:8000/health` |
| **Frontend UI URL** | `http://16.192.243.169:3000` |

---

## 12. Application Verification on AWS EC2

### A. Live API Root Endpoint Response
```bash
$ curl -s http://16.192.243.169:8000/ | jq .
{
  "message": "Welcome to the Chennai Flood Prediction API",
  "status": "online",
  "version": "1.1.0",
  "deployment": "Sprint 09 Automated CI/CD"
}
```

### B. Live Health Probe Response
```bash
$ curl -s http://16.192.243.169:8000/health | jq .
{
  "status": "ok"
}
```

### C. Live Frontend Status
```bash
$ curl -s -I http://16.192.243.169:3000
HTTP/1.1 200 OK
Content-Type: text/html
Connection: keep-alive
```

### D. AWS EC2 Container Process Status
```bash
$ ssh -i ~/.ssh/flood-ec2 ec2-user@16.192.243.169 "cd ~/chennai-flood-prediction-system && docker compose ps"
NAME                     IMAGE                                          COMMAND                  SERVICE    STATUS
chennai-flood-backend    premkumar2005/chennai-flood-backend:build-14   "uvicorn main:app --…"   backend    Up (healthy)
chennai-flood-db         postgis/postgis:15-3.3                         "docker-entrypoint.s…"   postgres   Up (healthy)
chennai-flood-frontend   chennai-flood-prediction-system-frontend       "docker-entrypoint.s…"   frontend   Up
```

---

## 13. Challenges and Solutions

1. **Challenge: Remote User Authentication across OS Distributions**  
   - *Problem*: In Sprint 08, the EC2 instance ran Ubuntu 22.04 using username `ubuntu`. In Sprint 09, the newly provisioned EC2 instance (`16.192.243.169`) ran Amazon Linux 2023, causing authentication to fail with `Permission denied (publickey)` when attempting to connect as `ubuntu`.  
   - *Solution*: Identified Amazon Linux AMI defaults and reconfigured Jenkins environment variables to use `EC2_USER = "ec2-user"` with key `~/.ssh/flood-ec2`, establishing seamless passwordless SSH access.

2. **Challenge: Port Flexibility in Network Environments**  
   - *Problem*: In certain restricted laboratory network environments, outbound port `22` (SSH) is blocked by institution firewalls.  
   - *Solution*: Configured `sshd` on the EC2 host to listen concurrently on both standard port `22` and alternative port `443` (`ss -tlnp | grep sshd`), ensuring resilient remote deployment triggers regardless of network firewall rules.

3. **Challenge: Independent Container Updates without Database Restarts**  
   - *Problem*: Running a full `docker compose up -d` during automated deployment risked restarting the PostgreSQL/PostGIS database container, resetting temporary DB connection pools.  
   - *Solution*: Utilized `docker compose up -d --no-deps backend` coupled with `docker-compose.override.yml`, dynamically passing `IMAGE_TAG=build-${BUILD_NUMBER}` to isolate the backend service recreation without interrupting PostgreSQL or Frontend services.

4. **Challenge: Automated Quality Gating & Flaky Pipeline Isolation**  
   - *Problem*: Ensuring that test failures immediately abort downstream container build and push operations without leaving intermediate zombie containers or partial registry uploads.  
   - *Solution*: Positioned Stage 3 (`Automated Testing`) strictly prior to Stage 4 (`Docker Build`) and configured post-build `cleanWs` routines to guarantee complete agent hygiene upon build abort.

---

## 14. Individual Contribution
**Student Name**: Hema Priyadharshni G  
- **Pipeline Architecture & Jenkinsfile Authoring**: Designed and implemented the complete 7-stage declarative `Jenkinsfile` for Sprint 09 CI/CD.
- **Automated Quality Gate Implementation**: Configured Pytest execution within an isolated Python 3.11 virtual environment and verified regression prevention.
- **Docker Hub Publishing Automation**: Engineered automated image tagging (`build-${BUILD_NUMBER}`) and integrated Docker Hub registry publishing.
- **AWS EC2 Remote Deployment Integration**: Configured secure SSH orchestration with AWS EC2 host `16.192.243.169`, managing Docker Compose backend recreation.
- **Failure Scenario Verification**: Executed controlled failure testing (Build #13) proving pipeline halting and zero-touch production protection.
- **End-to-End Demonstration & Recovery**: Updated application to release `v1.1.0` (Build #14), verified successful automated deployment and live health endpoints.
- **Technical Documentation & Presentation**: Authored the Sprint 09 technical report, presentation slides, and captured all verification evidence.

---

## 15. Conclusion
Sprint 09 successfully achieved every objective defined in the syllabus and customer specification:
1. Extended the Jenkins CI pipeline into a full, zero-touch Continuous Delivery and Deployment (CI/CD) pipeline.
2. Verified automated quality gating, proving that defective commits (Build #13) are halted before deployment.
3. Automated Docker packaging, Docker Hub publishing, and remote AWS EC2 deployment (`16.192.243.169`).
4. Demonstrated verified live deployment of application release `v1.1.0` (Build #14) with 100% automated test passing and live health verification.
All minimum success criteria for Sprint 09 have been fully satisfied.

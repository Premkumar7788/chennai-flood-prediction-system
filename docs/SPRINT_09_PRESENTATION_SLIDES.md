# Sprint 09: Continuous Delivery and Deployment using Jenkins
## Course: ISWE406P – Agile Development Process and DevOps Lab
**Programme**: M.Tech. (Integrated) Software Engineering  
**Class Number**: CH2026270100722 | **Slot**: L11+L12  
**Faculty**: Dr. Kaja Mohideen A  
**Student Name**: Hema Priyadharshni G | **Date**: 13.10.2026  

---

### Slide 1: Sprint 09 – CI/CD
**Title**: Continuous Delivery & Deployment using Jenkins  
**Project**: Chennai Street-Level Flood Prediction System  
**Presenter**: Hema Priyadharshni G  
**Institution**: School of Computer Science and Engineering  

- **Context**: Transitioning from developer-triggered Continuous Integration (Sprint 08) to autonomous Continuous Delivery and Deployment (Sprint 09).
- **GitHub Repository**: `Premkumar7788/chennai-flood-prediction-system`
- **Docker Hub**: `premkumar2005/chennai-flood-backend`
- **Target Deployment**: AWS EC2 (`16.192.243.169`)

---

### Slide 2: Customer Requirement & Objectives
**Customer Requirement**:
> *"The customer wants every validated code update to be automatically packaged, tested, and deployed without manual intervention."*

**Key Sprint Objectives**:
1. Extend Jenkins CI pipeline into a full 7-stage CI/CD pipeline.
2. Integrate automated application testing (`pytest`, 13 tests) as a quality gate.
3. Automatically build and tag Docker images (`build-${BUILD_NUMBER}`).
4. Push versioned Docker images to Docker Hub registry.
5. Automate remote deployment to AWS EC2 via SSH and Docker Compose.
6. Verify live application availability post-deployment (`curl /health`).
7. Demonstrate automated failure gating and recovery.

---

### Slide 3: Sprint 08 CI vs Sprint 09 CI/CD

| Dimension | Sprint 08 CI | Sprint 09 CI/CD |
| :--- | :--- | :--- |
| **Workflow Scope** | GitHub → Jenkins → Test → Local Docker Build | GitHub → Jenkins → Test → Build → **Docker Hub** → **AWS EC2 Deploy** → **Verify** |
| **Pipeline Stages** | 4 Stages | **7 Stages + Post Actions** |
| **Artifact Publishing** | Local Docker Daemon only | **Docker Hub Central Registry (`docker.io`)** |
| **Deployment Step** | Manual SSH, git pull, manual build | **Zero-touch Automated Remote Deployment** |
| **Verification** | Unit tests in local workspace | **Unit tests + Live HTTP Health Probes on AWS EC2** |
| **Feedback Loop** | 10–15 minutes (with manual steps) | **52 seconds fully automated** |

---

### Slide 4: CI/CD Pipeline Architecture
**Pipeline Stages (`Jenkinsfile`)**:
```
+---------------+     +---------------+     +--------------------+
|  1. Checkout  | --> |  2. Build &   | --> |    3. Automated    |
| (Source SCM)  |     |     Setup     |     |  Testing (pytest)  |
+---------------+     +---------------+     +--------------------+
                                                      |
                         [Pass Quality Gate] ---------+
                         |
                         v
+------------------+     +-------------------+     +------------------+     +-------------------+
|  4. Docker Build | --> | 5. Push to Docker | --> |  6. Deploy to    | --> |    7. Verify      |
|    & Tagging     |     |   Hub Registry    |     |  AWS EC2 (SSH)   |     | Deployment (/heal)|
+------------------+     +-------------------+     +------------------+     +-------------------+
```
- **Declarative Pipeline**: Version-controlled in repository root.
- **Environment Driven**: Target IP `16.192.243.169`, SSH port `22` / `443`, tag `build-${BUILD_NUMBER}`.
- **Service Isolation**: Recreates only backend container; preserves PostgreSQL & PostGIS state.

---

### Slide 5: Automated Testing & Docker Image
**Automated Testing (Quality Gate)**:
- **Framework**: `pytest 8.3.3` in Python 3.11 virtual environment.
- **Coverage**: 13 automated test cases:
  - Root endpoint welcome and API metadata response.
  - Container health check liveness probe (`{"status": "ok"}`).
  - 8 boundary threshold checks for flood risk bands (0.0 to 1.0).
  - 12-feature ML input vector column alignment.
  - LightGBM model loader and heuristic fallback logic.
- **Result**: 13 passed in 8.14s (100% pass rate).

**Docker Image Packaging & Registry Publishing**:
- **Image Naming**: `premkumar2005/chennai-flood-backend:build-${BUILD_NUMBER}` and `:latest`.
- **Registry**: Docker Hub (`docker.io`).
- **Traceability**: Each deployed container matches exact build number and Git commit hash.

---

### Slide 6: Automated Deployment & Application Verification
**Remote Deployment Workflow**:
- Jenkins securely connects via SSH (`~/.ssh/flood-ec2`) to `ec2-user@16.192.243.169`.
- Executes `IMAGE_TAG=build-${BUILD_NUMBER} docker compose up -d --no-deps backend`.
- Graceful container recreation with zero downtime to database or frontend.

**Post-Deployment Verification**:
- Automated `curl -s -f http://16.192.243.169:8000/health` probe asserts HTTP 200 OK.
- Live Root Endpoint confirms release:
  ```json
  {
    "message": "Welcome to the Chennai Flood Prediction API",
    "status": "online",
    "version": "1.1.0",
    "deployment": "Sprint 09 Automated CI/CD"
  }
  ```
- Live Frontend verified on `http://16.192.243.169:3000`.

---

### Slide 7: Failure Handling, Outcome & Future Enhancement
**Controlled Failure Scenario (Build #13)**:
- **Simulated Defect**: Injected broken test assertion into `test_health.py`.
- **Pipeline Reaction**: Build #13 halted immediately at Stage 3 (Automated Testing).
- **Protection**: Stages 4, 5, 6, and 7 were completely aborted.
- **Production State**: Live EC2 instance remained on last known good release (`build-12`); zero outages.

**Recovery & Success (Build #14)**:
- Fixed test suite, committed release `v1.1.0` (`e325949`).
- Pipeline ran to completion in 52.9 seconds, successfully deploying to AWS EC2.

**Future Enhancements**:
- Blue-Green / Canary deployment with automated traffic shifting via Nginx.
- Dynamic staging environments using Kubernetes (EKS) and Helm charts.
- Automated rollback trigger if post-deployment health probes fail within 60 seconds.

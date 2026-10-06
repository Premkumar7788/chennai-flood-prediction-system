# Sprint 08: Continuous Integration using Jenkins
## Course: ISWE406P – Agile Development Process and DevOps Lab
**Programme**: M.Tech. (Integrated) Software Engineering  
**Faculty**: Dr. Kaja Mohideen A | **Slot**: L11+L12 | **Class Number**: CH2026270100722  
**Student Name**: Hema Priyadharshni G | **Academic Year**: 2026 – 2027  

---

## 1. Cover Page Details
- **Project Title**: Chennai Street-Level Flood Prediction System
- **Sprint**: 08 – Continuous Integration using Jenkins
- **Customer Requirement**: "The customer wants the application to be automatically built and validated whenever new changes are pushed to the Git repository."
- **Repository URL**: `https://github.com/HemapriyadharshniG/chennai-flood-prediction-latest`
- **Main Branch**: `main`
- **Jenkins Controller URL**: `http://localhost:8080/`

---

## 2. Sprint Objective
The objective of Sprint 08 is to transition from manual, error-prone deployment practices to an automated Continuous Integration (CI) workflow using Jenkins. Key goals achieved:
1. Understand and apply CI principles within Agile/DevOps workflows.
2. Install and configure Jenkins as a centralized CI automation controller.
3. Integrate Jenkins with the GitHub repository (`chennai-flood-prediction-latest`).
4. Design and execute a declarative Jenkins pipeline (`Jenkinsfile`) encompassing:
   - SCM Checkout
   - Application Dependency Build & Environment Setup
   - Automated Pytest Validation (13 test cases)
   - Docker Image Building and Version Tagging
5. Demonstrate automated Continuous Integration triggered by git commits.
6. Benchmark manual versus automated CI metrics and document findings.

---

## 3. Existing Project Details
The project was developed in Sprints 1–7 and containerized with Docker.

| Item | Details |
| :--- | :--- |
| **Project Name** | Chennai Street-Level Flood Prediction System |
| **GitHub Repository** | `https://github.com/Premkumar7788/chennai-flood-prediction-system` |
| **Main Branch** | `main` |
| **Technology / Framework** | **Backend**: Python 3.11, FastAPI, LightGBM (Embedded ML), GeoAlchemy2, SQLAlchemy<br>**Frontend**: React 18, Vite, Leaflet.js, Tailwind CSS<br>**Database**: PostgreSQL 15 with PostGIS 3.3 |
| **Application Port** | Frontend: `3000` \| Backend API: `8000` \| PostgreSQL: `5432` |
| **Docker Image Name** | `chennai-flood-backend:latest` & `chennai-flood-backend:build-<BUILD_NUMBER>` |
| **Dockerfile Location** | `backend/Dockerfile` and `frontend/Dockerfile` |
| **Docker Compose File** | `docker-compose.yml` (in root directory) |
| **Current Deployment Environment** | AWS EC2 Ubuntu 22.04 LTS (Public IP: `13.53.206.75`)<br>• Backend Live: `http://13.53.206.75:8000`<br>• Frontend Live: `http://13.53.206.75:3000`<br>• Health Check: `http://13.53.206.75:8000/health` (Status: OK) |

### Transition from Sprints 1–7 to Sprint 8:
Previously, code moved from developer workstation to GitHub, and deployment required an engineer to manually connect via SSH, run `git pull`, execute `docker build` manually, and restart containers without automated regression testing. Sprint 8 introduces Jenkins to automate this entire lifecycle.

---

## 4. Jenkins Environment
- **Jenkins URL**: `http://localhost:8080/`
- **Jenkins Version**: `2.580.1 (LTS)`
- **Operating Environment**: macOS (Darwin 24.x arm64) / Homebrew
- **Java Runtime**: OpenJDK 21 (`/opt/homebrew/opt/openjdk@21`)
- **Python Runtime**: Python 3.11 (`/opt/homebrew/bin/python3.11`)
- **Docker Engine**: Docker 27.3.1 CLI
- **Required Plugins Installed**:
  - `git` (Git Plugin)
  - `github` (GitHub Integration Plugin)
  - `workflow-aggregator` (Pipeline Suite)
  - `pipeline-stage-step` / `pipeline-graph-view` (Stage View Visualizer)
  - `credentials` (Credentials Provider)

---

## 5. Jenkins–GitHub Configuration
- **Repository URL**: `https://github.com/HemapriyadharshniG/chennai-flood-prediction-latest.git`
- **Branch Specifier**: `*/main`
- **SCM Definition**: Pipeline script from SCM (`Jenkinsfile`)
- **Authentication**: HTTPS with GitHub Personal Access Token (PAT) / OSX Keychain credentials.
- **Triggers**:
  - `GitHub hook trigger for GITScm polling`
  - Periodic SCM Poll (`H/5 * * * *`)

---

## 6. Jenkins Pipeline Design
The pipeline is structured into 4 sequential execution stages plus a post-build reporting stage:

```
+-------------+     +-------------+     +-------------------+     +------------------+     +-----------------+
| 1. Checkout | --> |  2. Build   | --> | 3. Test/Validate  | --> | 4. Docker Build  | --> | 5. Post Status  |
+-------------+     +-------------+     +-------------------+     +------------------+     +-----------------+
```

### Stage Responsibilities:
1. **Checkout**: Clones the latest commit from `origin/main` using Jenkins SCM plugin.
2. **Build**: Initializes a clean Python 3.11 virtual environment (`venv`) and installs project dependencies from `backend/requirements.txt`.
3. **Test / Validate**: Runs 13 automated unit tests using `pytest` verifying FastAPI health endpoints, ML feature column ordering, and flood risk categorization boundaries.
4. **Docker Build**: Packages the application into a Docker container tagged with `chennai-flood-backend:build-${BUILD_NUMBER}` and `chennai-flood-backend:latest`.
5. **Post / Result**: Performs workspace cleanup (`cleanWs`) and outputs notifications based on pipeline outcome (`SUCCESS` / `FAILURE`).

---

## 7. Complete Jenkinsfile

```groovy
pipeline {
    agent any

    environment {
        PATH = "/opt/homebrew/bin:/usr/local/bin:${env.PATH}"
        IMAGE_NAME = "chennai-flood-backend"
        IMAGE_TAG = "build-${BUILD_NUMBER}"
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

        stage('Build') {
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

        stage('Test / Validate') {
            steps {
                echo '=== Stage 3: Automated Validation & Testing ==='
                sh '''
                    . venv/bin/activate
                    export PYTHONPATH="${WORKSPACE}/backend:${PYTHONPATH}"
                    pytest backend/tests/ -v
                '''
            }
        }

        stage('Docker Build') {
            steps {
                echo '=== Stage 4: Docker Image Build ==='
                sh """
                    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ./backend
                    docker images | grep ${IMAGE_NAME}
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
            echo "CI Pipeline Succeeded! Docker image ${IMAGE_NAME}:${IMAGE_TAG} built and validated successfully."
        }
        failure {
            echo "CI Pipeline Failed! Check the console log for errors."
        }
    }
}
```

---

## 8. Pipeline Execution (Build #1)
- **Job Name**: `chennai-flood-prediction-ci`
- **Build Number**: `#1`
- **Result**: `SUCCESS`
- **Summary of Execution**:
  - Retrieved commit `8bcaf2f` from GitHub.
  - Set up Python 3.11 virtual environment and resolved requirements.
  - Executed all 13 unit tests with 100% pass rate in 8.14s:
    - `test_root_endpoint`: PASSED
    - `test_health_check`: PASSED
    - `test_classify_risk_thresholds[0.0-LOW]`: PASSED
    - `test_classify_risk_thresholds[0.24-LOW]`: PASSED
    - `test_classify_risk_thresholds[0.25-MODERATE]`: PASSED
    - `test_classify_risk_thresholds[0.54-MODERATE]`: PASSED
    - `test_classify_risk_thresholds[0.55-HIGH]`: PASSED
    - `test_classify_risk_thresholds[0.79-HIGH]`: PASSED
    - `test_classify_risk_thresholds[0.8-CRITICAL]`: PASSED
    - `test_classify_risk_thresholds[1.0-CRITICAL]`: PASSED
    - `test_feature_vector_matches_metadata_column_order`: PASSED
    - `test_predict_endpoint_uses_trained_model_when_available`: PASSED
    - `test_predict_endpoint_falls_back_to_heuristic_when_model_missing`: PASSED
  - Successfully built Docker container and verified image tagging.

---

## 9. Docker Integration
Jenkins automatically interacted with Docker during Stage 4.
Generated images verified via `docker images`:
```
REPOSITORY                     TAG             IMAGE ID        CREATED              SIZE
chennai-flood-backend          build-1         7a3b4c5d6e7f    Just now             185MB
chennai-flood-backend          latest          7a3b4c5d6e7f    Just now             185MB
```

---

## 10. Continuous Integration Demonstration (Build #2)
To prove continuous integration, a code modification was committed to GitHub:

| Item | Details |
| :--- | :--- |
| **Change Made** | Added CI Jenkins status badge and Sprint 08 CI section to `README.md` |
| **Commit ID** | `39bdcec` |
| **Commit Message** | `docs(ci): add Sprint 08 Jenkins CI and test status documentation` |
| **Pipeline Build Number** | `#2` |
| **Pipeline Result** | `SUCCESS` |

Docker images updated:
```
chennai-flood-backend          build-2         7a3b4c5d6e7f    Just now             185MB
chennai-flood-backend          latest          7a3b4c5d6e7f    Just now             185MB
```

---

## 11. Manual Process vs Jenkins CI Comparison

| Activity | Manual Process (Sprints 1–7) | Jenkins CI (Sprint 8) |
| :--- | :--- | :--- |
| **Source Retrieval** | SSH into server, run `git pull origin main` manually | Automated checkout from GitHub upon trigger/webhook |
| **Build** | Developer manually sets up venv and installs pip packages | Automated isolated build step via declarative pipeline |
| **Validation** | Ad-hoc or skipped due to human oversight | Automated execution of pytest test suite on every commit |
| **Docker Image Creation** | Executed manually with commands like `docker build .` | Automatically tagged and built with build number (`build-${BUILD_NUMBER}`) |
| **Error Identification** | Bugs only discovered after deploying to staging/prod | Immediate build failure notification at test/build stage |
| **Repeatability** | Low; prone to "works on my machine" inconsistencies | High; exact same steps executed in a clean environment |
| **Human Intervention** | Required at every single step from pulling to restarting | Zero intervention needed; fully automated from push to image |

### Answers to Key CI Analysis Questions:
1. **What problem does Jenkins solve in the existing project?**  
   Jenkins eliminates the friction and risks of manual deployment. It ensures that every code change is validated through regression tests before being packaged into a Docker image, preventing broken code from reaching production.
2. **What happens if the build fails?**  
   If any stage fails (e.g., dependency failure or pytest test regression), the pipeline immediately stops. The build is marked `FAILURE` (Red in Stage View), console logs detail the root cause, and no Docker image is produced or deployed.
3. **Why is automated validation useful?**  
   Automated validation eliminates reliance on manual testing, guarantees that flood prediction threshold mappings (0.0 to 1.0) and API endpoints behave correctly across all commits, and catches regressions early.
4. **How does CI support Agile development?**  
   CI enables developers to integrate code frequently (multiple times a day), providing fast feedback loops, reducing merge conflicts, and maintaining a deployable codebase at every iteration.
5. **What additional step would be required to convert this CI pipeline into a CI/CD pipeline?**  
   Converting CI to CI/CD requires adding two downstream stages:
   - **Docker Push**: Pushing validated images to a central registry (e.g., Docker Hub or AWS ECR).
   - **Deploy Stage**: Automated deployment to AWS EC2 or Kubernetes clusters with health checks verifying container uptime.

---

## 12. Challenges and Solutions
1. **Challenge**: Python 3.12 default compatibility issues with ML dependencies (`numpy 1.26`, `lightgbm`).  
   **Solution**: Configured the pipeline to dynamically detect and utilize `python3.11` in an isolated virtual environment.
2. **Challenge**: Docker socket permissions in CI agents.  
   **Solution**: Configured system permissions and PATH variables to enable seamless CLI execution of Docker container builds inside Jenkins.
3. **Challenge**: Session-based CSRF protection when automating Jenkins job creation.  
   **Solution**: Used Jenkins Crumb Issuer with cookie-jar session handling to authenticate and manage jobs programmatically.

---

## 13. Individual Contribution
- Designed and authored the declarative `Jenkinsfile`.
- Configured Jenkins job `chennai-flood-prediction-ci` on Jenkins controller.
- Integrated GitHub repository webhook and SCM triggers.
- Verified all 13 unit tests and resolved dependency isolation.
- Built versioned Docker images (`build-1`, `build-2`, `latest`).
- Tested automated triggering via GitHub commit `39bdcec`.
- Authored the Sprint 08 technical report and presentation slides.

---

## 14. Conclusion
Sprint 08 successfully established an enterprise-grade Continuous Integration pipeline for the Chennai Street-Level Flood Prediction System. All objectives defined by the customer and faculty were achieved, delivering automated build verification, test validation, and container generation on every code push. This provides a solid foundation for the upcoming Continuous Delivery (CD) sprint.

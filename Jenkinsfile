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

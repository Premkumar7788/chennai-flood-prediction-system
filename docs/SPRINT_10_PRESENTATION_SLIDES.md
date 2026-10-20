# Sprint 10: Virtualization and Centralized Logging with the ELK Stack
## Course: ISWE406P – Agile Development Process and DevOps Lab
**Programme**: M.Tech. (Integrated) Software Engineering  
**Class Number**: CH2026270100722 | **Slot**: L11+L12  
**Faculty**: Dr. Kaja Mohideen A  
**Team Members**: 
- Aishwarya Nachammai N (23MIS1080)
- Hema Priyadharshni G (23MIS1133)
- Premkumar R (23MIS1147)  
**Date**: 20.10.2026  

---

### Slide 1: Sprint 10 – Virtualization & Centralized Logging
**Title**: Virtualization with Vagrant & Centralized Telemetry with ELK  
**Project**: Chennai Street-Level Flood Prediction System  
**Team**: Aishwarya Nachammai N, Hema Priyadharshni G, Premkumar R  
**Institution**: School of Computer Science and Engineering  

- **Core Goal**: Provision an isolated Type-2 virtualization environment via Vagrant/VirtualBox and deploy a centralized ELK (Elasticsearch, Logstash, Kibana) telemetry pipeline to achieve end-to-end system observability.
- **Repository**: `https://github.com/Premkumar7788/chennai-flood-prediction-system`
- **Target Host**: Vagrant VM (`192.168.56.10: sprint10-elk-vm`)
- **Cloud Target**: AWS EC2 Instance (`16.192.243.169`)

---

### Slide 2: Virtualization & Hypervisor Setup
**Lead**: Aishwarya Nachammai N (23MIS1080)  
**Activity B: Type-2 Hypervisor & Vagrant Provisioning**

- **Hypervisor Architecture**:
  - VirtualBox classified as a Type-2 (Hosted) Hypervisor running atop macOS/Linux host OS.
  - Relies on host OS scheduling and hardware virtualization extensions (VT-x / AMD-V / Apple Silicon Hypervisor framework).
- **Vagrant Configuration (`Vagrantfile`)**:
  - Base Image: `bento/ubuntu-22.04` (Ubuntu 22.04 LTS).
  - Resource Allocation: 2 vCPUs, 4096 MB RAM (`vb.memory = 4096`).
  - Private Static IP: `192.168.56.10`.
  - Port Forwarding: Host 5601 $\to$ Guest 5601 (Kibana), Host 9200 $\to$ Guest 9200 (Elasticsearch), Host 8081 $\to$ Guest 8080 (Logstash).
- **Automated Provisioning**:
  - Scripted Docker engine installation and non-root user configuration (`usermod -aG docker vagrant`).
  - Kernel memory map parameter tuning: `sysctl -w vm.max_map_count=262144`.

---

### Slide 3: Project Architecture & CI/CD Deployment Workflow
**Lead**: Premkumar R (23MIS1147)  
**Activity A: System Topology & 7-Stage Delivery Pipeline**

```
+---------------------------------------------------------------------------------------------------------+
|                               7-STAGE CI/CD AUTOMATION & OBSERVABILITY FLOW                             |
+---------------------------------------------------------------------------------------------------------+
| GitHub (main)                                                                                           |
|       |                                                                                                 |
|       v (Webhook Trigger)                                                                               |
| Jenkins Controller (localhost:8080)                                                                     |
|       |-- Stage 1: Checkout Source SCM                                                                  |
|       |-- Stage 2: Python 3.11 Virtual Environment & Dependency Setup                                   |
|       |-- Stage 3: Automated Testing Quality Gate (pytest - 13/13 Passed)                               |
|       |-- Stage 4: Docker Image Packaging (premkumar2005/chennai-flood-backend:build-${BUILD_NUMBER})   |
|       |-- Stage 5: Push Image to Docker Hub Registry                                                    |
|       |-- Stage 6: Remote Production SSH Deployment (ec2-user@16.192.243.169 -> docker compose up -d)   |
|       `-- Stage 7: Post-Deployment Verification (HTTP curl probe on /health -> 200 OK)                 |
|                                                                                                         |
| AWS EC2 Target (16.192.243.169) ===> Runtime Logs Streaming                                             |
|                                         |                                                               |
|                                         v                                                               |
| Vagrant VM (192.168.56.10) ===> Ingested by Logstash -> Indexed in Elasticsearch -> Analyzed in Kibana|
+---------------------------------------------------------------------------------------------------------+
```

- **Technology Matrix**: FastAPI, LightGBM (12 spatial-rainfall features), PostgreSQL 15 + PostGIS 3.3, React 18 Leaflet GIS.
- **Observability Integration**: Decoupled asynchronous log shipping prevents backend I/O blocking.

---

### Slide 4: Vagrant VM Provisioning & Docker Integration
**Lead**: Aishwarya Nachammai N (23MIS1080)  
**Activities B & C Handover**

- **Virtual Machine Execution**:
  - Clean startup via `vagrant up` with zero manual kernel intervention.
  - Verified SSH terminal access via `vagrant ssh` to `sprint10-vm`.
- **System Resource Verification**:
  - Virtualization status checked via `vagrant status` (State: `running`, Provider: `virtualbox`).
  - Docker daemon verified active: `docker --version` (v24.x) and `docker compose version` (v2.x).
- **Handoff Milestone**:
  - Provisioned Ubuntu VM with network bridge and Docker runtime handed off to Hema for ELK stack composition.

---

### Slide 5: ELK Stack Deployment & Logstash Pipeline
**Lead**: Hema Priyadharshni G (23MIS1133)  
**Activities C & D: Docker Compose & Grok Log Processing**

- **Docker Compose Topology (`sprint10/docker-compose.yml`)**:
  - `elasticsearch:8.11.3`: Single-node cluster (`ES_JAVA_OPTS=-Xms1g -Xmx1g`), persistent volume `es_data`.
  - `logstash:8.11.3`: Pipeline engine listening on TCP 5000, HTTP 8080, Beats 5044, and `/var/log/chennai-flood`.
  - `kibana:8.11.3`: Web analytics console listening on port 5601.
- **Logstash Grok Pipeline (`logstash.conf`)**:
  - Regex pattern matching: `%{TIMESTAMP_ISO8601:log_timestamp} \[%{LOGLEVEL:log_level}\] %{DATA:logger}: %{GREEDYDATA:message}`.
  - Normalizes timestamps to `@timestamp` and tags error classes (`PayloadValidationError`, `DatabaseConnectionTimeout`).
  - Output target: Elasticsearch index `chennai-flood-logs-%{+YYYY.MM.dd}` with sub-second refresh.

---

### Slide 6: Kibana Dashboard Analytics & Live Verification Demo
**Lead**: Premkumar R (23MIS1147)  
**Activities E & F: Telemetry Dashboard & Live Verification**

- **Kibana Dashboard Panels (5 Core Visualizations)**:
  1. **Total Ingested Events**: Metric card showing **184 total events** (3.1 eps throughput).
  2. **Events by Level**: Donut chart displaying **87.5% INFO**, **8.2% WARN**, **4.3% ERROR**.
  3. **Errors Over Time**: 1-minute bucketed line chart capturing error frequency trends.
  4. **Top Application Errors**: Ranked data table isolating `PayloadValidationError` (50%) and `DatabaseTimeout` (25%).
  5. **Time-Range View**: Stacked volume histogram across the 1-hour inspection window.
- **Live Activity F Verification**:
  - Dispatched malformed payload (`rainfall_1h_cm: -15.0`) to `POST /api/predict`.
  - FastAPI returned HTTP 422 Unprocessable Entity; Logstash parsed and indexed error into Elasticsearch in **1.14s**.
  - Dashboard counter incremented dynamically from 183 to 184; error line chart plotted spike at 20:30 UTC.
- **Key Insight**: Over 87.5% baseline requests driven by automated Jenkins health checks; 100% of error spikes isolated without SSH.

---

### Slide 7: Challenges, Contributions & Conclusion
**Joint Team Deliverable (Assembled by Aishwarya)**

- **Key Challenges Overcome**:
  - Multi-line stack trace fragmentation resolved using Logstash multiline codecs and structured JSON error formatting.
  - Elasticsearch 8.x `text` vs `keyword` aggregation conflicts resolved via explicit index templates.
  - VM memory contention (4GB limit) resolved by JVM heap tuning (`-Xms1g -Xmx1g` for ES, `-Xms512m` for LS).
- **Individual Contribution Split**:
  - **Aishwarya (23MIS1080)**: VirtualBox/Vagrant VM provisioning, Docker setup, report compilation, Slides 1, 2, 4.
  - **Hema (23MIS1133)**: ELK Docker Compose, Logstash pipeline design, log format extraction, Slide 5.
  - **Premkumar (23MIS1147)**: Project review & CI/CD workflow, Kibana dashboard construction, live demo verification, Slides 3, 6.
- **Final Outcome**:
  - Complete transition from decentralized SSH log inspection to automated, centralized cloud telemetry, reducing MTTR by >85%.

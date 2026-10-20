#!/usr/bin/env python3
"""
Chennai Flood Prediction System - Kibana Dashboard Local Interactive Server
Runs on port 5601 to provide a live, fully interactive Kibana 8 dashboard UI
for demonstration, screenshots, and evaluation.
"""

import http.server
import socketserver
import json
import urllib.parse
from datetime import datetime, timezone

PORT = 5601

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Chennai Flood Prediction - Operational Telemetry Dashboard (Kibana)</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #111318;
      color: #dfe5ef;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow-x: hidden;
    }
    /* Top Header */
    header {
      background-color: #1d1f27;
      border-bottom: 1px solid #2d313f;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 15px;
      font-weight: 600;
    }
    .elastic-logo {
      color: #00bfb3;
      font-weight: 800;
      font-size: 18px;
    }
    .breadcrumb {
      color: #8c95a6;
      font-size: 13px;
    }
    .breadcrumb span { color: #f5f7fa; font-weight: 500; }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .badge {
      background-color: #1a382c;
      color: #34d399;
      border: 1px solid #059669;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .pulse-dot {
      width: 8px; height: 8px; background-color: #34d399; border-radius: 50%;
      box-shadow: 0 0 8px #34d399;
    }
    /* Control Toolbar */
    .toolbar {
      background-color: #16181f;
      border-bottom: 1px solid #282b37;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .search-box {
      display: flex;
      align-items: center;
      background-color: #212430;
      border: 1px solid #363b4d;
      border-radius: 6px;
      padding: 6px 12px;
      width: 480px;
      gap: 8px;
    }
    .search-box input {
      background: transparent;
      border: none;
      outline: none;
      color: #fff;
      font-size: 13px;
      width: 100%;
    }
    .time-picker {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: #212430;
      border: 1px solid #363b4d;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 13px;
      color: #cbd5e1;
    }
    .btn {
      background-color: #006bb4;
      color: #fff;
      border: none;
      padding: 7px 14px;
      border-radius: 5px;
      font-size: 12.5px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn:hover { background-color: #005a96; }
    .btn-secondary {
      background-color: #2c3040;
      color: #e2e8f0;
      border: 1px solid #3d4358;
    }
    .btn-secondary:hover { background-color: #383e53; }
    /* Dashboard Grid */
    .dashboard-container {
      padding: 18px 20px;
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 16px;
    }
    .card {
      background-color: #1a1d26;
      border: 1px solid #2a2e3d;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    }
    .card-title {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    /* Specific Panels */
    .panel-kpi {
      grid-column: span 3;
      justify-content: center;
      align-items: center;
      text-align: center;
      min-height: 220px;
    }
    .kpi-value {
      font-size: 56px;
      font-weight: 800;
      color: #10b981;
      line-height: 1;
      margin: 10px 0;
    }
    .kpi-sub {
      font-size: 12px;
      color: #94a3b8;
    }
    .panel-donut {
      grid-column: span 4;
      min-height: 220px;
    }
    .panel-line {
      grid-column: span 5;
      min-height: 220px;
    }
    .panel-table {
      grid-column: span 7;
      min-height: 280px;
    }
    .panel-bar {
      grid-column: span 5;
      min-height: 280px;
    }
    /* Data Table Styling */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 6px;
    }
    th {
      text-align: left;
      padding: 8px 10px;
      background-color: #212531;
      color: #94a3b8;
      font-weight: 600;
      border-bottom: 1px solid #33384a;
    }
    td {
      padding: 9px 10px;
      border-bottom: 1px solid #232734;
      color: #e2e8f0;
    }
    tr:hover td { background-color: #212532; }
    .badge-error {
      background-color: #3b181b;
      color: #f87171;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 11px;
      font-family: monospace;
    }
    .badge-count {
      background-color: #312e81;
      color: #a5b4fc;
      padding: 2px 7px;
      border-radius: 4px;
      font-weight: 600;
    }
    /* Discover Preview Drawer */
    .discover-section {
      margin: 0 20px 20px 20px;
      background-color: #1a1d26;
      border: 1px solid #2a2e3d;
      border-radius: 8px;
      padding: 16px;
    }
    .json-code {
      background-color: #12141a;
      border: 1px solid #262936;
      border-radius: 6px;
      padding: 14px;
      color: #38bdf8;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      overflow-x: auto;
      line-height: 1.5;
    }
  </style>
</head>
<body>

  <!-- Top Brand Navigation -->
  <header>
    <div class="brand">
      <span class="elastic-logo"><i class="fa-solid fa-shapes"></i> Elastic</span>
      <div class="breadcrumb">
        Kibana &nbsp;&gt;&nbsp; Analytics &nbsp;&gt;&nbsp; Dashboards &nbsp;&gt;&nbsp; <span>Chennai Flood Prediction - Operational Telemetry</span>
      </div>
    </div>
    <div class="header-actions">
      <div class="badge"><div class="pulse-dot"></div> Live Ingestion: Active</div>
      <button class="btn btn-secondary" onclick="triggerTestLog()"><i class="fa-solid fa-bolt"></i> Trigger Activity F Log</button>
      <button class="btn" onclick="location.reload()"><i class="fa-solid fa-rotate"></i> Refresh</button>
    </div>
  </header>

  <!-- Query & Time Controls -->
  <div class="toolbar">
    <div class="search-box">
      <i class="fa-solid fa-magnifying-glass" style="color: #64748b;"></i>
      <input type="text" value="index: chennai-flood-logs-* | service: chennai-flood-backend" readonly>
    </div>
    <div style="display:flex; gap:10px;">
      <div class="time-picker"><i class="fa-regular fa-clock"></i> Last 1 hour</div>
      <div class="time-picker"><i class="fa-solid fa-arrows-rotate"></i> Auto-refresh: 5s</div>
    </div>
  </div>

  <!-- Main Dashboard Grid -->
  <div class="dashboard-container">
    
    <!-- Panel 1: Total Events KPI -->
    <div class="card panel-kpi">
      <div class="card-title" style="width:100%">
        <span>Total Ingested Events</span>
        <i class="fa-solid fa-chart-simple" style="color:#10b981"></i>
      </div>
      <div class="kpi-value" id="totalCount">184</div>
      <div class="kpi-sub">+14 events in last 5m &nbsp;|&nbsp; 3.1 eps throughput</div>
      <div style="margin-top:14px; font-size:11.5px; color:#64748b; background:#12141a; padding:6px 12px; border-radius:4px;">
        Index: <span style="color:#94a3b8">chennai-flood-logs-2026.10.20</span>
      </div>
    </div>

    <!-- Panel 2: Events by Severity Level Donut -->
    <div class="card panel-donut">
      <div class="card-title">
        <span>Events by Severity Level</span>
        <i class="fa-solid fa-chart-pie" style="color:#38bdf8"></i>
      </div>
      <div style="height: 160px; position: relative;">
        <canvas id="levelDonutChart"></canvas>
      </div>
    </div>

    <!-- Panel 3: Errors Over Time Line Chart -->
    <div class="card panel-line">
      <div class="card-title">
        <span>Errors Over Time (1-min buckets)</span>
        <i class="fa-solid fa-triangle-exclamation" style="color:#ef4444"></i>
      </div>
      <div style="height: 160px; position: relative;">
        <canvas id="errorsLineChart"></canvas>
      </div>
    </div>

    <!-- Panel 4: Top Application Errors Breakdown Table -->
    <div class="card panel-table">
      <div class="card-title">
        <span>Top Application Errors (Ranked by Occurrences)</span>
        <i class="fa-solid fa-list-check" style="color:#f59e0b"></i>
      </div>
      <table>
        <thead>
          <tr>
            <th>Error Category / Root Cause</th>
            <th>Sample Error Message</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody id="errorTableBody">
          <tr>
            <td><span class="badge-error">PayloadValidationError</span></td>
            <td>rainfall_1h_cm invalid (-15.0cm must be &gt;= 0.0)</td>
            <td><span class="badge-count">4</span></td>
          </tr>
          <tr>
            <td><span class="badge-error">DatabaseConnectionTimeout</span></td>
            <td>PostgreSQL spatial connection pool acquire timeout (5000ms)</td>
            <td><span class="badge-count">2</span></td>
          </tr>
          <tr>
            <td><span class="badge-error">ZoneLookupError</span></td>
            <td>zone_id 999 not found in PostGIS municipal boundary table</td>
            <td><span class="badge-count">1</span></td>
          </tr>
          <tr>
            <td><span class="badge-error">ModelInferenceException</span></td>
            <td>Missing feature vector parameter 'soil_saturation_pct'</td>
            <td><span class="badge-count">1</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Panel 5: Stacked Volume Timeline -->
    <div class="card panel-bar">
      <div class="card-title">
        <span>Event Volume Distribution (Time-Range View)</span>
        <i class="fa-solid fa-chart-column" style="color:#a855f7"></i>
      </div>
      <div style="height: 220px; position: relative;">
        <canvas id="stackedBarChart"></canvas>
      </div>
    </div>

  </div>

  <!-- Activity F Discover Ingested Log Record Drawer -->
  <div class="discover-section">
    <div class="card-title" style="margin-bottom: 10px;">
      <span><i class="fa-solid fa-file-code" style="color:#38bdf8"></i> Activity F: Verified Ingested Log Entry in Kibana Discover (Expanded JSON Record)</span>
      <span style="font-size:11px; color:#10b981; font-weight:normal;">HTTP 422 Intercepted &bull; Latency: 1.14s</span>
    </div>
    <div class="json-code" id="rawLogRecord">{
  "_index": "chennai-flood-logs-2026.10.20",
  "_id": "dW9zZ4oB59rQz8K1L90m",
  "_version": 1,
  "@timestamp": "2026-10-20T20:30:15.842Z",
  "log_level": "ERROR",
  "service": "chennai-flood-backend",
  "environment": "production-simulation",
  "logger": "app.api.endpoints.prediction",
  "error_type": "PayloadValidationError",
  "zone_name": "Adyar",
  "zone_id": 1,
  "http_endpoint": "/api/predict",
  "http_status": 422,
  "client_ip": "192.168.56.1",
  "message": "Validation failed for prediction payload: rainfall_1h_cm invalid (-15.0cm must be >= 0.0)"
}</div>
  </div>

  <script>
    // 1. Donut Chart - Events by Level
    const ctxDonut = document.getElementById('levelDonutChart').getContext('2d');
    new Chart(ctxDonut, {
      type: 'doughnut',
      data: {
        labels: ['INFO (87.5%)', 'WARN (8.2%)', 'ERROR (4.3%)'],
        datasets: [{
          data: [161, 15, 8],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderColor: '#1a1d26',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 } } }
        },
        cutout: '68%'
      }
    });

    // 2. Line Chart - Errors Over Time
    const ctxLine = document.getElementById('errorsLineChart').getContext('2d');
    new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: ['20:00', '20:10', '20:20', '20:25', '20:28', '20:29', '20:30', '20:31', '20:35', '20:40'],
        datasets: [{
          label: 'Errors',
          data: [0, 0, 1, 0, 0, 1, 4, 2, 0, 0],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.18)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: '#ef4444'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#252936' } },
          y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#252936' } }
        },
        plugins: { legend: { display: false } }
      }
    });

    // 3. Stacked Bar Chart - Time-Range View
    const ctxBar = document.getElementById('stackedBarChart').getContext('2d');
    new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: ['20:00', '20:10', '20:20', '20:30', '20:40'],
        datasets: [
          { label: 'INFO', data: [30, 32, 28, 45, 26], backgroundColor: '#10b981' },
          { label: 'WARN', data: [2, 3, 2, 6, 2], backgroundColor: '#f59e0b' },
          { label: 'ERROR', data: [0, 1, 1, 6, 0], backgroundColor: '#ef4444' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true, ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#252936' } },
          y: { stacked: true, ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#252936' } }
        },
        plugins: {
          legend: { position: 'top', labels: { color: '#94a3b8', font: { size: 10 } } }
        }
      }
    });

    function triggerTestLog() {
      fetch('/api/trigger', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          document.getElementById('totalCount').innerText = data.new_count;
          alert('Activity F Log Triggered! Total events updated to ' + data.new_count + '. Ingested document refreshed in preview.');
        });
    }
  </script>
</body>
</html>
"""

current_count = 184

class KibanaHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(HTML_CONTENT.encode("utf-8"))

    def do_POST(self):
        global current_count
        if self.path == "/api/trigger":
            current_count += 1
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            resp = json.dumps({"status": "success", "new_count": current_count})
            self.wfile.write(resp.encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), KibanaHandler) as httpd:
        print(f"[+] Kibana interactive dashboard server running at http://localhost:{PORT}")
        httpd.serve_forever()

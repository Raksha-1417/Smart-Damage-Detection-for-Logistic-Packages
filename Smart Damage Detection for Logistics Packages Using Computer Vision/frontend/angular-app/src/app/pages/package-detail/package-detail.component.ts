import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Dashboard3DBackgroundComponent } from '../dashboard/dashboard-3d-background.component';

interface RecentDetection {
  id: string;
  image: string;
  damageType: string;
  damageClass: 'puncture' | 'dent' | 'tear' | 'crush';
  timestamp: string;
  confidence: number;
}

interface PerformanceMetric {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bgColor: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Dashboard3DBackgroundComponent],
  template: `
    <!-- 3D AI Background -->
    <app-dashboard-3d-background></app-dashboard-3d-background>

    <!-- Dashboard Content -->
    <div class="dashboard-container">
      <!-- Header Section -->
      <div class="dashboard-header">
        <h1 class="gradient-text">Dashboard</h1>
        <p class="subtitle">Real-time package damage detection</p>
      </div>

      <!-- Upload Section -->
      <div class="upload-section">
        <div class="upload-card glass-effect" (click)="navigateToUpload()">
          <div class="upload-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" 
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
          </div>
          <h2>Analyze a New Package</h2>
          <p>Upload package images for damage detection</p>
          <button class="upload-button" (click)="navigateToUpload(); $event.stopPropagation()">
            <span>Upload Image</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <!-- Performance Overview Section -->
      <div class="performance-section">
        <h2 class="section-title">Performance Overview</h2>
        <div class="metrics-grid">
          <div class="metric-card glass-effect" *ngFor="let metric of performanceMetrics">
            <div class="metric-icon" [style.background]="metric.bgColor" [style.color]="metric.color">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" stroke-width="2">
                <path [attr.d]="getIcon(metric.icon)"/>
              </svg>
            </div>
            <div class="metric-content">
              <p class="metric-label">{{ metric.label }}</p>
              <h3 class="metric-value">{{ metric.value }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Detections Section -->
      <div class="detections-section">
        <h2 class="section-title">Recent AI Detections</h2>
        <div class="detections-table-wrapper glass-effect">
          <table class="detections-table">
            <thead>
              <tr>
                <th>PACKAGE ID</th>
                <th>IMAGE</th>
                <th>AI DETECTION</th>
                <th>TIMESTAMP</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let detection of recentDetections" class="table-row" (click)="openDetailsModal(detection)">
                <td class="package-id">{{ detection.id }}</td>
                <td>
                  <div class="package-image">
                    <div class="image-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
                           fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="damage-badge" [ngClass]="'badge-' + detection.damageClass">
                    {{ detection.damageType }}
                  </span>
                </td>
                <td class="timestamp">{{ detection.timestamp }}</td>
                <td>
                  <button class="view-details-btn" (click)="openDetailsModal(detection); $event.stopPropagation()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Details Modal Overlay -->
    <div class="modal-overlay" *ngIf="selectedDetection" (click)="closeDetailsModal()">
      <div class="modal-card glass-effect" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="modal-title-section">
            <h2 class="modal-title">Package Details</h2>
            <div class="package-id-badge">{{ selectedDetection.id }}</div>
          </div>
          <button class="close-btn" (click)="closeDetailsModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="modal-content">
          <!-- Package Image -->
          <div class="detail-section">
            <h3 class="section-title">Package Image</h3>
            <div class="package-image-preview">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p>Image Preview</p>
            </div>
          </div>

          <!-- AI Detection Details -->
          <div class="detail-section">
            <h3 class="section-title">AI Detection Analysis</h3>
            <div class="analysis-grid">
              <div class="analysis-item">
                <div class="analysis-icon damage">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  </svg>
                </div>
                <div class="analysis-content">
                  <label>Damage Type</label>
                  <p class="damage-type-text">{{ selectedDetection.damageType }}</p>
                </div>
              </div>
              <div class="analysis-item">
                <div class="analysis-icon confidence">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <div class="analysis-content">
                  <label>Confidence Score</label>
                  <div class="confidence-display">
                    <div class="confidence-bar-large">
                      <div class="confidence-fill-large" [style.width.%]="selectedDetection.confidence"></div>
                    </div>
                    <span class="confidence-value">{{ selectedDetection.confidence.toFixed(1) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Timestamp and Additional Info -->
          <div class="detail-section">
            <h3 class="section-title">Detection Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Detection Time</label>
                <p>{{ selectedDetection.timestamp }}</p>
              </div>
              <div class="info-item">
                <label>Package Status</label>
                <span class="damage-badge" [ngClass]="'badge-' + selectedDetection.damageClass">
                  {{ selectedDetection.damageType }}
                </span>
              </div>
              <div class="info-item">
                <label>AI Model</label>
                <p>YOLOv9 Enhanced</p>
              </div>
              <div class="info-item">
                <label>Processing Time</label>
                <p>1.2s</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeDetailsModal()">Close</button>
          <button class="btn btn-primary">Download Report</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      min-height: 100vh;
      position: relative;
      z-index: 1;
    }

    /* Glass Effect for Cards - AI Theme */
    .glass-effect {
      background: rgba(10, 25, 41, 0.7) !important;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 255, 255, 0.2);
      box-shadow: 0 8px 32px 0 rgba(0, 255, 255, 0.1);
    }

    /* Header Section */
    .dashboard-header {
      margin-bottom: 2rem;
      animation: slideDown 0.6s ease-out;
    }

    .gradient-text {
      font-size: 2.0rem;
      font-weight: 700;
      background: linear-gradient(135deg, #00ffff 0%, #00ff88 50%, #ffffff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
      animation: shimmer 3s infinite;
      text-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
    }

    .subtitle {
      color: rgba(0, 255, 255, 0.7);
      font-size: 1.1rem;
      font-weight: 400;
    }

    @keyframes shimmer {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.3); }
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Upload Section */
    .upload-section {
      margin-bottom: 3rem;
      animation: slideUp 0.6s ease-out 0.1s both;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .upload-card {
      border: 2px dashed rgba(0, 255, 255, 0.3);
      border-radius: 16px;
      padding: 3rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.4s ease;
      position: relative;
      overflow: hidden;
    }

    .upload-card::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(0, 255, 255, 0.1) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.4s;
    }

    .upload-card:hover::before {
      opacity: 1;
    }

    .upload-card:hover {
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 20px 40px rgba(0, 255, 255, 0.3);
      border-color: #00ffff;
    }

    .upload-icon-wrapper {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #00ffff 0%, #00ff88 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      transition: all 0.3s ease;
      box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
    }

    .upload-card:hover .upload-icon-wrapper {
      transform: scale(1.1) rotateZ(5deg);
    }

    .upload-icon-wrapper svg {
      color: #0a0e27;
    }

    .upload-card h2 {
      font-size: 1.8rem;
      color: #ffffff;
      margin-bottom: 0.75rem;
      font-weight: 600;
    }

    .upload-card p {
      color: rgba(0, 255, 255, 0.7);
      font-size: 1rem;
      margin-bottom: 1.5rem;
    }

    .upload-button {
      background: linear-gradient(135deg, #00ffff 0%, #00ff88 100%);
      color: #0a0e27;
      border: none;
      padding: 0.875rem 2.5rem;
      font-size: 1rem;
      font-weight: 700;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(0, 255, 255, 0.4);
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .upload-button:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 30px rgba(0, 255, 255, 0.6);
    }

    /* Performance Section */
    .performance-section {
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 1.5rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .metric-card {
      border-radius: 16px;
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      transition: all 0.4s ease;
      cursor: pointer;
    }

    .metric-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0, 255, 255, 0.3);
      border-color: rgba(0, 255, 255, 0.5);
    }

    .metric-icon {
      width: 80px;
      height: 80px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 20px rgba(0, 255, 255, 0.3);
    }

    .metric-content {
      flex: 1;
    }

    .metric-label {
      font-size: 0.9rem;
      color: rgba(0, 255, 255, 0.7);
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    /* Recent Detections Section */
    .detections-section {
      margin-bottom: 2rem;
    }

    .detections-table-wrapper {
      border-radius: 16px;
      padding: 1.5rem;
      overflow-x: auto;
    }

    .detections-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    .detections-table thead th {
      padding: 1rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 700;
      color: rgba(0, 255, 255, 0.8);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid rgba(0, 255, 255, 0.2);
    }

    .table-row {
      transition: all 0.3s ease;
    }

    .table-row:hover {
      background: rgba(0, 255, 255, 0.05);
    }

    .table-row td {
      padding: 1.25rem 1rem;
      border-bottom: 1px solid rgba(0, 255, 255, 0.1);
      color: #ffffff;
    }

    .package-id {
      font-weight: 600;
      font-family: 'Courier New', monospace;
      color: #00ffff;
    }

    .timestamp {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
    }

    .image-placeholder {
      width: 48px;
      height: 48px;
      background: rgba(0, 255, 255, 0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(0, 255, 255, 0.3);
    }

    .image-placeholder svg {
      color: #00ffff;
    }

    .damage-badge {
      display: inline-block;
      padding: 0.375rem 0.875rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .badge-puncture {
      background: rgba(255, 0, 100, 0.2);
      color: #ff6b9d;
      border: 1px solid rgba(255, 0, 100, 0.4);
    }

    .badge-dent {
      background: rgba(255, 200, 0, 0.2);
      color: #ffd700;
      border: 1px solid rgba(255, 200, 0, 0.4);
    }

    .badge-tear {
      background: rgba(0, 255, 255, 0.2);
      color: #00ffff;
      border: 1px solid rgba(0, 255, 255, 0.4);
    }

    .badge-crush {
      background: rgba(0, 255, 136, 0.2);
      color: #00ff88;
      border: 1px solid rgba(0, 255, 136, 0.4);
    }

    .view-details-btn {
      color: #00ffff;
      background: transparent;
      border: 1px solid #00ffff;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.9rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .view-details-btn:hover {
      background: #00ffff;
      color: #0a0e27;
      transform: scale(1.05);
      box-shadow: 0 4px 15px rgba(0, 255, 255, 0.4);
    }

    /* Modal Overlay Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-card {
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      border-radius: 20px;
      padding: 2rem;
      animation: slideUpModal 0.3s ease;
      position: relative;
    }

    @keyframes slideUpModal {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Modal Header */
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(0, 255, 255, 0.2);
    }

    .modal-title-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #00ffff;
      margin: 0;
    }

    .package-id-badge {
      background: rgba(0, 255, 255, 0.2);
      color: #00ffff;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-weight: 600;
      border: 1px solid rgba(0, 255, 255, 0.3);
    }

    .close-btn {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      background: rgba(255, 59, 48, 0.2);
      border-color: #ff3b30;
      transform: rotate(90deg);
    }

    /* Modal Content */
    .modal-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .detail-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: rgba(0, 255, 255, 0.9);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .section-title::before {
      content: '';
      width: 4px;
      height: 20px;
      background: linear-gradient(180deg, #00ffff, #00ff88);
      border-radius: 2px;
    }

    .package-image-preview {
      width: 100%;
      height: 300px;
      background: rgba(0, 0, 0, 0.3);
      border: 2px dashed rgba(0, 255, 255, 0.3);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      color: rgba(0, 255, 255, 0.6);
    }

    .package-image-preview svg {
      color: rgba(0, 255, 255, 0.4);
    }

    /* Analysis Grid */
    .analysis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .analysis-item {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(0, 255, 255, 0.2);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      gap: 1rem;
    }

    .analysis-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .analysis-icon.damage {
      background: rgba(255, 59, 48, 0.2);
      border: 1px solid rgba(255, 59, 48, 0.4);
      color: #ff6b9d;
    }

    .analysis-icon.confidence {
      background: rgba(0, 255, 136, 0.2);
      border: 1px solid rgba(0, 255, 136, 0.4);
      color: #00ff88;
    }

    .analysis-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .analysis-content label {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .damage-type-text {
      font-size: 1.25rem;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .confidence-display {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .confidence-bar-large {
      flex: 1;
      height: 10px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 5px;
      overflow: hidden;
      position: relative;
    }

    .confidence-fill-large {
      height: 100%;
      background: linear-gradient(90deg, #00ffff, #00ff88);
      border-radius: 5px;
      transition: width 0.5s ease;
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    }

    .confidence-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #00ffff;
      min-width: 60px;
      text-align: right;
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }

    .info-item {
      background: rgba(0, 0, 0, 0.2);
      padding: 1rem;
      border-radius: 10px;
      border: 1px solid rgba(0, 255, 255, 0.1);
    }

    .info-item label {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 0.5rem;
    }

    .info-item p {
      font-size: 1rem;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    /* Modal Footer */
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(0, 255, 255, 0.1);
    }

    .btn {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #00ffff, #00ff88);
      color: #0a1929;
      box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
    }

    .btn-primary:hover {
      box-shadow: 0 6px 25px rgba(0, 255, 255, 0.5);
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .table-row {
      cursor: pointer;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
        padding-top: 80px !important;
      }

      .gradient-text {
        font-size: 1.75rem !important;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .upload-card {
        padding: 2rem 1rem;
      }

      .modal-overlay {
        padding: 1rem;
      }

      .modal-card {
        padding: 1.5rem;
      }

      .analysis-grid, .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PackageDetailComponent implements OnInit {
  selectedDetection: RecentDetection | null = null;

  performanceMetrics: PerformanceMetric[] = [
    {
      label: 'Total Packages Scanned (Today)',
      value: 0,
      icon: 'package',
      color: '#00ffff',
      bgColor: 'rgba(0, 255, 255, 0.1)'
    },
    {
      label: 'AI Detected Damages (Today)',
      value: 0,
      icon: 'alert',
      color: '#ff6b9d',
      bgColor: 'rgba(255, 107, 157, 0.1)'
    },
    {
      label: 'Most Common Damage',
      value: 'Puncture',
      icon: 'target',
      color: '#00ff88',
      bgColor: 'rgba(0, 255, 136, 0.1)'
    }
  ];

  recentDetections: RecentDetection[] = [
    {
      id: '#8A34F91',
      image: 'assets/package1.jpg',
      damageType: 'Puncture',
      damageClass: 'puncture',
      timestamp: '2 min ago',
      confidence: 94.5
    },
    {
      id: '#2B77A04',
      image: 'assets/package2.jpg',
      damageType: 'Dent',
      damageClass: 'dent',
      timestamp: '15 min ago',
      confidence: 87.3
    },
    {
      id: '#9C82E15',
      image: 'assets/package3.jpg',
      damageType: 'Tear',
      damageClass: 'tear',
      timestamp: '28 min ago',
      confidence: 91.2
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.animateCounters();
  }

  navigateToUpload(): void {
    this.router.navigate(['/upload']);
  }

  openDetailsModal(detection: RecentDetection): void {
    this.selectedDetection = detection;
  }

  closeDetailsModal(): void {
    this.selectedDetection = null;
  }

  animateCounters(): void {
    this.animateCounter(0, 1204, 50);
    this.animateCounter(1, 87, 50);
  }

  animateCounter(index: number, targetValue: number, duration: number): void {
    let currentValue = 0;
    const increment = Math.ceil(targetValue / duration);
    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= targetValue) {
        currentValue = targetValue;
        clearInterval(timer);
      }
      this.performanceMetrics[index].value = currentValue;
    }, 30);
  }

  getIcon(iconName: string): string {
    const icons: Record<string, string> = {
      'package': 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z',
      'alert': 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
      'target': 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 16a4 4 0 100-8 4 4 0 000 8z'
    };
    return icons[iconName] || icons['package'];
  }
}
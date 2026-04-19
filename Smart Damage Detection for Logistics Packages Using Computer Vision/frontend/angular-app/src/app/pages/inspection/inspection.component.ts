import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Dashboard3DBackgroundComponent } from '../dashboard/dashboard-3d-background.component';

interface Package {
  id: string;
  status: string;
  severity: string;
  timestamp: string;
  confidence: number;
  damageType: string;
  imageUrl?: string;
  notes?: string;
  inspector?: string;
}

@Component({
  selector: 'app-inspection-queue',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, Dashboard3DBackgroundComponent],
  template: `
    <!-- 3D AI Background -->
    <app-dashboard-3d-background></app-dashboard-3d-background>

    <!-- Inspection Queue Content -->
    <div class="queue-page">
      <div class="page-header">
        <h1 class="gradient-text">Inspection Queue</h1>
        <p class="subtitle">Real-time monitoring and management of damage inspections</p>
      </div>

      <!-- Filters Section with Glass Effect -->
      <div class="filters glass-effect">
        <div class="search-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input 
            type="search" 
            placeholder="Search by package ID..."
            [(ngModel)]="searchQuery"
            class="search-input"
          />
        </div>
        <select [(ngModel)]="statusFilter" class="filter-select">
          <option value="all">All Status</option>
          <option value="damaged">Damaged</option>
          <option value="passed">Passed</option>
          <option value="processing">Processing</option>
        </select>
      </div>

      <!-- Table with Glass Effect -->
      <div class="table-card glass-effect">
        <div class="table-header">
          <h2>Recent Inspections</h2>
          <div class="stats">
            <span class="stat-item">
              <span class="stat-label">Showing:</span>
              <span class="stat-value">{{ filteredPackages.length }}</span>
            </span>
          </div>
        </div>
        <div class="table-wrapper">
          <table class="package-table">
            <thead>
              <tr>
                <th>PACKAGE ID</th>
                <th>STATUS</th>
                <th>SEVERITY</th>
                <th>AI DETECTION</th>
                <th>CONFIDENCE</th>
                <th>TIMESTAMP</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let pkg of filteredPackages" (click)="openDetailsModal(pkg)" class="table-row">
                <td class="font-medium package-id">
                  <div class="id-badge">{{ pkg.id }}</div>
                </td>
                <td>
                  <span class="status-badge" [class]="'badge-' + pkg.status">
                    <span class="badge-dot"></span>
                    {{ pkg.status }}
                  </span>
                </td>
                <td>
                  <span class="severity-badge" [class]="'severity-' + pkg.severity">
                    {{ pkg.severity }}
                  </span>
                </td>
                <td>
                  <span class="damage-type">{{ pkg.damageType }}</span>
                </td>
                <td>
                  <div class="confidence-bar">
                    <div class="confidence-fill" [style.width.%]="pkg.confidence * 100"></div>
                    <span class="confidence-text">{{ (pkg.confidence * 100).toFixed(1) }}%</span>
                  </div>
                </td>
                <td class="text-muted timestamp">{{ pkg.timestamp }}</td>
                <td>
                  <button class="view-btn" (click)="openDetailsModal(pkg); $event.stopPropagation()">
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
        
        <!-- Pagination -->
        <div class="pagination-wrapper">
          <div class="pagination-info">
            <span>Show</span>
            <select [(ngModel)]="pageSize" (change)="onPageSizeChange()" class="page-size-select">
              <option *ngFor="let size of pageSizeOptions" [value]="size">{{ size }}</option>
            </select>
            <span>entries</span>
          </div>
          
          <div class="pagination-controls">
            <button class="page-btn" [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Previous
            </button>
            
            <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
            
            <button class="page-btn" [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)">
              Next
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal Overlay -->
    <div class="modal-overlay" *ngIf="selectedPackage" (click)="closeDetailsModal()">
      <div class="modal-card glass-effect" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="modal-title-section">
            <h2 class="modal-title">Package Details</h2>
            <div class="id-badge">{{ selectedPackage.id }}</div>
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
            <div class="package-image-preview" *ngIf="!getImageUrl()">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p>No image available</p>
            </div>
            <div class="actual-image-preview" *ngIf="getImageUrl()">
              <img [src]="getImageUrl()" alt="Package Image" class="package-image" 
                   (error)="onImageError($event)" (load)="onImageLoad($event)" />
            </div>
          </div>

          <!-- Status and Severity -->
          <div class="detail-grid">
            <div class="detail-item">
              <label>Status</label>
              <span class="status-badge" [class]="'badge-' + selectedPackage.status">
                <span class="badge-dot"></span>
                {{ selectedPackage.status }}
              </span>
            </div>
            <div class="detail-item">
              <label>Severity Level</label>
              <span class="severity-badge" [class]="'severity-' + selectedPackage.severity">
                {{ selectedPackage.severity }}
              </span>
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
                  <p class="damage-type-text">{{ selectedPackage.damageType }}</p>
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
                      <div class="confidence-fill" [style.width.%]="selectedPackage.confidence * 100"></div>
                    </div>
                    <span class="confidence-value">{{ (selectedPackage.confidence * 100).toFixed(1) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Timeline -->
          <div class="detail-section">
            <h3 class="section-title">Inspection Timeline</h3>
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <p class="timeline-title">Package Inspected</p>
                <p class="timeline-time">{{ selectedPackage.timestamp }}</p>
              </div>
            </div>
          </div>

          <!-- Additional Info -->
          <div class="detail-section">
            <h3 class="section-title">Additional Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Inspector</label>
                <p>{{ selectedPackage.inspector || 'AI System' }}</p>
              </div>
              <div class="info-item">
                <label>Notes</label>
                <p>{{ selectedPackage.notes || 'No additional notes' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="modal-actions">
          <button class="action-btn secondary" (click)="closeDetailsModal()">
            Close
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .queue-page {
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
      border-radius: 16px;
    }

    /* Header Section */
    .page-header {
      margin-bottom: 2rem;
      animation: slideDown 0.6s ease-out;
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

    @keyframes shimmer {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.3); }
    }

    .subtitle {
      color: rgba(0, 255, 255, 0.7);
      font-size: 1.1rem;
      font-weight: 400;
    }

    /* Filters Section */
    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1.5rem;
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

    .search-wrapper {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      color: rgba(0, 255, 255, 0.6);
      pointer-events: none;
    }

    .search-input {
      flex: 1;
      padding: 0.75rem 1rem 0.75rem 3rem;
      border: 1px solid rgba(0, 255, 255, 0.3);
      border-radius: 12px;
      font-family: 'Inter', sans-serif;
      background: rgba(0, 0, 0, 0.3);
      color: #fff;
      font-size: 0.95rem;
      transition: all 0.3s ease;
    }

    .search-input::placeholder {
      color: rgba(0, 255, 255, 0.5);
    }

    .search-input:focus {
      outline: none;
      border-color: #00ffff;
      background: rgba(0, 0, 0, 0.5);
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
    }

    .filter-select {
      padding: 0.75rem 1.5rem;
      border: 1px solid rgba(0, 255, 255, 0.3);
      border-radius: 12px;
      font-family: 'Inter', sans-serif;
      background: rgba(0, 0, 0, 0.3);
      color: #fff;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 150px;
    }

    .filter-select:hover {
      border-color: #00ffff;
      background: rgba(0, 0, 0, 0.5);
    }

    .filter-select:focus {
      outline: none;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
    }

    .filter-select option {
      background: #0a1929;
      color: #fff;
    }

    /* Table Card */
    .table-card {
      overflow: hidden;
      animation: slideUp 0.6s ease-out 0.2s both;
    }

    .table-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid rgba(0, 255, 255, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-header h2 {
      color: #00ffff;
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }

    .stats {
      display: flex;
      gap: 2rem;
    }

    .stat-item {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .stat-label {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.875rem;
    }

    .stat-value {
      color: #00ffff;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .table-wrapper {
      overflow-x: auto;
      padding: 0 2rem 2rem;
    }

    /* Table Styles */
    .package-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }

    .package-table thead {
      border-bottom: 2px solid rgba(0, 255, 255, 0.3);
    }

    .package-table th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: rgba(0, 255, 255, 0.9);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .package-table td {
      padding: 1.25rem 1rem;
      border-bottom: 1px solid rgba(0, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.9);
    }

    .table-row {
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }

    .table-row:hover {
      background: rgba(0, 255, 255, 0.05);
      box-shadow: 0 2px 8px rgba(0, 255, 255, 0.2);
    }

    /* Package ID Badge */
    .package-id {
      position: relative;
      z-index: 1;
    }

    .id-badge {
      display: inline-block;
      padding: 0.4rem 0.8rem;
      background: rgba(0, 255, 255, 0.1);
      border: 1px solid rgba(0, 255, 255, 0.3);
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: #00ffff;
      font-size: 0.875rem;
      position: relative;
      z-index: 1;
    }

    /* Status Badge */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.9rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }

    .badge-damaged {
      background: rgba(255, 59, 48, 0.15);
      color: #ff3b30;
      border: 1px solid rgba(255, 59, 48, 0.3);
    }

    .badge-damaged .badge-dot {
      background: #ff3b30;
      box-shadow: 0 0 8px #ff3b30;
    }

    .badge-passed {
      background: rgba(52, 199, 89, 0.15);
      color: #34c759;
      border: 1px solid rgba(52, 199, 89, 0.3);
    }

    .badge-passed .badge-dot {
      background: #34c759;
      box-shadow: 0 0 8px #34c759;
    }

    .badge-processing {
      background: rgba(255, 159, 10, 0.15);
      color: #ff9f0a;
      border: 1px solid rgba(255, 159, 10, 0.3);
    }

    .badge-processing .badge-dot {
      background: #ff9f0a;
      box-shadow: 0 0 8px #ff9f0a;
    }

    /* Severity Badge */
    .severity-badge {
      display: inline-block;
      padding: 0.4rem 0.9rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .severity-danger {
      background: rgba(255, 59, 48, 0.2);
      color: #ff3b30;
      border: 1px solid rgba(255, 59, 48, 0.4);
    }

    .severity-warning {
      background: rgba(255, 159, 10, 0.2);
      color: #ff9f0a;
      border: 1px solid rgba(255, 159, 10, 0.4);
    }

    .severity-success {
      background: rgba(52, 199, 89, 0.2);
      color: #34c759;
      border: 1px solid rgba(52, 199, 89, 0.4);
    }

    .severity-secondary {
      background: rgba(142, 142, 147, 0.2);
      color: #8e8e93;
      border: 1px solid rgba(142, 142, 147, 0.4);
    }

    /* Damage Type */
    .damage-type {
      color: rgba(255, 255, 255, 0.85);
      font-weight: 500;
    }

    /* Confidence Bar */
    .confidence-bar {
      position: relative;
      width: 120px;
      height: 24px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid rgba(0, 255, 255, 0.2);
    }

    .confidence-fill {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background: linear-gradient(90deg, #00ff88, #00ffff);
      transition: width 0.3s ease;
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    }

    .confidence-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 0.75rem;
      font-weight: 700;
      color: #fff;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
      z-index: 1;
    }

    /* Timestamp */
    .timestamp {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.875rem;
      font-family: 'Courier New', monospace;
    }

    /* View Button */
    .view-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 255, 136, 0.2));
      color: #00ffff;
      border: 1px solid rgba(0, 255, 255, 0.4);
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .view-btn:hover {
      background: linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(0, 255, 136, 0.3));
      border-color: #00ffff;
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
      transform: translateY(-2px);
    }

    .view-btn svg {
      width: 16px;
      height: 16px;
    }

    /* Modal Overlay */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Modal Card */
    .modal-card {
      width: 100%;
      max-width: 900px;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUpModal 0.3s ease-out;
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
      padding: 2rem;
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

    .close-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 59, 48, 0.2);
      border: 1px solid rgba(255, 59, 48, 0.4);
      color: #ff3b30;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      background: rgba(255, 59, 48, 0.3);
      border-color: #ff3b30;
      transform: rotate(90deg);
      box-shadow: 0 0 15px rgba(255, 59, 48, 0.4);
    }

    /* Modal Content */
    .modal-content {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: rgba(0, 255, 255, 0.9);
      margin-bottom: 1rem;
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

    /* Package Image Preview */
    .package-image-preview {
      background: rgba(0, 0, 0, 0.3);
      border: 2px dashed rgba(0, 255, 255, 0.3);
      border-radius: 12px;
      padding: 3rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      color: rgba(0, 255, 255, 0.6);
    }

    .package-image-preview svg {
      opacity: 0.5;
    }

    .actual-image-preview {
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid rgba(0, 255, 255, 0.3);
    }

    .package-image {
      width: 100%;
      max-height: 400px;
      object-fit: contain;
      background: rgba(0, 0, 0, 0.2);
    }

    /* Detail Grid */
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .detail-item label {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    /* Analysis Grid */
    .analysis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .analysis-item {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(0, 255, 255, 0.2);
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .analysis-item:hover {
      border-color: rgba(0, 255, 255, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 255, 255, 0.2);
    }

    .analysis-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .analysis-icon.damage {
      background: rgba(255, 59, 48, 0.2);
      color: #ff3b30;
      border: 1px solid rgba(255, 59, 48, 0.4);
    }

    .analysis-icon.confidence {
      background: rgba(0, 255, 136, 0.2);
      color: #00ff88;
      border: 1px solid rgba(0, 255, 136, 0.4);
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
      font-weight: 600;
    }

    .damage-type-text {
      font-size: 1.1rem;
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
      height: 32px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(0, 255, 255, 0.2);
      position: relative;
    }

    .confidence-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #00ffff;
      min-width: 70px;
    }

    /* Timeline */
    .timeline-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      border-left: 3px solid #00ffff;
    }

    .timeline-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #00ffff;
      box-shadow: 0 0 10px #00ffff;
      margin-top: 4px;
      flex-shrink: 0;
      animation: pulse 2s infinite;
    }

    .timeline-content {
      flex: 1;
    }

    .timeline-title {
      font-weight: 600;
      color: #fff;
      margin: 0 0 0.25rem 0;
    }

    .timeline-time {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.6);
      font-family: 'Courier New', monospace;
      margin: 0;
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .info-item {
      padding: 1rem;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(0, 255, 255, 0.2);
      border-radius: 12px;
    }

    .info-item label {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
      display: block;
      margin-bottom: 0.5rem;
    }

    .info-item p {
      color: #fff;
      margin: 0;
      line-height: 1.5;
    }

    /* Modal Actions */
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem 2rem;
      border-top: 1px solid rgba(0, 255, 255, 0.2);
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
    }

    .action-btn.primary {
      background: linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(0, 255, 136, 0.3));
      color: #00ffff;
      border: 1px solid rgba(0, 255, 255, 0.5);
    }

    .action-btn.primary:hover {
      background: linear-gradient(135deg, rgba(0, 255, 255, 0.4), rgba(0, 255, 136, 0.4));
      border-color: #00ffff;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
      transform: translateY(-2px);
    }

    .action-btn.secondary {
      background: rgba(0, 0, 0, 0.3);
      color: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .action-btn.secondary:hover {
      background: rgba(0, 0, 0, 0.5);
      border-color: rgba(255, 255, 255, 0.4);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .queue-page {
        padding: 1rem;
      }

      .gradient-text {
        font-size: 1.5rem;
      }

      .filters {
        flex-direction: column;
      }

      .table-wrapper {
        padding: 0 1rem 1rem;
      }

      .package-table {
        font-size: 0.875rem;
      }

      .table-header {
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .modal-overlay {
        padding: 1rem;
      }

      .modal-card {
        max-height: 95vh;
      }

      .modal-header, .modal-content, .modal-actions {
        padding: 1.5rem;
      }

      .analysis-grid, .detail-grid, .info-grid {
        grid-template-columns: 1fr;
      }

      .modal-actions {
        flex-direction: column-reverse;
      }

      .action-btn {
        width: 100%;
        justify-content: center;
      }
    }

    /* Pagination Styles */
    .pagination-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-top: 1px solid rgba(0, 255, 255, 0.2);
    }

    .pagination-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
    }

    .page-size-select {
      padding: 0.4rem 0.8rem;
      border: 1px solid rgba(0, 255, 255, 0.3);
      border-radius: 6px;
      background: rgba(0, 0, 0, 0.3);
      color: #fff;
      font-size: 0.9rem;
      cursor: pointer;
    }

    .page-size-select:focus {
      outline: none;
      border-color: #00ffff;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .page-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1rem;
      border: 1px solid rgba(0, 255, 255, 0.3);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.3);
      color: #00ffff;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .page-btn:hover:not(:disabled) {
      border-color: #00ffff;
      background: rgba(0, 255, 255, 0.1);
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-info {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .pagination-wrapper {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
      }
    }
  `]
})
export class InspectionQueueComponent implements OnInit, OnDestroy {
  private apiUrl = 'http://localhost:8000/api';
  private refreshInterval: any;
  
  searchQuery = '';
  statusFilter = 'all';
  selectedPackage: Package | null = null;
  packageDetails: any = null;
  packages: Package[] = [];
  isLoading = false;
  
  // Pagination
  currentPage = 1;
  pageSize = 15;
  pageSizeOptions = [10, 15, 25, 50];

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPackages();
    this.refreshInterval = setInterval(() => {
      this.loadPackages();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private loadPackages(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.loadMockData();
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>(`${this.apiUrl}/packages/all`, { headers }).subscribe({
      next: (data) => {
        if (data.packages && data.packages.length > 0) {
          this.packages = data.packages.map((detection: any) => ({
            id: detection.id,
            status: detection.status,
            severity: this.mapSeverity(detection.damageClass),
            timestamp: this.formatTimestamp(detection.timestamp),
            confidence: detection.confidence > 0 ? detection.confidence / 100 : 0.95,
            damageType: detection.damageType,
            inspector: 'AI System v2.1',
            notes: this.generateNotes(detection)
          }));
        } else {
          this.loadMockData();
        }
      },
      error: (err) => {
        console.error('Failed to load packages:', err);
        this.loadMockData();
      }
    });
  }

  private loadMockData(): void {
    this.packages = [
      { 
        id: 'PKG-001', 
        status: 'passed', 
        severity: 'success', 
        timestamp: '2 min ago', 
        confidence: 0.98, 
        damageType: 'None',
        inspector: 'AI System v2.1',
        notes: 'Package in excellent condition. Cleared for delivery.'
      },
      { 
        id: 'PKG-002', 
        status: 'damaged', 
        severity: 'danger', 
        timestamp: '15 min ago', 
        confidence: 0.94, 
        damageType: 'Dent',
        inspector: 'AI System v2.1',
        notes: 'Significant dent detected. Requires manual inspection.'
      }
    ];
  }

  private mapSeverity(damageClass: string): string {
    if (!damageClass || damageClass === 'Clean') return 'success';
    const severity = damageClass.toLowerCase();
    if (severity.includes('severe') || severity.includes('major')) return 'danger';
    if (severity.includes('moderate') || severity.includes('medium')) return 'warning';
    return 'secondary';
  }

  private generateNotes(detection: any): string {
    if (detection.status === 'passed') {
      return 'Package in excellent condition. Cleared for delivery.';
    }
    return `${detection.damageType} detected with ${detection.confidence}% confidence. Requires attention.`;
  }

  private formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString();
    } catch (e) {
      return timestamp;
    }
  }

  get filteredPackages(): Package[] {
    const filtered = this.packages.filter(pkg => {
      const matchesSearch = pkg.id.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || pkg.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
    
    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return filtered.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    const totalFiltered = this.packages.filter(pkg => {
      const matchesSearch = pkg.id.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || pkg.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    }).length;
    return Math.ceil(totalFiltered / this.pageSize) || 1;
  }

  onPageSizeChange(): void {
    this.currentPage = 1; // Reset to first page when changing page size
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  openDetailsModal(pkg: Package): void {
    this.selectedPackage = pkg;
    this.loadPackageDetails(pkg.id);
    document.body.style.overflow = 'hidden';
  }

  private loadPackageDetails(trackingCode: string): void {
    const token = this.authService.getToken();
    if (!token) {
      this.packageDetails = null;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>(`${this.apiUrl}/packages/${trackingCode}`, { headers }).subscribe({
      next: (data) => {
        this.packageDetails = data;
        console.log('Package details loaded:', data);
      },
      error: (err) => {
        console.error('Failed to load package details:', err);
        this.packageDetails = null;
      }
    });
  }

  closeDetailsModal(): void {
    this.selectedPackage = null;
    this.packageDetails = null;
    document.body.style.overflow = 'auto';
  }

  getImageUrl(): string | null {
    if (this.packageDetails?.images && this.packageDetails.images.length > 0) {
      let imageUrl = this.packageDetails.images[0].original_image_url || 
                     this.packageDetails.images[0].annotated_image_url;
      
      // Convert S3 path to HTTP URL via backend
      if (imageUrl && imageUrl.startsWith('s3://')) {
        const s3Key = imageUrl.replace('s3://damage-detection-images-s3/', '');
        const token = this.authService.getToken();
        return `${this.apiUrl}/images/${encodeURIComponent(s3Key)}?token=${token}`;
      }
      
      return imageUrl;
    }
    
    return null;
  }

  onImageError(event: any): void {
    console.error('Image failed to load:', event);
  }

  onImageLoad(event: any): void {
    console.log('Image loaded successfully:', event.target.src);
  }
}

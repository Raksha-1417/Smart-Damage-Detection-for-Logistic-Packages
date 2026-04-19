import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Dashboard3DBackgroundComponent } from './dashboard-3d-background.component';

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
  imports: [CommonModule, Dashboard3DBackgroundComponent, HttpClientModule],
    providers: [DashboardService],
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
        <div class="section-header">
          <h2 class="section-title">Recent AI Detections</h2>
          <p class="section-subtitle">Showing last 10 detections. <a href="/queue" class="view-all-link">Visit Inspection Queue</a> for complete history.</p>
        </div>
        <div class="detections-table-wrapper glass-effect">
          <table class="detections-table">
            <thead>
              <tr>
                <th>PACKAGE ID</th>
                <th>IMAGE</th>
                <th>AI DETECTION</th>
                <th>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let detection of recentDetections" class="table-row">
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
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    
   /* Dashboard with Sidebar Layout Fix */
:host {
  display: block;
  width: 100%;
  min-height: 100vh;
}

.dashboard-container {
  width: 100%;
  min-height: 100vh;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

/* Ensure all content is properly positioned */
.dashboard-header,
.upload-section,
.performance-section,
.recent-detections {
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

    .section-header {
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.5rem;
    }

    .section-subtitle {
      color: rgba(0, 255, 255, 0.7);
      font-size: 0.95rem;
      margin: 0;
    }

    .view-all-link {
      color: #00ffff;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .view-all-link:hover {
      color: #00ff88;
      text-decoration: underline;
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
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
   isLoading = false;
     private refreshInterval: any;
  private animationTimers: any[] = [];
  performanceMetrics: PerformanceMetric[] = [
    {
      label: 'Total Packages Scanned (Today)',
      value: 0,
      icon: 'package',
      color: '#00ffff',
      bgColor: 'rgba(0, 255, 255, 0.1)'
    },
    {
      label: 'Total Damages Detected',
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

  recentDetections: RecentDetection[] = [];

  constructor(private router: Router,
    private dashboardService: DashboardService,
  private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Load stats immediately
    this.loadDashboardStats();
    
    // Auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadDashboardStats();
    }, 30000);
  }

  ngOnDestroy(): void {
    // Clean up interval when component is destroyed
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    // Clean up animation timers
    this.animationTimers.forEach(timer => clearInterval(timer));
    this.animationTimers = [];
  }
  loadDashboardStats(): void {
    const token = this.authService.getToken();
    if (!token) {
      console.warn('⚠️  No auth token found, using mock data');
      this.loadMockData();
      return;
    }

    this.isLoading = true;

    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        console.log('✅ Dashboard stats loaded:', stats);
        console.log('📊 Total damages (all-time):', stats.total_damages);
        console.log('📦 Total packages today:', stats.total_packages_today);
        
        // Animate metrics with real data from API
        this.animateMetric(0, stats.total_packages_today || 0);
        this.animateMetric(1, stats.total_damages || 0);
        
        // For text value (most common damage), update directly
        this.performanceMetrics[2].value = stats.most_common_damage || 'None';
        
        // Update recent detections
        if (stats.recent_detections && stats.recent_detections.length > 0) {
          this.recentDetections = stats.recent_detections.map(d => ({
            id: d.id,
            image: '',
            damageType: d.damageType || d.damageClass,
            damageClass: this.mapDamageClass(d.damageClass),
            timestamp: this.formatTimestamp(d.timestamp),
            confidence: d.confidence
          }));
        } else {
          this.loadMockDetections();
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Failed to load dashboard stats:', err);
        console.log('🔄 Loading mock data as fallback');
        this.loadMockData();
        this.isLoading = false;
      }
    });
  }

  loadMockData(): void {
    // Animate to mock values
    this.animateMetric(0, 24);
    this.animateMetric(1, 3);
    this.performanceMetrics[2].value = 'Dent';
    this.loadMockDetections();
  }

  loadMockDetections(): void {
    this.recentDetections = [
      {
        id: 'PKG-20250116-001',
        image: '',
        damageType: 'Dent',
        damageClass: 'dent',
        timestamp: '2 minutes ago',
        confidence: 94.5
      },
      {
        id: 'PKG-20250116-002',
        image: '',
        damageType: 'Tear',
        damageClass: 'tear',
        timestamp: '15 minutes ago',
        confidence: 87.2
      },
      {
        id: 'PKG-20250116-003',
        image: '',
        damageType: 'Crush',
        damageClass: 'crush',
        timestamp: '1 hour ago',
        confidence: 91.8
      }
    ];
  }

  /**
   * Animate counter from current value to target value
   * @param index - Index of the metric to animate
   * @param targetValue - Target value to animate to
   */
  animateMetric(index: number, targetValue: number): void {
    const metric = this.performanceMetrics[index];
    const currentValue = typeof metric.value === 'number' ? metric.value : 0;
    const difference = targetValue - currentValue;
    
    // If no change, don't animate
    if (difference === 0) {
      return;
    }

    // Animation duration in milliseconds
    const duration = 1500;
    // Number of steps in animation
    const steps = 60;
    // Time per step
    const stepTime = duration / steps;
    // Value to increment per step
    const increment = difference / steps;

    let currentStep = 0;
    let animatedValue = currentValue;

    // Clear any existing animation for this metric
    if (this.animationTimers[index]) {
      clearInterval(this.animationTimers[index]);
    }

    // Create animation interval
    this.animationTimers[index] = setInterval(() => {
      currentStep++;
      animatedValue += increment;

      if (currentStep >= steps) {
        // Animation complete, set to exact target value
        this.performanceMetrics[index].value = targetValue;
        clearInterval(this.animationTimers[index]);
        this.animationTimers[index] = null;
      } else {
        // Update with animated value (rounded)
        this.performanceMetrics[index].value = Math.round(animatedValue);
      }
    }, stepTime);
  }

  refreshStats(): void {
    console.log('🔄 Manually refreshing dashboard stats...');
    this.loadDashboardStats();
  }

  mapDamageClass(className: string): 'puncture' | 'dent' | 'tear' | 'crush' {
    const lowerClass = (className || '').toLowerCase();
    if (lowerClass.includes('puncture') || lowerClass.includes('hole')) return 'puncture';
    if (lowerClass.includes('dent') || lowerClass.includes('crush')) return 'dent';
    if (lowerClass.includes('tear') || lowerClass.includes('rip')) return 'tear';
    if (lowerClass.includes('crush') || lowerClass.includes('compress')) return 'crush';
    return 'dent'; // default
  }

  formatTimestamp(timestamp: string): string {
    try {
      // Handle ISO string format
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return timestamp;
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      // For older dates, show actual date
      return date.toLocaleDateString();
    } catch (e) {
      console.warn('Failed to format timestamp:', timestamp, e);
      return timestamp;
    }
  }

  navigateToUpload(): void {
    this.router.navigate(['/upload']);
  }

  viewDetails(detectionId: string): void {
    this.router.navigate(['/package', detectionId.replace('#', '')]);
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
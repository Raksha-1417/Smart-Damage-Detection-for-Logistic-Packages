import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Dashboard3DBackgroundComponent } from '../dashboard/dashboard-3d-background.component';

interface AnalyticMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, HttpClientModule, Dashboard3DBackgroundComponent],
  template: `
    <!-- 3D AI Background -->
    <app-dashboard-3d-background></app-dashboard-3d-background>

    <!-- Analytics Content -->
    <div class="analytics-page">
      <div class="page-header">
        <h1 class="gradient-text">Reports</h1>
        <p class="subtitle">Real-time insights and performance metrics</p>
      </div>

      <!-- Key Metrics Section -->
      <div class="metrics-section">
        <div class="metric-card glass-effect" *ngFor="let metric of keyMetrics">
          <div class="metric-icon" [style.background]="getIconBackground(metric.icon)">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path [attr.d]="getIconPath(metric.icon)"/>
            </svg>
          </div>
          <div class="metric-content">
            <p class="metric-label">{{ metric.label }}</p>
            <h3 class="metric-value">{{ metric.value }}</h3>
            <div class="metric-change" [class.positive]="metric.trend === 'up'" [class.negative]="metric.trend === 'down'">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline [attr.points]="metric.trend === 'up' ? '23 6 13.5 15.5 8.5 10.5 1 18' : '23 18 13.5 8.5 8.5 13.5 1 6'"/>
              </svg>
              <span>{{ metric.change }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <!-- Damage Type Distribution -->
        <div class="chart-card glass-effect">
          <div class="chart-header">
            <h3>Damage Type Distribution</h3>
            <span class="chart-period">Last 30 Days</span>
          </div>
          <div class="chart-content">
            <div class="bar-chart">
              <div class="bar-item" *ngFor="let item of damageDistribution">
                <div class="bar-wrapper">
                  <div class="bar-fill" [style.height.%]="(item.value / maxDamageValue) * 100" [style.background]="item.color"></div>
                </div>
                <span class="bar-label">{{ item.label }}</span>
                <span class="bar-value">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Detection Accuracy Trend -->
        <div class="chart-card glass-effect">
          <div class="chart-header">
            <h3>Detection Accuracy Trend</h3>
            <span class="chart-period">Weekly Average</span>
          </div>
          <div class="chart-content">
            <div class="line-chart">
              <div class="chart-grid">
                <div class="grid-line" *ngFor="let i of [0,1,2,3,4]"></div>
              </div>
              <svg class="line-svg" viewBox="0 0 400 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#00ffff;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#00ff88;stop-opacity:1" />
                  </linearGradient>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#00ffff;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#00ffff;stop-opacity:0" />
                  </linearGradient>
                </defs>
                <path d="M0,150 L50,120 L100,100 L150,90 L200,80 L250,85 L300,75 L350,70 L400,60" 
                      fill="url(#areaGradient)" />
                <path d="M0,150 L50,120 L100,100 L150,90 L200,80 L250,85 L300,75 L350,70 L400,60" 
                      fill="none" stroke="url(#lineGradient)" stroke-width="3" />
              </svg>
              <div class="chart-labels">
                <span *ngFor="let week of ['Week 1', 'Week 2', 'Week 3', 'Week 4']">{{ week }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detection Statistics -->
      <div class="stats-section glass-effect">
        <h3 class="section-title">Detection Statistics</h3>
        <div class="stats-grid">
          <div class="stat-item" *ngFor="let stat of detectionStats">
            <div class="stat-circle" [style.border-color]="stat.color">
              <svg class="stat-progress" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"/>
                <circle cx="50" cy="50" r="45" fill="none" [attr.stroke]="stat.color" stroke-width="8" 
                        [style.stroke-dasharray]="282.6" 
                        [style.stroke-dashoffset]="282.6 - (282.6 * stat.percentage / 100)"
                        transform="rotate(-90 50 50)"/>
              </svg>
              <span class="stat-percentage">{{ stat.percentage }}%</span>
            </div>
            <p class="stat-label">{{ stat.label }}</p>
            <p class="stat-count">{{ stat.count }} packages</p>
          </div>
        </div>
      </div>

      <!-- Recent Activity Timeline -->
      <div class="timeline-section glass-effect">
        <h3 class="section-title">Recent Activity</h3>
        <div class="timeline">
          <div class="timeline-item" *ngFor="let activity of recentActivity">
            <div class="timeline-marker" [style.background]="activity.color"></div>
            <div class="timeline-content">
              <div class="timeline-time">{{ activity.time }}</div>
              <div class="timeline-title">{{ activity.title }}</div>
              <div class="timeline-description">{{ activity.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-page {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      min-height: 100vh;
      position: relative;
      z-index: 1;
    }

    /* Glass Effect */
    .glass-effect {
      background: rgba(10, 25, 41, 0.7) !important;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 255, 255, 0.2);
      box-shadow: 0 8px 32px 0 rgba(0, 255, 255, 0.1);
      border-radius: 16px;
      padding: 1.5rem;
    }

    /* Header */
    .page-header {
      margin-bottom: 2.5rem;
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
    }

    @keyframes shimmer {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.3); }
    }

    .subtitle {
      color: rgba(0, 255, 255, 0.7);
      font-size: 1.1rem;
    }

    /* Metrics Section */
    .metrics-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
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

    .metric-card {
      display: flex;
      gap: 1rem;
      transition: all 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 255, 255, 0.2);
    }

    .metric-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .metric-content {
      flex: 1;
      min-width: 0;
    }

    .metric-label {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.5rem;
    }

    .metric-change {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .metric-change.positive {
      color: #00ff88;
    }

    .metric-change.negative {
      color: #ff3b30;
    }

    /* Charts Grid */
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
      animation: slideUp 0.6s ease-out 0.2s both;
    }

    .chart-card {
      min-height: 350px;
      display: flex;
      flex-direction: column;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(0, 255, 255, 0.2);
    }

    .chart-header h3 {
      color: #00ffff;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .chart-period {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.6);
    }

    .chart-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Bar Chart */
    .bar-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      gap: 1.5rem;
      height: 250px;
      width: 100%;
    }

    .bar-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .bar-wrapper {
      width: 100%;
      height: 200px;
      display: flex;
      align-items: flex-end;
      position: relative;
    }

    .bar-fill {
      width: 100%;
      border-radius: 8px 8px 0 0;
      transition: all 0.5s ease;
      box-shadow: 0 0 20px currentColor;
      animation: barGrow 1s ease-out;
    }

    @keyframes barGrow {
      from { height: 0; }
      to { height: 100%; }
    }

    .bar-label {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 600;
    }

    .bar-value {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
    }

    /* Line Chart */
    .line-chart {
      width: 100%;
      height: 250px;
      position: relative;
    }

    .chart-grid {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .grid-line {
      width: 100%;
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
    }

    .line-svg {
      width: 100%;
      height: 200px;
      position: relative;
      z-index: 1;
    }

    .chart-labels {
      display: flex;
      justify-content: space-around;
      margin-top: 1rem;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.6);
    }

    /* Stats Section */
    .stats-section {
      margin-bottom: 2rem;
      animation: slideUp 0.6s ease-out 0.3s both;
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: rgba(0, 255, 255, 0.9);
      margin-bottom: 1.5rem;
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .stat-circle {
      width: 120px;
      height: 120px;
      position: relative;
      margin-bottom: 1rem;
      border-radius: 50%;
      border: 3px solid;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-progress {
      position: absolute;
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .stat-percentage {
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
      z-index: 1;
    }

    .stat-label {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 0.25rem;
      font-weight: 600;
    }

    .stat-count {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.5);
    }

    /* Timeline Section */
    .timeline-section {
      animation: slideUp 0.6s ease-out 0.4s both;
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .timeline-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      border-left: 3px solid;
      transition: all 0.3s ease;
    }

    .timeline-item:hover {
      background: rgba(0, 0, 0, 0.3);
      transform: translateX(4px);
    }

    .timeline-marker {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-top: 4px;
      flex-shrink: 0;
      box-shadow: 0 0 10px currentColor;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }

    .timeline-content {
      flex: 1;
    }

    .timeline-time {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 0.25rem;
      font-family: 'Courier New', monospace;
    }

    .timeline-title {
      font-weight: 600;
      color: #fff;
      margin-bottom: 0.25rem;
    }

    .timeline-description {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.7);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .analytics-page {
        padding: 1rem;
      }

      .gradient-text {
        font-size: 1.5rem;
      }

      .metrics-section {
        grid-template-columns: 1fr;
      }

      .charts-grid {
        grid-template-columns: 1fr;
      }

      .bar-chart {
        gap: 1rem;
      }
    }
  `]
})
export class ReportsComponent implements OnInit, OnDestroy {
  private apiUrl = 'http://localhost:8000/api';
  private refreshInterval: any;
  stats: any = null;
  
  keyMetrics: AnalyticMetric[] = [
    { label: 'Total Inspections', value: '0', change: '+12.5%', trend: 'up', icon: 'scan' },
    { label: 'Detection Accuracy', value: '0%', change: '+2.3%', trend: 'up', icon: 'target' },
    { label: 'Damaged Packages', value: '0', change: '-8.1%', trend: 'down', icon: 'alert' },
    { label: 'Damage Rate', value: '0%', change: '-15.2%', trend: 'down', icon: 'clock' }
  ];

  damageDistribution: ChartData[] = [];
  detectionStats: any[] = [];
  recentActivity: any[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadReportsData();
    this.refreshInterval = setInterval(() => {
      this.loadReportsData();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private loadReportsData(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.loadMockData();
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>(`${this.apiUrl}/dashboard/stats`, { headers }).subscribe({
      next: (data) => {
        this.stats = data;
        this.updateMetrics(data);
        this.updateCharts(data);
        this.updateActivity(data);
      },
      error: (err) => {
        console.error('Failed to load reports data:', err);
        this.loadMockData();
      }
    });
  }

  private updateMetrics(data: any): void {
    this.keyMetrics[0].value = (data.total_inspections || 0).toString();
    this.keyMetrics[1].value = `${data.detection_accuracy || 0}%`;
    this.keyMetrics[2].value = (data.total_damages || 0).toString();
    this.keyMetrics[3].value = `${data.damage_rate || 0}%`;
  }

  private updateCharts(data: any): void {
    if (data.damage_breakdown) {
      const colors = {
        crushed: '#ff9f0a',
        torn: '#64d2ff', 
        dented: '#00ffff',
        wet: '#bf5af2',
        other: '#ff3b30'
      };
      
      this.damageDistribution = Object.entries(data.damage_breakdown)
        .filter(([_, count]: [string, any]) => count > 0)
        .map(([type, count]: [string, any]) => ({
          label: type.charAt(0).toUpperCase() + type.slice(1),
          value: count,
          color: colors[type as keyof typeof colors] || '#666'
        }));
    }

    const totalInspections = data.total_inspections || 1;
    const totalDamages = data.total_damages || 0;
    const passedCount = totalInspections - totalDamages;
    
    this.detectionStats = [
      { 
        label: 'Passed', 
        percentage: Math.round((passedCount / totalInspections) * 100), 
        count: passedCount, 
        color: '#00ff88' 
      },
      { 
        label: 'Damaged', 
        percentage: Math.round((totalDamages / totalInspections) * 100), 
        count: totalDamages, 
        color: '#ff3b30' 
      }
    ];
  }

  private updateActivity(data: any): void {
    if (data.recent_detections && data.recent_detections.length > 0) {
      this.recentActivity = data.recent_detections.slice(0, 4).map((detection: any) => ({
        time: this.formatTimestamp(detection.timestamp),
        title: detection.status === 'damaged' ? 'Damage Detected' : 'Package Cleared',
        description: `${detection.damageType} - ${detection.id}`,
        color: detection.status === 'damaged' ? '#ff3b30' : '#00ff88'
      }));
    } else {
      this.recentActivity = [
        { time: 'Just now', title: 'System Ready', description: 'Waiting for package inspections', color: '#00ffff' }
      ];
    }
  }

  private loadMockData(): void {
    this.keyMetrics[0].value = '24';
    this.keyMetrics[1].value = '94.2%';
    this.keyMetrics[2].value = '3';
    this.keyMetrics[3].value = '12.5%';
    
    this.damageDistribution = [
      { label: 'Dent', value: 2, color: '#00ffff' },
      { label: 'Tear', value: 1, color: '#64d2ff' }
    ];
    
    this.detectionStats = [
      { label: 'Passed', percentage: 87, count: 21, color: '#00ff88' },
      { label: 'Damaged', percentage: 13, count: 3, color: '#ff3b30' }
    ];
    
    this.recentActivity = [
      { time: '2 min ago', title: 'Package Cleared', description: 'No damage - PKG-001', color: '#00ff88' },
      { time: '15 min ago', title: 'Damage Detected', description: 'Dent - PKG-002', color: '#ff3b30' }
    ];
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

  get maxDamageValue(): number {
    return this.damageDistribution.length > 0 ? Math.max(...this.damageDistribution.map(d => d.value)) : 1;
  }

  getIconPath(icon: string): string {
    const icons: { [key: string]: string } = {
      'scan': 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
      'target': 'M22 12h-4l-3 9L9 3l-3 9H2',
      'alert': 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
      'clock': 'M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83 M12 6v6l4 2'
    };
    return icons[icon] || icons['scan'];
  }

  getIconBackground(icon: string): string {
    const backgrounds: { [key: string]: string } = {
      'scan': 'rgba(0, 255, 255, 0.2)',
      'target': 'rgba(0, 255, 136, 0.2)',
      'alert': 'rgba(255, 59, 48, 0.2)',
      'clock': 'rgba(255, 159, 10, 0.2)'
    };
    return backgrounds[icon] || backgrounds['scan'];
  }
}

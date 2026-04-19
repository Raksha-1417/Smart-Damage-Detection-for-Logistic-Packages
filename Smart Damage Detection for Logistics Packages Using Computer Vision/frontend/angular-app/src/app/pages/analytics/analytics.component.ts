import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="analytics">
      <div class="page-header">
        <div>
          <h1>Analytics</h1>
          <p>Real-time insights into detection performance and trends</p>
        </div>
        <button class="refresh-btn" (click)="refreshData()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
          Refresh
        </button>
      </div>

      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon inspections">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats?.total_inspections || 0 }}</div>
            <div class="stat-label">Total Inspections</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon damages">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats?.total_damages || 0 }}</div>
            <div class="stat-label">Total Damages</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon accuracy">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats?.detection_accuracy || 0 }}%</div>
            <div class="stat-label">Detection Accuracy</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon rate">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats?.damage_rate || 0 }}%</div>
            <div class="stat-label">Damage Rate</div>
          </div>
        </div>
      </div>

      <div class="analytics-grid">
        <div class="chart-card">
          <h3>Damage Types Breakdown</h3>
          <div class="damage-breakdown">
            <div class="damage-item" *ngFor="let item of getDamageBreakdownArray()">
              <div class="damage-info">
                <div class="damage-name">{{ item.name }}</div>
                <div class="damage-count">{{ item.count }} cases</div>
              </div>
              <div class="damage-bar">
                <div class="damage-fill" [style.width.%]="item.percentage" [style.background-color]="item.color"></div>
              </div>
            </div>
            <div class="no-data" *ngIf="!stats?.damage_breakdown || getTotalDamageCount() === 0">
              <p>No damage data available</p>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3>Detection Accuracy Trend</h3>
          <div class="accuracy-trend">
            <div class="trend-item" *ngFor="let trend of analytics?.accuracy_trend">
              <div class="trend-info">
                <div class="trend-date">{{ formatDate(trend.date) }}</div>
                <div class="trend-inspections">{{ trend.inspections }} inspections</div>
              </div>
              <div class="trend-accuracy">
                <span class="accuracy-value">{{ trend.accuracy }}%</span>
                <div class="accuracy-bar">
                  <div class="accuracy-fill" [style.width.%]="trend.accuracy"></div>
                </div>
              </div>
            </div>
            <div class="no-data" *ngIf="!analytics?.accuracy_trend?.length">
              <p>No trend data available</p>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3>Recent Activity</h3>
          <div class="detections-list">
            <div class="detection-item" *ngFor="let detection of stats?.recent_detections" 
                 [class.damaged]="detection.status === 'damaged'"
                 [class.clean]="detection.status === 'passed'">
              <div class="detection-info">
                <div class="detection-id">{{ detection.id }}</div>
                <div class="detection-type">{{ detection.damageType }}</div>
                <div class="detection-status">{{ detection.status | titlecase }}</div>
              </div>
              <div class="detection-meta">
                <span class="confidence" *ngIf="detection.confidence > 0">{{ detection.confidence }}%</span>
                <span class="timestamp">{{ formatTimestamp(detection.timestamp) }}</span>
              </div>
            </div>
            <div class="no-data" *ngIf="!stats?.recent_detections?.length">
              <p>No recent activity</p>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3>System Status</h3>
          <div class="status-grid">
            <div class="status-item online">
              <div class="status-dot"></div>
              <span>AI Model: Online</span>
            </div>
            <div class="status-item online">
              <div class="status-dot"></div>
              <span>Database: Connected</span>
            </div>
            <div class="status-item online">
              <div class="status-dot"></div>
              <span>API: Responsive</span>
            </div>
            <div class="status-item online">
              <div class="status-dot"></div>
              <span>Real-time Updates: Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics {
      max-width: 1400px;
      padding: 20px;
      color: white;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin-bottom: 0.5rem;
      color: white;
    }

    .page-header p {
      color: rgba(255, 255, 255, 0.7);
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #00ffff;
      color: #0a0e27;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .refresh-btn:hover {
      background: #00e6e6;
      transform: translateY(-2px);
    }

    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.inspections {
      background: rgba(0, 255, 255, 0.2);
      color: #00ffff;
    }

    .stat-icon.accuracy {
      background: rgba(0, 255, 136, 0.2);
      color: #00ff88;
    }

    .stat-icon.damages {
      background: rgba(255, 107, 107, 0.2);
      color: #ff6b6b;
    }

    .stat-icon.rate {
      background: rgba(255, 165, 0, 0.2);
      color: #ffa500;
    }



    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: white;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .damage-breakdown {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .damage-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .damage-info {
      min-width: 120px;
    }

    .damage-name {
      font-weight: 600;
      color: white;
      text-transform: capitalize;
      font-size: 0.9rem;
    }

    .damage-count {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.8rem;
    }

    .damage-bar {
      flex: 1;
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
    }

    .damage-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .accuracy-trend {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 300px;
      overflow-y: auto;
    }

    .trend-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .trend-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .trend-date {
      font-weight: 600;
      color: #00ffff;
      font-size: 0.9rem;
    }

    .trend-inspections {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.8rem;
    }

    .trend-accuracy {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 120px;
    }

    .accuracy-value {
      color: #00ff88;
      font-weight: 600;
      font-size: 0.9rem;
      min-width: 45px;
    }

    .accuracy-bar {
      width: 60px;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
    }

    .accuracy-fill {
      height: 100%;
      background: linear-gradient(90deg, #00ff88, #00ffff);
      transition: width 0.3s ease;
    }

    .chart-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 1.5rem;
    }

    .chart-card h3 {
      margin-bottom: 1.5rem;
      color: white;
    }

    .detections-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 300px;
      overflow-y: auto;
    }

    .detection-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .detection-item.damaged {
      border-left: 4px solid #ff6b6b;
    }

    .detection-item.clean {
      border-left: 4px solid #00ff88;
    }

    .detection-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detection-id {
      font-weight: 600;
      color: #00ffff;
      font-size: 0.9rem;
    }

    .detection-type {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.8rem;
    }

    .detection-status {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detection-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }

    .confidence {
      color: #00ff88;
      font-weight: 600;
      font-size: 0.8rem;
    }

    .timestamp {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.7rem;
    }

    .status-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #00ff88;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .status-item.online {
      color: #00ff88;
    }

    .no-data {
      text-align: center;
      padding: 2rem;
      color: rgba(255, 255, 255, 0.5);
    }

    @media (max-width: 1200px) {
      .analytics-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 1024px) {
      .stats-overview {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 1rem;
      }
      
      .stats-overview {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  private apiUrl = 'http://localhost:8000/api';
  private refreshInterval: any;
  stats: any = null;
  analytics: any = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
    // Auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadAnalyticsData();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private loadAnalyticsData(): void {
    const token = this.authService.getToken();
    if (!token) {
      console.warn('⚠️  No auth token found, skipping analytics load');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Load both dashboard stats and analytics data
    forkJoin({
      stats: this.http.get<any>(`${this.apiUrl}/dashboard/stats`, { headers }),
      analytics: this.http.get<any>(`${this.apiUrl}/analytics`, { headers })
    }).subscribe({
      next: (data) => {
        this.stats = data.stats;
        this.analytics = data.analytics;
        console.log('✅ Analytics data loaded:', data);
      },
      error: (err) => {
        console.error('❌ Failed to load analytics data:', err);
      }
    });
  }

  refreshData(): void {
    console.log('🔄 Manually refreshing analytics data...');
    this.loadAnalyticsData();
  }

  formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
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
      
      return date.toLocaleDateString();
    } catch (e) {
      return timestamp;
    }
  }

  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateStr;
    }
  }

  getDamageBreakdownArray(): any[] {
    if (!this.stats?.damage_breakdown) return [];
    
    const breakdown = this.stats.damage_breakdown;
    const total = this.getTotalDamageCount();
    
    const colors = {
      crushed: '#ff6b6b',
      torn: '#ffa500', 
      dented: '#ffeb3b',
      wet: '#2196f3',
      other: '#9c27b0'
    };
    
    return Object.entries(breakdown)
      .map(([name, count]: [string, any]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count: count,
        percentage: total > 0 ? (count / total) * 100 : 0,
        color: colors[name as keyof typeof colors] || '#666'
      }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }

  getTotalDamageCount(): number {
    if (!this.stats?.damage_breakdown) return 0;
    return Object.values(this.stats.damage_breakdown).reduce((sum: number, count: any) => sum + count, 0);
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dashboard3DBackgroundComponent } from '../dashboard/dashboard-3d-background.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, Dashboard3DBackgroundComponent],
  template: `
    <app-dashboard-3d-background></app-dashboard-3d-background>
    
    <div class="settings-page">
      <div class="page-header">
        <h1 class="gradient-text">Settings</h1>
        <p class="subtitle">Configure your AI detection system preferences</p>
      </div>

      <div class="settings-container">
        <!-- Profile Section -->
        <div class="glass-effect settings-card">
          <div class="card-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="header-icon">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <h3>Profile Settings</h3>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" [(ngModel)]="profile.name" class="form-input" placeholder="Enter your name" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="profile.email" class="form-input" placeholder="Enter your email" />
            </div>
            <div class="form-group">
              <label>Role</label>
              <input type="text" [(ngModel)]="profile.role" class="form-input" disabled />
            </div>
            <div class="form-group">
              <label>Department</label>
              <select [(ngModel)]="profile.department" class="form-input">
                <option value="Quality Control">Quality Control</option>
                <option value="Operations">Operations</option>
                <option value="Management">Management</option>
              </select>
            </div>
          </div>
          
          <div class="form-actions">
            <button class="btn btn-secondary">Cancel</button>
            <button class="btn btn-primary">Save Changes</button>
          </div>
        </div>

        <!-- Notification Section -->
        <div class="glass-effect settings-card">
          <div class="card-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="header-icon">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <h3>Notification Preferences</h3>
          </div>
          
          <div class="settings-list">
            <div class="setting-item" *ngFor="let setting of notificationSettings">
              <div class="setting-info">
                <div class="setting-icon" [style.background]="getSettingIconColor(setting.type)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path [attr.d]="getSettingIconPath(setting.type)"/>
                  </svg>
                </div>
                <div>
                  <p class="setting-title">{{ setting.title }}</p>
                  <p class="setting-description">{{ setting.description }}</p>
                </div>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="setting.enabled" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- System Settings -->
        <div class="glass-effect settings-card">
          <div class="card-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="header-icon">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
            </svg>
            <h3>System Configuration</h3>
          </div>
          
          <div class="settings-list">
            <div class="setting-item" *ngFor="let setting of systemSettings">
              <div class="setting-info">
                <div class="setting-icon" [style.background]="getSettingIconColor(setting.type)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path [attr.d]="getSettingIconPath(setting.type)"/>
                  </svg>
                </div>
                <div>
                  <p class="setting-title">{{ setting.title }}</p>
                  <p class="setting-description">{{ setting.description }}</p>
                </div>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="setting.enabled" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- AI Model Settings -->
        <div class="glass-effect settings-card">
          <div class="card-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="header-icon">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
            </svg>
            <h3>AI Model Configuration</h3>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Confidence Threshold</label>
              <div class="range-container">
                <input type="range" [(ngModel)]="modelConfig.confidenceThreshold" min="0" max="100" class="range-input" />
                <span class="range-value">{{ modelConfig.confidenceThreshold }}%</span>
              </div>
            </div>
            <div class="form-group">
              <label>Detection Sensitivity</label>
              <div class="range-container">
                <input type="range" [(ngModel)]="modelConfig.sensitivity" min="0" max="100" class="range-input" />
                <span class="range-value">{{ modelConfig.sensitivity }}%</span>
              </div>
            </div>
            <div class="form-group">
              <label>Model Version</label>
              <select [(ngModel)]="modelConfig.version" class="form-input">
                <option value="v8">YOLOv8 (Standard)</option>
                <option value="v9">YOLOv9 (Enhanced)</option>
                <option value="v10">YOLOv10 (Beta)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Processing Mode</label>
              <select [(ngModel)]="modelConfig.processingMode" class="form-input">
                <option value="fast">Fast (Lower Accuracy)</option>
                <option value="balanced">Balanced</option>
                <option value="accurate">Accurate (Slower)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      max-width: 1200px;
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

    /* Settings Container */
    .settings-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .settings-card {
      padding: 2rem;
      animation: slideUp 0.6s ease-out;
      transition: all 0.3s ease;
    }

    .settings-card:hover {
      box-shadow: 0 12px 40px rgba(0, 255, 255, 0.2);
      transform: translateY(-2px);
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

    /* Card Header */
    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(0, 255, 255, 0.2);
    }

    .card-header h3 {
      color: #00ffff;
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0;
    }

    .header-icon {
      color: #00ff88;
    }

    /* Form Grid */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.75rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-input, select {
      width: 100%;
      padding: 0.875rem 1rem;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(0, 255, 255, 0.3);
      border-radius: 10px;
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .form-input:focus, select:focus {
      outline: none;
      border-color: #00ffff;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
      background: rgba(0, 0, 0, 0.4);
    }

    .form-input::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    .form-input:disabled {
      background: rgba(0, 0, 0, 0.2);
      color: rgba(255, 255, 255, 0.5);
      cursor: not-allowed;
    }

    /* Range Input */
    .range-container {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .range-input {
      flex: 1;
      height: 6px;
      border-radius: 5px;
      background: rgba(0, 0, 0, 0.3);
      outline: none;
      -webkit-appearance: none;
    }

    .range-input::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00ffff, #00ff88);
      cursor: pointer;
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    }

    .range-input::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00ffff, #00ff88);
      cursor: pointer;
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
      border: none;
    }

    .range-value {
      min-width: 50px;
      text-align: right;
      font-weight: 600;
      color: #00ffff;
      font-size: 1.1rem;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
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

    /* Settings List */
    .settings-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 0;
      border-bottom: 1px solid rgba(0, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .setting-item:hover {
      padding-left: 0.5rem;
      background: rgba(0, 255, 255, 0.05);
      border-radius: 8px;
    }

    .setting-item:last-child {
      border-bottom: none;
    }

    .setting-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .setting-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .setting-icon svg {
      color: #fff;
    }

    .setting-title {
      font-weight: 600;
      color: #fff;
      margin-bottom: 0.25rem;
      font-size: 1rem;
    }

    .setting-description {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.4;
    }

    /* Toggle Switch */
    .toggle {
      position: relative;
      display: inline-block;
      width: 52px;
      height: 28px;
      flex-shrink: 0;
    }

    .toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.2);
      transition: 0.3s;
      border-radius: 28px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 4px;
      bottom: 3px;
      background: #fff;
      transition: 0.3s;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .toggle input:checked + .toggle-slider {
      background: linear-gradient(135deg, #00ffff, #00ff88);
      border-color: #00ffff;
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
    }

    .toggle input:checked + .toggle-slider:before {
      transform: translateX(24px);
      box-shadow: 0 2px 8px rgba(0, 255, 255, 0.3);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .settings-page {
        padding: 1rem;
      }

      .gradient-text {
        font-size: 1.5rem;
      }

      .settings-card {
        padding: 1.5rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class SettingsComponent {
  profile = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Quality Inspector',
    department: 'Quality Control'
  };

  notificationSettings = [
    {
      title: 'Email Notifications',
      description: 'Receive email alerts for high-severity damages',
      enabled: true,
      type: 'email'
    },
    {
      title: 'Push Notifications',
      description: 'Get real-time notifications in the app',
      enabled: true,
      type: 'push'
    },
    {
      title: 'Daily Summary',
      description: 'Receive a daily summary of inspection results',
      enabled: false,
      type: 'summary'
    },
    {
      title: 'Critical Alerts',
      description: 'Instant alerts for critical damage detections',
      enabled: true,
      type: 'alert'
    }
  ];

  systemSettings = [
    {
      title: 'Auto-refresh Queue',
      description: 'Automatically refresh inspection queue every 30 seconds',
      enabled: true,
      type: 'refresh'
    },
    {
      title: 'Show XAI by Default',
      description: 'Display Grad-CAM overlay when opening package details',
      enabled: false,
      type: 'xai'
    },
    {
      title: 'High Contrast Mode',
      description: 'Increase contrast for better visibility',
      enabled: false,
      type: 'contrast'
    },
    {
      title: 'Dark Mode',
      description: 'Enable dark theme across the application',
      enabled: true,
      type: 'theme'
    }
  ];

  modelConfig = {
    confidenceThreshold: 85,
    sensitivity: 75,
    version: 'v9',
    processingMode: 'balanced'
  };

  getSettingIconPath(type: string): string {
    const icons: { [key: string]: string } = {
      'email': 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      'push': 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
      'summary': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      'alert': 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
      'refresh': 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      'xai': 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      'contrast': 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
      'theme': 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
    };
    return icons[type] || icons['email'];
  }

  getSettingIconColor(type: string): string {
    const colors: { [key: string]: string } = {
      'email': 'rgba(0, 255, 255, 0.2)',
      'push': 'rgba(0, 255, 136, 0.2)',
      'summary': 'rgba(191, 90, 242, 0.2)',
      'alert': 'rgba(255, 59, 48, 0.2)',
      'refresh': 'rgba(100, 210, 255, 0.2)',
      'xai': 'rgba(255, 159, 10, 0.2)',
      'contrast': 'rgba(255, 214, 10, 0.2)',
      'theme': 'rgba(175, 82, 222, 0.2)'
    };
    return colors[type] || colors['email'];
  }
}

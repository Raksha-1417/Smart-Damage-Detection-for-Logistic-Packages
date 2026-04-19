/**
 * Login Component - Unique Design
 * Author: RakshaRajkumar14
 * Date: 2025-11-16 22:37:25 UTC
 */

import { Component, PLATFORM_ID, Inject, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';  
import { AnyAaaaRecord } from 'node:dns';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <!-- Animated Particle Background -->
      <div class="particles-background">
        <div class="particle" *ngFor="let i of particles" 
             [style.left.%]="i.x" 
             [style.top.%]="i.y"
             [style.width.px]="i.size"
             [style.height.px]="i.size"
             [style.animation-duration.s]="i.duration">
        </div>
      </div>

      <!-- Grid Overlay -->
      <div class="grid-overlay"></div>

      <!-- Login Card Container -->
      <div class="login-container">
        <div class="login-card">
          <!-- Glow Effect -->
          <div class="card-glow"></div>
          
          <!-- Header with Logo Animation -->
          <div class="header-section">
            <div class="logo-container">
              <div class="logo-ring"></div>
              <div class="logo-ring ring-2"></div>
              <div class="logo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                  <polyline points="7.5 4.21 12 6.81 16.5 4.21"/>
                  <polyline points="7.5 19.79 7.5 14.6 3 12"/>
                  <polyline points="21 12 16.5 14.6 16.5 19.79"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
            </div>
            <h1>LogiVision AI</h1>
            <p class="tagline">Smart Package Inspector</p>
          </div>

          <!-- Status Indicator -->
          <div class="status-bar" [class.online]="backendOnline">
            <span class="status-dot"></span>
            <span class="status-text">{{ backendOnline ? 'System Online' : 'Connecting...' }}</span>
          </div>

          <!-- Error Alert -->
          <div class="alert-error" *ngIf="errorMessage" [@slideIn]>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Login Form -->
          <form (ngSubmit)="handleLogin($event)" class="login-form" #loginForm="ngForm">
            <!-- Username -->
            <div class="input-group">
              <div class="input-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <label>Username</label>
              </div>
              <input
                type="text"
                name="username"
                [(ngModel)]="username"
                placeholder="Enter your username"
                [disabled]="isLoading"
                required
                autocomplete="username"
                class="input-field"
              />
            </div>

            <!-- Password -->
            <div class="input-group">
              <div class="input-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <label>Password</label>
              </div>
              <div class="password-container">
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  name="password"
                  [(ngModel)]="password"
                  placeholder="Enter your password"
                  [disabled]="isLoading"
                  required
                  autocomplete="current-password"
                  class="input-field"
                />
                <button type="button" class="toggle-btn" (click)="showPassword = !showPassword" [disabled]="isLoading">
                  <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Login Button -->
            <button type="submit" class="btn-login" [disabled]="isLoading || loginForm.invalid">
              <span class="btn-content" *ngIf="!isLoading">
                <span>Access Dashboard</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </span>
              <span class="btn-loading" *ngIf="isLoading">
                <span class="loading-spinner"></span>
                <span>{{ loadingText }}</span>
              </span>
            </button>
          </form>

          <!-- Divider -->
          <div class="divider">
            <span>Demo Access</span>
          </div>

          <!-- Demo Credentials -->
          <div class="demo-box">
            <div class="demo-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>Quick Access for Testing</span>
            </div>
            <div class="demo-creds">
              <div class="cred">
                <span class="cred-label">Username</span>
                <span class="cred-value">admin</span>
              </div>
              <div class="cred">
                <span class="cred-label">Password</span>
                <span class="cred-value">admin123</span>
              </div>
            </div>
            <button type="button" class="btn-quick" (click)="quickLogin()" [disabled]="isLoading">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Use Demo Credentials
            </button>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p class="version">v2.0.0</p>
            <p class="author">© 2025 RakshaRajkumar14</p>
          </div>
        </div>


      </div>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .login-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0a1628 0%, #1a2332 100%);
      overflow: hidden;
      padding: 20px;
    }

    /* Animated Particles */
    .particles-background {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      z-index: 0;
    }

    .particle {
      position: absolute;
      background: radial-gradient(circle, rgba(0, 255, 255, 0.8), transparent);
      border-radius: 50%;
      pointer-events: none;
      animation: floatParticle linear infinite;
    }

    @keyframes floatParticle {
      0% {
        transform: translateY(100vh) translateX(0);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        transform: translateY(-100vh) translateX(50px);
        opacity: 0;
      }
    }

    /* Grid Overlay */
    .grid-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: 
        linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: gridMove 20s linear infinite;
      z-index: 1;
      pointer-events: none;
    }

    @keyframes gridMove {
      0% { transform: translate(0, 0); }
      100% { transform: translate(50px, 50px); }
    }

    /* Login Container - CENTERED */
    .login-container {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 420px;
      margin: 0 auto;
    }

    /* Login Card */
    .login-card {
      background: rgba(15, 20, 35, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 255, 255, 0.2);
      border-radius: 16px;
      padding: 24px 28px;
      position: relative;
      overflow: hidden;
      width: 100%;
    }

    .card-glow {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(0, 255, 255, 0.1), transparent 50%);
      animation: rotateGlow 10s linear infinite;
    }

    @keyframes rotateGlow {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Header */
    .header-section {
      position: relative;
      text-align: center;
      margin-bottom: 20px;
    }

    .logo-container {
      width: 60px;
      height: 60px;
      margin: 0 auto 12px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 2px solid rgba(0, 255, 255, 0.3);
      border-radius: 50%;
      animation: pulse-ring 2s ease-in-out infinite;
    }

    .ring-2 {
      animation-delay: 1s;
    }

    @keyframes pulse-ring {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.3;
      }
    }

    .logo-icon {
      position: relative;
      z-index: 2;
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #00ffff 0%, #00ff88 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0, 255, 255, 0.4);
      animation: logoGlow 3s ease-in-out infinite alternate;
    }

    .logo-icon svg {
      color: #0a1929;
      width: 28px;
      height: 28px;
    }

    @keyframes logoGlow {
      from {
        box-shadow: 0 4px 20px rgba(0, 255, 255, 0.4);
      }
      to {
        box-shadow: 0 6px 30px rgba(0, 255, 255, 0.6);
      }
    }

    h1 {
      font-size: 22px;
      font-weight: 700;
      background: linear-gradient(135deg, #00ffff, #00ff88);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 6px;
    }

    .tagline {
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
    }

    /* Status Bar */
    .status-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 77, 77, 0.3);
      border-radius: 12px;
      margin-bottom: 24px;
      font-size: 13px;
      color: #ff6b6b;
    }

    .status-bar.online {
      border-color: rgba(0, 255, 136, 0.3);
      color: #00ff88;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ff6b6b;
      animation: blink 1.5s infinite;
    }

    .status-bar.online .status-dot {
      background: #00ff88;
      animation: none;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    /* Alert */
    .alert-error {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: rgba(255, 77, 77, 0.1);
      border: 1px solid rgba(255, 77, 77, 0.3);
      border-radius: 12px;
      color: #ff6b6b;
      font-size: 14px;
      margin-bottom: 20px;
    }

    /* Form */
    .login-form {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 20px;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .input-label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      font-weight: 600;
    }

    .input-field {
      width: 100%;
      padding: 14px 16px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(0, 255, 255, 0.2);
      border-radius: 12px;
      color: white;
      font-size: 15px;
      transition: all 0.3s;
    }

    .input-field::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }

    .input-field:focus {
      outline: none;
      border-color: #00ffff;
      box-shadow: 0 0 0 3px rgba(0, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.4);
    }

    .input-field:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .password-container {
      position: relative;
    }

    .password-container .input-field {
      padding-right: 50px;
    }

    .toggle-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      transition: color 0.3s;
    }

    .toggle-btn:hover:not(:disabled) {
      color: #00ffff;
    }

    /* Login Button */
    .btn-login {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #00ffff, #00ff88);
      border: none;
      border-radius: 12px;
      color: #0a0e1a;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 8px;
      position: relative;
      overflow: hidden;
    }

    .btn-login::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }

    .btn-login:hover:not(:disabled)::before {
      width: 300px;
      height: 300px;
    }

    .btn-login:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 255, 255, 0.4);
    }

    .btn-login:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-content, .btn-loading {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .loading-spinner {
      width: 18px;
      height: 18px;
      border: 3px solid rgba(10, 14, 26, 0.3);
      border-top-color: #0a0e1a;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Divider */
    .divider {
      display: flex;
      align-items: center;
      margin: 20px 0 16px;
      color: rgba(255, 255, 255, 0.4);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(0, 255, 255, 0.1);
    }

    .divider span {
      padding: 0 16px;
    }

    /* Demo Box */
    .demo-box {
      background: rgba(0, 255, 255, 0.05);
      border: 1px solid rgba(0, 255, 255, 0.2);
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 16px;
    }

    .demo-header {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #00ffff;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .demo-creds {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }

    .cred {
      background: rgba(0, 0, 0, 0.3);
      padding: 12px;
      border-radius: 8px;
      text-align: center;
    }

    .cred-label {
      display: block;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .cred-value {
      display: block;
      font-size: 14px;
      color: #00ffff;
      font-weight: 700;
      font-family: 'Courier New', monospace;
    }

    .btn-quick {
      width: 100%;
      padding: 12px;
      background: rgba(0, 255, 255, 0.1);
      border: 1px solid rgba(0, 255, 255, 0.3);
      border-radius: 10px;
      color: #00ffff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s;
    }

    .btn-quick:hover:not(:disabled) {
      background: rgba(0, 255, 255, 0.2);
      border-color: #00ffff;
      transform: translateY(-2px);
    }

    .btn-quick:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Footer */
    .footer {
      text-align: center;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
    }

    .version {
      margin-bottom: 4px;
      font-weight: 600;
      color: #00ffff;
    }

    /* Info Panel */
    .info-panel {
      background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 255, 136, 0.1));
      backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 255, 255, 0.2);
      border-left: none;
      border-radius: 0 24px 24px 0;
      padding: 48px 32px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .info-content h2 {
      font-size: 22px;
      color: white;
      margin-bottom: 24px;
      background: linear-gradient(135deg, #00ffff, #00ff88);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .feature-list {
      list-style: none;
      margin-bottom: 32px;
    }

    .feature-list li {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      border-bottom: 1px solid rgba(0, 255, 255, 0.1);
    }

    .feature-list li:last-child {
      border-bottom: none;
    }

    .feature-list svg {
      color: #00ff88;
      flex-shrink: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .stat {
      text-align: center;
      padding: 16px 12px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(0, 255, 255, 0.2);
      border-radius: 12px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #00ffff;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
    }

    /* Responsive */
    @media (max-width: 968px) {
      .login-container {
        max-width: 480px;
      }
    }

    @media (max-width: 480px) {
      .login-wrapper {
        padding: 16px;
      }

      .login-card {
        padding: 32px 24px;
      }

      .demo-creds {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LoginComponent implements OnDestroy {
  username = 'admin';
  password = 'admin123';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  loadingText = 'Authenticating...';
  backendOnline = false;
  isBrowser: boolean;
  particles: any[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Generate particles
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 10 + 10
      });
    }

    // Check backend status
    this.checkBackend();

    // Redirect if already logged in
    if (this.isBrowser && this.authService.isLoggedIn()) {
      console.log('✅ Already authenticated');
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkBackend() {
    // Simple check - assume online for now
    setTimeout(() => {
      this.backendOnline = true;
    }, 1000);
  }

 handleLogin(event: Event) {
  event.preventDefault();
  
  if (!this.username || !this.password) {
    this.errorMessage = 'Please enter both username and password';
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';
  this.loadingText = 'Authenticating...';

  console.log('🔐 Starting login process...');
  console.log('🌐 Backend URL: http://localhost:8000/api/auth/login');

  // Create a timeout to prevent infinite loading
  const timeoutId = setTimeout(() => {
    if (this.isLoading) {
      console.error('⏱️ Login timeout - taking too long');
      this.isLoading = false;
      this.errorMessage = '⏱️ Request timeout. Check if backend is running on port 8000';
    }
  }, 15000); // 15 second timeout

  this.authService.login(this.username.trim(), this.password)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        clearTimeout(timeoutId);
        console.log('✅ Login SUCCESS:', response);
        console.log('🎫 Token:', response.access_token?.substring(0, 20) + '...');
        
        this.loadingText = 'Success! Redirecting...';
        
        // Navigate immediately
        console.log('🚀 Navigating to dashboard NOW');
        this.router.navigate(['/dashboard']).then(navResult => {
          console.log('📍 Navigation result:', navResult);
          
          if (!navResult) {
            console.warn('⚠️ Angular navigation failed, using window.location');
            if (this.isBrowser) {
              window.location.href = '/dashboard';
            }
          }
          
          this.isLoading = false;
        }).catch(navError => {
          console.error('❌ Navigation error:', navError);
          if (this.isBrowser) {
            window.location.href = '/dashboard';
          }
          this.isLoading = false;
        });
      },
      error: (error: any) => {
        clearTimeout(timeoutId);
        console.error('❌ Login ERROR:', error);
        this.isLoading = false;
        
        // Detailed error messages
        if (error.status === 0) {
          this.errorMessage = '🔌 Cannot connect to backend';
          this.backendOnline = false;
          console.error('💡 Solution: Start backend with: cd backend && python -m uvicorn app.app:app --reload --port 8000');
        } else if (error.status === 401) {
          this.errorMessage = '🔒 Invalid username or password';
        } else if (error.status === 404) {
          this.errorMessage = '❌ API endpoint not found';
        } else if (error.status === 500) {
          this.errorMessage = '⚠️ Server error - check backend logs';
        } else if (error.name === 'TimeoutError') {
          this.errorMessage = '⏱️ Request timeout - backend is slow or not responding';
        } else {
          this.errorMessage = error.error?.detail || `❌ Error ${error.status}: ${error.statusText}`;
        }
      }
    });
}

  quickLogin() {
    this.username = 'admin';
    this.password = 'admin123';
    
    // Small delay to show the values
    setTimeout(() => {
      const fakeEvent = new Event('submit');
      this.handleLogin(fakeEvent);
    }, 100);
  }
}
import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

// Auth Guard Function
const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn()) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};

export const routes: Routes = [
    {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    // UPDATE THIS PATH to match YOUR actual file location
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  
{
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
    {
    path: 'upload',
    loadComponent: () => import('./pages/upload/upload.component').then(m => m.UploadComponent)
  
  },
  {
    path: 'queue',
    loadComponent: () => import('./pages/inspection/inspection.component').then(m => m.InspectionQueueComponent)
    
  },
  {
    path: 'package/:id',
    loadComponent: () => import('./pages/package-detail/package-detail.component').then(m => m.PackageDetailComponent)
  },
  {
    path: 'model-insights',
    loadComponent: () => import('./pages/model-insights/model-insights.component').then(m => m.ModelInsightsComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent)
  }
];

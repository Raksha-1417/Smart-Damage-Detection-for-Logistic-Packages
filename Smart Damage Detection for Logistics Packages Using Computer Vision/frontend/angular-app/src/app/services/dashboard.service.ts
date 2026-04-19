/**
 * Dashboard Service
 * Author: RakshaRajkumar14
 * Date: 2025-11-16 14:37:47 UTC
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  total_packages_today: number;
  total_damages_today: number;
  total_damages: number;
  most_common_damage: string;
  damage_rate: number;
  recent_detections: Array<{
    id: string;
    damageType: string;
    damageClass: string;
    timestamp: string;
    confidence: number;
    status: string;
    predictionCount?: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient,
    private authService: AuthService) {}

  getDashboardStats(): Observable<DashboardStats> {
   const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`, { headers });
  }

  getHealthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
}
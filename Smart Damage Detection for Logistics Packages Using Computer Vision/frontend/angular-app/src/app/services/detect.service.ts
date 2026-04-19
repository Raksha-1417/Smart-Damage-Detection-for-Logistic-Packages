/**
 * Detection Service
 * Author: RakshaRajkumar14
 * Date: 2025-11-16 14:37:47 UTC
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Detection {
  id: number;
  class_name: string;
  score: number;
  bbox: number[];
  severity: string;
  color: string;
  dimensions: string;
  crop_url?: string;
}

export interface DetectionResponse {
  success: boolean;
  package_id: number;
  tracking_code: string;
  status: string;
  detections: Detection[];
  total_damages: number;
  severity_counts: {
    severe: number;
    moderate: number;
    minor: number;
  };
  annotated_image_url: string;
  original_s3_url?: string;
  annotated_s3_url?: string;
  gradcam_url?: string;
  gradcam_s3_url?: string;
  shap_url?: string;
  shap_s3_url?: string;
  image_width: number;
  image_height: number;
  inference_time_ms: number;
  timestamp: string;
  inspector: string;
}

@Injectable({
  providedIn: 'root'
})
export class DetectService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  detect(file: File, trackingCode?: string): Observable<DetectionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (trackingCode) {
      formData.append('tracking_code', trackingCode);
    }
    
    console.log('🔍 Uploading image for detection...');
    
    return this.http.post<DetectionResponse>(`${this.apiUrl}/detect`, formData);
  }

  getPackageDetails(trackingCode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/packages/${trackingCode}`);
  }
}
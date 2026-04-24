import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    username: string;
    full_name: string;
    email: string;
    role: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
   private isBrowser: boolean;
  
  getApiUrl(): string {
    return this.apiUrl;
  }
  
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();


  constructor(
    private http: HttpClient,
    private router: Router,
   @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Initialize user only in browser
    if (this.isBrowser) {
      const user = this.getCurrentUser();
      if (user) {
        this.currentUserSubject.next(user);
      }
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    console.log('🔐 Login attempt:', { username });
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      username: username,
      password: password
    }).pipe(
      tap(response => {
        console.log('✅ Login successful');
        if (this.isBrowser) {
          localStorage.setItem('auth_token', response.access_token);
          localStorage.setItem('current_user', JSON.stringify(response.user));
        }
        this.currentUserSubject.next(response.user);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('auth_token');
  }

  getCurrentUser(): any {
    if (!this.isBrowser) return null;
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    return !!this.getToken();
  }
}
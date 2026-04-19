import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
       <div class="app-container">
      <!-- Show sidebar and menu only if logged in and not on login page -->
      <ng-container *ngIf="shouldShowSidebar()">
        <!-- Mobile Menu Button (Hamburger) -->
        <button class="mobile-menu-btn" (click)="openMobileSidebar()" aria-label="Open menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <app-sidebar 
          [isCollapsed]="isSidebarCollapsed"
          [isMobileOpen]="isMobileSidebarOpen"
          (toggleCollapse)="onToggleSidebar($event)"
          (closeMobile)="closeMobileSidebar()">
        </app-sidebar>
      </ng-container>
      
      <main class="main-content" 
            [class.expanded]="isSidebarCollapsed && shouldShowSidebar()"
            [class.full-width]="!shouldShowSidebar()">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      min-height: 100vh;
      background: #f8f9fa;
      position: relative;
    }

    .mobile-menu-btn {
      display: none;
      position: fixed;
      top: 1rem;
      left: 1rem;
      z-index: 998;
      width: 48px;
      height: 48px;
      border: none;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      align-items: center;
      justify-content: center;
      color: #667eea;
      transition: all 0.3s ease;
    }

    .mobile-menu-btn:hover {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
    }

    .mobile-menu-btn:active {
      transform: scale(0.95);
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      position: relative;
      overflow-x: hidden;
      transition: margin-left 0.3s ease;
    }

    .main-content.expanded {
      margin-left: 85px;
    }

    @media (max-width: 768px) {
      .mobile-menu-btn {
        display: flex;
      }

      .main-content {
        margin-left: 0;
      }

      .main-content.expanded {
        margin-left: 0;
      }
    }
  `]
})
export class AppComponent {
 title = 'damage-detect-ai';
  isSidebarCollapsed = false;
  isMobileSidebarOpen = false;
  currentRoute = '';
  private isBrowser: boolean;

  constructor(
    public authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Track route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });
  }

  shouldShowSidebar(): boolean {
    // Don't show sidebar on login page
    if (this.currentRoute === '/login' || this.currentRoute === '/') {
      return false;
    }
    
    // Only show sidebar if user is logged in
    return this.isBrowser && this.authService.isLoggedIn();
  }

  onToggleSidebar(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  openMobileSidebar() {
    this.isMobileSidebarOpen = true;
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
  }
}
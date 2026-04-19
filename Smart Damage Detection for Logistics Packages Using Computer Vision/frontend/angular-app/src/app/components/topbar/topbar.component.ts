import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="top-bar">
      <button class="menu-btn" (click)="menuClick.emit()">☰</button>
      
      <div class="search-container">
        <input 
          type="search" 
          placeholder="Search by package ID or batch..."
          [(ngModel)]="searchQuery"
          class="search-input"
        />
      </div>

      <div class="actions">
        <button class="icon-btn">
          <span class="notification-badge"></span>
          🔔
        </button>
        <button class="icon-btn avatar">👤</button>
      </div>
    </header>
  `,
  styles: [`
    .top-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      background: white;
      border-bottom: 1px solid var(--gray-200);
      height: 4rem;
    }

    .menu-btn {
      display: block;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
      color: var(--gray-700);
    }

    .search-container {
      flex: 1;
      max-width: 28rem;
    }

    .search-input {
      width: 100%;
      padding: 0.5rem 1rem;
      border: 1px solid var(--gray-300);
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary);
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .icon-btn {
      position: relative;
      width: 2.5rem;
      height: 2.5rem;
      border: none;
      background: none;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.25rem;
      transition: background 0.2s;
    }

    .icon-btn:hover {
      background: var(--gray-100);
    }

    .notification-badge {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 0.5rem;
      height: 0.5rem;
      background: var(--warning);
      border-radius: 50%;
    }

    .avatar {
      background: var(--primary);
      color: white;
    }

    @media (min-width: 1024px) {
      .menu-btn {
        display: none;
      }
    }
  `]
})
export class TopBarComponent {
  @Output() menuClick = new EventEmitter<void>();
  searchQuery = '';
}

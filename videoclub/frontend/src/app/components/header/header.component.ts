import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { UserDateContextService } from '../../services/user-date-context.service';
import { UserRoleContextService, UserRole } from '../../services/user-role-context.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule
  ],
  template: `
    <mat-toolbar color="primary" class="main-toolbar">
      <div class="logo-section">
        <mat-icon>local_movies</mat-icon>
      </div>

      <nav class="nav-links">
        <a mat-button routerLink="/alquileres" routerLinkActive="active-link">
          <mat-icon>shopping_cart</mat-icon> Alquileres
        </a>
        <a mat-button routerLink="/videoclubs" routerLinkActive="active-link">
          <mat-icon>store</mat-icon> Videoclubs
        </a>
        <a mat-button routerLink="/peliculas" routerLinkActive="active-link">
          <mat-icon>movie</mat-icon> Películas
        </a>
        <a mat-button routerLink="/socios" routerLinkActive="active-link">
          <mat-icon>people</mat-icon> Socios
        </a>
        <a mat-button routerLink="/estadisticas" routerLinkActive="active-link" *ngIf="userRoleService.isAdmin()">
          <mat-icon>analytics</mat-icon> Estadísticas
        </a>
      </nav>

      <span class="spacer"></span>

      <!-- Control Manual de Fecha Operativa (NO USAR FECHA SISTEMA) -->
      <div class="date-context-box">
        <mat-icon class="calendar-icon">today</mat-icon>
        <span class="date-label">Fecha Manual:</span>
        <input 
          type="date" 
          class="manual-date-input" 
          [ngModel]="dateService.currentDate()" 
          (ngModelChange)="onDateChange($event)"
          title="Fecha de referencia simulada por el usuario (prohibido reloj del sistema)"
        />
      </div>

      <!-- Selector de Rol Activo -->
      <div class="role-selector-box">
        <mat-icon>badge</mat-icon>
        <select 
          class="custom-role-select" 
          [ngModel]="userRoleService.currentRole()" 
          (ngModelChange)="onRoleChange($event)"
        >
          <option value="ADMIN">👑 Administrador</option>
          <option value="GERENTE">🏢 Gerente</option>
          <option value="SOCIO">👤 Socio</option>
        </select>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .main-toolbar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 0 24px;
      background: #1a237e;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      font-size: 1.25rem;
      letter-spacing: 0.5px;
    }

    .nav-links {
      display: flex;
      gap: 8px;
      margin-left: 16px;

      a {
        color: rgba(255, 255, 255, 0.85);
        font-weight: 500;
        border-radius: 6px;

        &.active-link {
          background-color: rgba(255, 255, 255, 0.15);
          color: #ffffff;
        }
      }
    }

    .spacer {
      flex: 1 1 auto;
    }

    .date-context-box {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.12);
      padding: 4px 12px;
      border-radius: 20px;
      gap: 8px;
      font-size: 0.85rem;
      border: 1px solid rgba(255, 255, 255, 0.25);

      .calendar-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .date-label {
        font-weight: 500;
        color: #e0e0e0;
      }

      .manual-date-input {
        background: #ffffff;
        border: none;
        border-radius: 4px;
        padding: 4px 8px;
        font-family: inherit;
        font-weight: 600;
        color: #1a237e;
        cursor: pointer;
        outline: none;
      }
    }

    .role-selector-box {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.12);
      padding: 4px 12px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.25);

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .custom-role-select {
        background: #ffffff;
        border: none;
        border-radius: 4px;
        padding: 4px 8px;
        font-family: inherit;
        font-weight: 600;
        color: #1a237e;
        cursor: pointer;
        outline: none;
      }
    }
  `]
})
export class HeaderComponent {
  readonly dateService = inject(UserDateContextService);
  readonly userRoleService = inject(UserRoleContextService);

  onDateChange(newDate: string): void {
    this.dateService.setDate(newDate);
  }

  onRoleChange(newRole: UserRole): void {
    this.userRoleService.setRole(newRole);
  }
}

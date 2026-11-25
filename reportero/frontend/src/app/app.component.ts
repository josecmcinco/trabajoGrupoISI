import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <div class="brand">
        <mat-icon>newspaper</mat-icon>
        <span>SIGER · Journ SL</span>
      </div>

      <nav class="nav-links">
        <a mat-button routerLink="/solicitudes" routerLinkActive="active-link">
          <mat-icon>assignment</mat-icon>
          Solicitudes
        </a>
        <a mat-button routerLink="/aceptadas" routerLinkActive="active-link">
          <mat-icon>check_circle</mat-icon>
          Aceptadas
        </a>
        <a mat-button routerLink="/categorias" routerLinkActive="active-link">
          <mat-icon>category</mat-icon>
          Categorías
        </a>
        <a mat-button routerLink="/reporteros" routerLinkActive="active-link">
          <mat-icon>trending_up</mat-icon>
          Bolsa / Promoción
        </a>
        <a mat-button routerLink="/reportajes" routerLinkActive="active-link">
          <mat-icon>photo_library</mat-icon>
          Reportajes
        </a>
        <a mat-button routerLink="/editoriales" routerLinkActive="active-link">
          <mat-icon>business</mat-icon>
          Editoriales
        </a>
        <a mat-button routerLink="/albaranes" routerLinkActive="active-link">
          <mat-icon>receipt_long</mat-icon>
          Albaranes
        </a>
      </nav>
    </mat-toolbar>

    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .app-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .nav-links {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
    .active-link {
      background-color: rgba(255, 255, 255, 0.18);
    }
  `]
})
export class AppComponent {}

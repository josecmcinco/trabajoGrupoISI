import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Solicitud } from '../../core/models/siger.models';
import { SolicitudesService } from '../../core/services/solicitudes.service';
import { extractErrorMessage } from '../../core/utils/error.utils';

@Component({
  selector: 'app-aceptadas',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTableModule
  ],
  template: `
    <div class="page-container">
      <div class="section-header">
        <h1>Solicitudes Aceptadas</h1>
        <button mat-stroked-button color="primary" (click)="cargarAceptadas()">
          <mat-icon>refresh</mat-icon>
          Actualizar
        </button>
      </div>

      @if (cargando()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      <mat-card>
        <mat-card-content>
          <table class="siger-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>DNI</th>
                <th>Reportero</th>
                <th>Categoría en Bolsa</th>
              </tr>
            </thead>
            <tbody>
              @for (s of aceptadas(); track s.id) {
                <tr>
                  <td>#{{ s.id }}</td>
                  <td>{{ s.fecha | date: 'dd/MM/yyyy' }}</td>
                  <td>{{ s.reportero.dni }}</td>
                  <td>{{ s.reportero.nombre }} {{ s.reportero.apellidos }}</td>
                  <td>
                    @if (s.reportero.categoria) {
                      Nivel {{ s.reportero.categoria.nivel }} — {{ s.reportero.categoria.nombre }}
                    } @else {
                      —
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>

          @if (aceptadas().length === 0) {
            <div class="empty-state">No hay solicitudes aprobadas todavía.</div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class AceptadasComponent implements OnInit {
  private readonly solicitudesService = inject(SolicitudesService);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['id', 'fecha', 'dni', 'reportero', 'categoria'];
  readonly aceptadas = signal<Solicitud[]>([]);
  readonly cargando = signal(false);

  ngOnInit(): void {
    this.cargarAceptadas();
  }

  cargarAceptadas(): void {
    this.cargando.set(true);
    this.solicitudesService.listarSolicitudesAceptadas().subscribe({
      next: (data) => {
        this.aceptadas.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.snackBar.open(extractErrorMessage(err), 'Cerrar', { duration: 5000 });
      }
    });
  }
}

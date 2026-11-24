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
          @if (aceptadas().length === 0) {
            <div class="empty-state">No hay solicitudes aprobadas todavía.</div>
          } @else {
            <table mat-table [dataSource]="aceptadas()" class="full-width-table">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let s">#{{ s.id }}</td>
              </ng-container>

              <ng-container matColumnDef="fecha">
                <th mat-header-cell *matHeaderCellDef>Fecha</th>
                <td mat-cell *matCellDef="let s">{{ s.fecha | date: 'dd/MM/yyyy' }}</td>
              </ng-container>

              <ng-container matColumnDef="dni">
                <th mat-header-cell *matHeaderCellDef>DNI</th>
                <td mat-cell *matCellDef="let s">{{ s.reportero.dni }}</td>
              </ng-container>

              <ng-container matColumnDef="reportero">
                <th mat-header-cell *matHeaderCellDef>Reportero</th>
                <td mat-cell *matCellDef="let s">{{ s.reportero.nombre }} {{ s.reportero.apellidos }}</td>
              </ng-container>

              <ng-container matColumnDef="categoria">
                <th mat-header-cell *matHeaderCellDef>Categoría en Bolsa</th>
                <td mat-cell *matCellDef="let s">
                  @if (s.reportero.categoria) {
                    Nivel {{ s.reportero.categoria.nivel }} — {{ s.reportero.categoria.nombre }}
                  } @else {
                    —
                  }
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
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

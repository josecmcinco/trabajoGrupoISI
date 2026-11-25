import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Reportaje, Reportero } from '../../core/models/siger.models';
import { ReportajesService } from '../../core/services/reportajes.service';
import { ReporterosService } from '../../core/services/reporteros.service';
import { extractErrorMessage } from '../../core/utils/error.utils';

@Component({
  selector: 'app-reportajes',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="section-header">
        <h1>Reportajes Fotográficos</h1>
        <button mat-stroked-button color="primary" (click)="cargarDatos()">
          <mat-icon>refresh</mat-icon>
          Actualizar
        </button>
      </div>

      @if (cargando()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      <mat-card>
        <mat-card-header>
          <mat-card-title>Nuevo Reportaje</mat-card-title>
          <mat-card-subtitle>
            Solo los reporteros aprobados en bolsa pueden dar de alta reportajes fotográficos.
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="crearReportaje()" class="reportaje-form">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Reportero en bolsa *</mat-label>
                <mat-select formControlName="reporteroId">
                  @for (r of reporteros(); track r.id) {
                    <mat-option [value]="r.id">
                      {{ r.nombre }} {{ r.apellidos }} ({{ r.dni }}) — Nivel {{ r.categoria?.nivel }}
                      ({{ r.categoria?.precioPorFoto | currency: 'EUR' }}/foto)
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Número de fotos *</mat-label>
                <input matInput type="number" min="1" step="1" formControlName="numeroFotos" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="span-2">
                <mat-label>Descripción del reportaje *</mat-label>
                <textarea
                  matInput
                  rows="3"
                  maxlength="1000"
                  formControlName="descripcion"
                  placeholder="Describe la temática, lugar y contenido del reportaje..."></textarea>
              </mat-form-field>
            </div>

            @if (reporteros().length === 0 && !cargando()) {
              <div class="hint-warning">
                No hay reporteros aprobados en bolsa todavía. Aprueba primero una solicitud para poder registrar reportajes.
              </div>
            }

            <div class="actions-row">
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || guardando()">
                <mat-icon>add_a_photo</mat-icon>
                Registrar Reportaje
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Listado de Reportajes ({{ reportajes().length }})</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table class="siger-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Reportero</th>
                <th>Nº Fotos</th>
                <th>Tarifa Base</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              @for (rep of reportajes(); track rep.id) {
                <tr>
                  <td>#{{ rep.id }}</td>
                  <td>{{ rep.fechaCreacion | date: 'dd/MM/yyyy HH:mm' }}</td>
                  <td>
                    <strong>{{ rep.reportero.nombre }} {{ rep.reportero.apellidos }}</strong>
                    <div class="subtext">
                      DNI: {{ rep.reportero.dni }} ·
                      @if (rep.reportero.categoria) {
                        Nivel {{ rep.reportero.categoria.nivel }} ({{ rep.reportero.categoria.precioPorFoto | currency: 'EUR' }}/foto)
                      }
                    </div>
                  </td>
                  <td>{{ rep.numeroFotos }}</td>
                  <td>
                    @if (rep.reportero.categoria) {
                      {{ rep.numeroFotos * rep.reportero.categoria.precioPorFoto | currency: 'EUR' }}
                    } @else {
                      —
                    }
                  </td>
                  <td>{{ rep.descripcion }}</td>
                </tr>
              }
            </tbody>
          </table>

          @if (reportajes().length === 0) {
            <div class="empty-state">No hay reportajes registrados todavía.</div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .reportaje-form {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 12px;
    }
    .span-2 {
      grid-column: 1 / -1;
    }
    .actions-row {
      display: flex;
      justify-content: flex-end;
    }
    .subtext {
      font-size: 0.8rem;
      color: #64748b;
    }
    .hint-warning {
      padding: 10px 14px;
      border-radius: 6px;
      background-color: #fef3c7;
      color: #92400e;
      font-size: 0.875rem;
    }
  `]
})
export class ReportajesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reportajesService = inject(ReportajesService);
  private readonly reporterosService = inject(ReporterosService);
  private readonly snackBar = inject(MatSnackBar);

  readonly reportajes = signal<Reportaje[]>([]);
  readonly reporteros = signal<Reportero[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);

  readonly form = this.fb.group({
    reporteroId: [null as number | null, Validators.required],
    numeroFotos: [1, [Validators.required, Validators.min(1)]],
    descripcion: ['', [Validators.required, Validators.maxLength(1000)]]
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.reporterosService.listarReporteros(true).subscribe({
      next: (data) => this.reporteros.set(data),
      error: (err) => this.mostrarError(extractErrorMessage(err))
    });

    this.reportajesService.listarReportajes().subscribe({
      next: (data) => {
        this.reportajes.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mostrarError(extractErrorMessage(err));
      }
    });
  }

  crearReportaje(): void {
    if (this.form.invalid) {
      return;
    }
    const raw = this.form.getRawValue();
    if (!raw.reporteroId || !raw.numeroFotos || !raw.descripcion) {
      return;
    }
    this.guardando.set(true);
    this.reportajesService
      .crearReportaje({
        reporteroId: raw.reporteroId,
        numeroFotos: Number(raw.numeroFotos),
        descripcion: raw.descripcion
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.snackBar.open('Reportaje registrado correctamente', 'Cerrar', { duration: 3500 });
          this.form.reset({ reporteroId: null, numeroFotos: 1, descripcion: '' });
          this.cargarDatos();
        },
        error: (err) => {
          this.guardando.set(false);
          this.mostrarError(extractErrorMessage(err));
        }
      });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
  }
}

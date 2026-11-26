import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { forkJoin } from 'rxjs';
import { Editorial, Exclusiva, Reportero } from '../../core/models/siger.models';
import { EditorialesService } from '../../core/services/editoriales.service';
import { ExclusivasService } from '../../core/services/exclusivas.service';
import { ReporterosService } from '../../core/services/reporteros.service';
import { extractErrorMessage } from '../../core/utils/error.utils';

@Component({
  selector: 'app-exclusivas',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  template: `
    <div class="page-container">
      <div class="section-header">
        <h1>Gestión de Exclusivas</h1>
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
          <mat-card-title>Nueva Exclusiva (Secretario)</mat-card-title>
          <mat-card-subtitle>
            Registra la petición de una editorial para ofertarla en la agencia de reporteros.
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="crearExclusiva()" class="exclusiva-form">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Editorial *</mat-label>
                <mat-select formControlName="editorialId">
                  @for (editorial of editoriales(); track editorial.id) {
                    <mat-option [value]="editorial.id">
                      {{ editorial.nombre }} ({{ editorial.cif }})
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Precio al reportero (€) *</mat-label>
                <input matInput type="number" min="0.01" step="0.01" formControlName="precioReportero" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Fecha de creación *</mat-label>
                <input matInput type="date" formControlName="fechaCreacion" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="span-full">
                <mat-label>Temática de la exclusiva *</mat-label>
                <textarea
                  matInput
                  rows="3"
                  maxlength="1000"
                  formControlName="tematica"
                  placeholder="Describe brevemente la temática solicitada por la editorial..."></textarea>
              </mat-form-field>
            </div>

            @if (editoriales().length === 0 && !cargando()) {
              <div class="hint-warning">
                No hay editoriales registradas. Da de alta una editorial primero para poder crear exclusivas.
              </div>
            }

            <div class="actions-row">
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || guardando()">
                <mat-icon>add_business</mat-icon>
                Dar de Alta Exclusiva
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content>
          <mat-tab-group>
            <mat-tab label="Todas ({{ exclusivas().length }})">
              <div class="tab-content">
                <table class="siger-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Editorial</th>
                      <th>Temática</th>
                      <th>Precio</th>
                      <th>Estado</th>
                      <th>Reportero</th>
                      <th>Creación</th>
                      <th>Asignación</th>
                      <th>Finalización</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (exc of exclusivas(); track exc.id) {
                      <tr>
                        <td>#{{ exc.id }}</td>
                        <td>
                          <strong>{{ exc.editorial.nombre }}</strong>
                          <div class="subtext">{{ exc.editorial.cif }}</div>
                        </td>
                        <td>{{ exc.tematica }}</td>
                        <td>{{ exc.precioReportero | currency: 'EUR' }}</td>
                        <td>
                          <span class="status-badge" [ngClass]="'status-' + exc.estado">{{ exc.estado }}</span>
                        </td>
                        <td>
                          @if (exc.reportero) {
                            {{ exc.reportero.nombre }} {{ exc.reportero.apellidos }}
                            <div class="subtext">{{ exc.reportero.dni }}</div>
                          } @else {
                            <span class="subtext">—</span>
                          }
                        </td>
                        <td>{{ exc.fechaCreacion | date: 'dd/MM/yyyy' }}</td>
                        <td>{{ exc.fechaAsignacion ? (exc.fechaAsignacion | date: 'dd/MM/yyyy') : '—' }}</td>
                        <td>{{ exc.fechaFinalizacion ? (exc.fechaFinalizacion | date: 'dd/MM/yyyy') : '—' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
                @if (exclusivas().length === 0) {
                  <div class="empty-state">No hay exclusivas registradas todavía.</div>
                }
              </div>
            </mat-tab>

            <mat-tab label="Ofertadas / Vista Reportero ({{ ofertadas().length }})">
              <div class="tab-content">
                @if (reporteros().length === 0 && !cargando()) {
                  <div class="hint-warning">
                    No hay reporteros aprobados en bolsa para asignar exclusivas.
                  </div>
                }

                <table class="siger-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Editorial</th>
                      <th>Temática</th>
                      <th>Precio</th>
                      <th>Fecha Creación</th>
                      <th>Asignar Reportero (Secretario)</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (exc of ofertadas(); track exc.id) {
                      <tr>
                        <td>#{{ exc.id }}</td>
                        <td>
                          <strong>{{ exc.editorial.nombre }}</strong>
                          <div class="subtext">{{ exc.editorial.cif }}</div>
                        </td>
                        <td>{{ exc.tematica }}</td>
                        <td>{{ exc.precioReportero | currency: 'EUR' }}</td>
                        <td>{{ exc.fechaCreacion | date: 'dd/MM/yyyy' }}</td>
                        <td>
                          <div class="inline-action">
                            <mat-form-field appearance="outline" class="compact-field">
                              <mat-label>Reportero en bolsa</mat-label>
                              <mat-select
                                [ngModel]="asignacionReportero()[exc.id] ?? null"
                                (ngModelChange)="setReporteroAsignacion(exc.id, $event)">
                                @for (rep of reporteros(); track rep.id) {
                                  <mat-option [value]="rep.id">
                                    {{ rep.nombre }} {{ rep.apellidos }} ({{ rep.dni }})
                                  </mat-option>
                                }
                              </mat-select>
                            </mat-form-field>

                            <mat-form-field appearance="outline" class="compact-date">
                              <mat-label>Fecha asignación</mat-label>
                              <input
                                matInput
                                type="date"
                                [ngModel]="asignacionFecha()[exc.id] ?? ''"
                                (ngModelChange)="setFechaAsignacion(exc.id, $event)" />
                            </mat-form-field>

                            <button
                              mat-raised-button
                              color="primary"
                              [disabled]="procesandoId() === exc.id || !asignacionReportero()[exc.id] || !asignacionFecha()[exc.id]"
                              (click)="asignarExclusiva(exc.id)">
                              <mat-icon>person_add</mat-icon>
                              Asignar
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
                @if (ofertadas().length === 0) {
                  <div class="empty-state">No hay exclusivas ofertadas pendientes de asignación.</div>
                }
              </div>
            </mat-tab>

            <mat-tab label="Asignadas ({{ asignadas().length }})">
              <div class="tab-content">
                <table class="siger-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Editorial</th>
                      <th>Temática</th>
                      <th>Precio</th>
                      <th>Reportero Asignado</th>
                      <th>Fecha Asignación</th>
                      <th>Finalizar y Desasignar (Secretario)</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (exc of asignadas(); track exc.id) {
                      <tr>
                        <td>#{{ exc.id }}</td>
                        <td><strong>{{ exc.editorial.nombre }}</strong></td>
                        <td>{{ exc.tematica }}</td>
                        <td>{{ exc.precioReportero | currency: 'EUR' }}</td>
                        <td>
                          @if (exc.reportero) {
                            <strong>{{ exc.reportero.nombre }} {{ exc.reportero.apellidos }}</strong>
                            <div class="subtext">{{ exc.reportero.dni }}</div>
                          }
                        </td>
                        <td>{{ exc.fechaAsignacion | date: 'dd/MM/yyyy' }}</td>
                        <td>
                          <div class="inline-action">
                            <mat-form-field appearance="outline" class="compact-date">
                              <mat-label>Fecha finalización</mat-label>
                              <input
                                matInput
                                type="date"
                                [ngModel]="finalizacionFecha()[exc.id] ?? ''"
                                (ngModelChange)="setFechaFinalizacion(exc.id, $event)" />
                            </mat-form-field>

                            <button
                              mat-raised-button
                              color="accent"
                              [disabled]="procesandoId() === exc.id || !finalizacionFecha()[exc.id]"
                              (click)="finalizarExclusiva(exc.id)">
                              <mat-icon>task_alt</mat-icon>
                              Finalizar y desasignar
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
                @if (asignadas().length === 0) {
                  <div class="empty-state">No hay exclusivas asignadas actualmente.</div>
                }
              </div>
            </mat-tab>

            <mat-tab label="Finalizadas ({{ finalizadas().length }})">
              <div class="tab-content">
                <table class="siger-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Editorial</th>
                      <th>Temática</th>
                      <th>Precio</th>
                      <th>Creación</th>
                      <th>Asignación</th>
                      <th>Finalización</th>
                      <th>Reportero</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (exc of finalizadas(); track exc.id) {
                      <tr>
                        <td>#{{ exc.id }}</td>
                        <td><strong>{{ exc.editorial.nombre }}</strong></td>
                        <td>{{ exc.tematica }}</td>
                        <td>{{ exc.precioReportero | currency: 'EUR' }}</td>
                        <td>{{ exc.fechaCreacion | date: 'dd/MM/yyyy' }}</td>
                        <td>{{ exc.fechaAsignacion | date: 'dd/MM/yyyy' }}</td>
                        <td>{{ exc.fechaFinalizacion | date: 'dd/MM/yyyy' }}</td>
                        <td><span class="subtext">Desasignada</span></td>
                      </tr>
                    }
                  </tbody>
                </table>
                @if (finalizadas().length === 0) {
                  <div class="empty-state">No hay exclusivas finalizadas todavía.</div>
                }
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .exclusiva-form {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }
    .span-full {
      grid-column: 1 / -1;
    }
    .actions-row {
      display: flex;
      justify-content: flex-end;
    }
    .tab-content {
      padding-top: 16px;
      overflow-x: auto;
    }
    .inline-action {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .compact-field {
      width: 220px;
    }
    .compact-date {
      width: 165px;
    }
    .subtext {
      font-size: 0.8rem;
      color: #64748b;
    }
    .hint-warning {
      margin-bottom: 12px;
      padding: 10px 14px;
      border-radius: 6px;
      background-color: #fef3c7;
      color: #92400e;
      font-size: 0.875rem;
    }
  `]
})
export class ExclusivasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly exclusivasService = inject(ExclusivasService);
  private readonly editorialesService = inject(EditorialesService);
  private readonly reporterosService = inject(ReporterosService);
  private readonly snackBar = inject(MatSnackBar);

  readonly exclusivas = signal<Exclusiva[]>([]);
  readonly editoriales = signal<Editorial[]>([]);
  readonly reporteros = signal<Reportero[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly procesandoId = signal<number | null>(null);

  readonly asignacionReportero = signal<Partial<Record<number, number | null>>>({});
  readonly asignacionFecha = signal<Partial<Record<number, string>>>({});
  readonly finalizacionFecha = signal<Partial<Record<number, string>>>({});

  readonly ofertadas = computed(() => this.exclusivas().filter((e) => e.estado === 'OFERTADA'));
  readonly asignadas = computed(() => this.exclusivas().filter((e) => e.estado === 'ASIGNADA'));
  readonly finalizadas = computed(() => this.exclusivas().filter((e) => e.estado === 'FINALIZADA'));

  readonly form = this.fb.group({
    editorialId: [null as number | null, Validators.required],
    precioReportero: [null as number | null, [Validators.required, Validators.min(0.01)]],
    fechaCreacion: ['', Validators.required],
    tematica: ['', [Validators.required, Validators.maxLength(1000)]]
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    forkJoin({
      exclusivas: this.exclusivasService.listarExclusivas(),
      editoriales: this.editorialesService.listarEditoriales(),
      reporteros: this.reporterosService.listarReporteros(true)
    }).subscribe({
      next: ({ exclusivas, editoriales, reporteros }) => {
        this.exclusivas.set(exclusivas);
        this.editoriales.set(editoriales);
        this.reporteros.set(reporteros);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mostrarError(extractErrorMessage(err));
      }
    });
  }

  crearExclusiva(): void {
    if (this.form.invalid) {
      return;
    }
    const raw = this.form.getRawValue();
    if (!raw.editorialId || !raw.precioReportero || !raw.fechaCreacion || !raw.tematica) {
      return;
    }
    this.guardando.set(true);
    this.exclusivasService
      .crearExclusiva({
        editorialId: raw.editorialId,
        precioReportero: Number(raw.precioReportero),
        fechaCreacion: raw.fechaCreacion,
        tematica: raw.tematica
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.snackBar.open('Exclusiva dada de alta correctamente', 'Cerrar', { duration: 3500 });
          this.form.reset({ editorialId: null, precioReportero: null, fechaCreacion: '', tematica: '' });
          this.cargarDatos();
        },
        error: (err) => {
          this.guardando.set(false);
          this.mostrarError(extractErrorMessage(err));
        }
      });
  }

  asignarExclusiva(exclusivaId: number): void {
    const reporteroId = this.asignacionReportero()[exclusivaId];
    const fechaAsignacion = this.asignacionFecha()[exclusivaId];
    if (!reporteroId || !fechaAsignacion) {
      return;
    }
    this.procesandoId.set(exclusivaId);
    this.exclusivasService
      .asignarExclusiva(exclusivaId, { reporteroId, fechaAsignacion })
      .subscribe({
        next: () => {
          this.procesandoId.set(null);
          this.snackBar.open('Exclusiva asignada al reportero correctamente', 'Cerrar', { duration: 3500 });
          this.limpiarBorradorAsignacion(exclusivaId);
          this.cargarDatos();
        },
        error: (err) => {
          this.procesandoId.set(null);
          this.mostrarError(extractErrorMessage(err));
        }
      });
  }

  finalizarExclusiva(exclusivaId: number): void {
    const fechaFinalizacion = this.finalizacionFecha()[exclusivaId];
    if (!fechaFinalizacion) {
      return;
    }
    this.procesandoId.set(exclusivaId);
    this.exclusivasService
      .finalizarExclusiva(exclusivaId, { fechaFinalizacion })
      .subscribe({
        next: () => {
          this.procesandoId.set(null);
          this.snackBar.open('Exclusiva finalizada y reportero desasignado', 'Cerrar', { duration: 3500 });
          this.limpiarBorradorFinalizacion(exclusivaId);
          this.cargarDatos();
        },
        error: (err) => {
          this.procesandoId.set(null);
          this.mostrarError(extractErrorMessage(err));
        }
      });
  }

  setReporteroAsignacion(exclusivaId: number, reporteroId: number | null): void {
    this.asignacionReportero.update((prev) => ({ ...prev, [exclusivaId]: reporteroId }));
  }

  setFechaAsignacion(exclusivaId: number, fecha: string): void {
    this.asignacionFecha.update((prev) => ({ ...prev, [exclusivaId]: fecha }));
  }

  setFechaFinalizacion(exclusivaId: number, fecha: string): void {
    this.finalizacionFecha.update((prev) => ({ ...prev, [exclusivaId]: fecha }));
  }

  private limpiarBorradorAsignacion(exclusivaId: number): void {
    this.asignacionReportero.update((prev) => {
      const next = { ...prev };
      delete next[exclusivaId];
      return next;
    });
    this.asignacionFecha.update((prev) => {
      const next = { ...prev };
      delete next[exclusivaId];
      return next;
    });
  }

  private limpiarBorradorFinalizacion(exclusivaId: number): void {
    this.finalizacionFecha.update((prev) => {
      const next = { ...prev };
      delete next[exclusivaId];
      return next;
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
  }
}

import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Categoria, CrearSolicitudRequest, EstadoSolicitud, Solicitud } from '../../core/models/siger.models';
import { CategoriasService } from '../../core/services/categorias.service';
import { SolicitudesService } from '../../core/services/solicitudes.service';
import { extractErrorMessage } from '../../core/utils/error.utils';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule
  ],
  template: `
    <div class="page-container">
      <div class="section-header">
        <h1>Solicitudes de Reporteros</h1>
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
          <mat-card-title>Nueva Solicitud</mat-card-title>
          <mat-card-subtitle>
            Registra la solicitud de un reportero. Un reportero no puede presentar más de una solicitud al mes.
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="crearSolicitud()" class="solicitud-form">
            <div class="toggle-row">
              <mat-checkbox [checked]="esPrimeraSolicitud()" (change)="togglePrimeraSolicitud($event.checked)">
                Es la primera solicitud del reportero (incluir datos personales)
              </mat-checkbox>
            </div>

            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>DNI *</mat-label>
                <input matInput formControlName="dni" placeholder="12345678A" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Fecha de solicitud</mat-label>
                <input matInput type="date" formControlName="fecha" />
              </mat-form-field>

              @if (esPrimeraSolicitud()) {
                <mat-form-field appearance="outline">
                  <mat-label>Nombre *</mat-label>
                  <input matInput formControlName="nombre" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Apellidos *</mat-label>
                  <input matInput formControlName="apellidos" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Dirección *</mat-label>
                  <input matInput formControlName="direccion" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Ciudad *</mat-label>
                  <input matInput formControlName="ciudad" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Código Postal *</mat-label>
                  <input matInput formControlName="codigoPostal" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Teléfono *</mat-label>
                  <input matInput formControlName="telefono" />
                </mat-form-field>
              }

              <mat-form-field appearance="outline" class="span-2">
                <mat-label>Equipo fotográfico (opcional)</mat-label>
                <input matInput formControlName="equipoFotografico" placeholder="Ej. Sony A7 IV + 24-70mm" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="span-2">
                <mat-label>Resumen del CV *</mat-label>
                <textarea matInput rows="3" formControlName="resumenCv" placeholder="Experiencia periodística relevante..."></textarea>
              </mat-form-field>
            </div>

            <div class="actions-row">
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || guardando()">
                <mat-icon>add</mat-icon>
                Registrar Solicitud
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Histórico de Solicitudes ({{ solicitudesFiltradas().length }})</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="filter-row">
            <mat-form-field appearance="outline">
              <mat-label>Filtrar por estado</mat-label>
              <mat-select [value]="filtroEstado()" (selectionChange)="filtroEstado.set($event.value)">
                <mat-option value="TODAS">Todas</mat-option>
                <mat-option value="PENDIENTE">Pendientes</mat-option>
                <mat-option value="APROBADA">Aprobadas</mat-option>
                <mat-option value="RECHAZADA">Rechazadas</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          @if (solicitudesFiltradas().length === 0) {
            <div class="empty-state">No hay solicitudes para mostrar.</div>
          } @else {
            <table mat-table [dataSource]="solicitudesFiltradas()" class="full-width-table">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let s">#{{ s.id }}</td>
              </ng-container>

              <ng-container matColumnDef="fecha">
                <th mat-header-cell *matHeaderCellDef>Fecha</th>
                <td mat-cell *matCellDef="let s">{{ s.fecha | date: 'dd/MM/yyyy' }}</td>
              </ng-container>

              <ng-container matColumnDef="reportero">
                <th mat-header-cell *matCellDef>Reportero</th>
                <td mat-cell *matCellDef="let s">
                  <strong>{{ s.reportero.nombre }} {{ s.reportero.apellidos }}</strong>
                  <div class="subtext">DNI: {{ s.reportero.dni }} · {{ s.reportero.ciudad }}</div>
                </td>
              </ng-container>

              <ng-container matColumnDef="detalles">
                <th mat-header-cell *matCellDef>Equipo y CV</th>
                <td mat-cell *matCellDef="let s">
                  <div>{{ s.resumenCv }}</div>
                  @if (s.equipoFotografico) {
                    <div class="subtext">Equipo: {{ s.equipoFotografico }}</div>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="estado">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let s">
                  <span class="status-badge status-{{ s.estado }}">{{ s.estado }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Resolución</th>
                <td mat-cell *matCellDef="let s">
                  @if (s.estado === 'PENDIENTE') {
                    <div class="resolve-actions">
                      <mat-form-field appearance="outline" class="compact-select">
                        <mat-label>Categoría</mat-label>
                        <mat-select
                          [value]="categoriaSeleccionada(s.id)"
                          (selectionChange)="seleccionarCategoria(s.id, $event.value)">
                          @for (cat of categorias(); track cat.id) {
                            <mat-option [value]="cat.id">
                              Nivel {{ cat.nivel }} - {{ cat.nombre }}
                            </mat-option>
                          }
                        </mat-select>
                      </mat-form-field>

                      <button
                        mat-flat-button
                        color="primary"
                        [disabled]="!categoriaSeleccionada(s.id)"
                        (click)="aprobarSolicitud(s)">
                        Aprobar
                      </button>
                      <button mat-stroked-button color="warn" (click)="rechazarSolicitud(s)">
                        Rechazar
                      </button>
                    </div>
                  } @else if (s.reportero.categoria) {
                    <span class="subtext">Categoría actual: Nivel {{ s.reportero.categoria.nivel }}</span>
                  } @else {
                    <span class="subtext">—</span>
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
  `,
  styles: [`
    .solicitud-form {
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
    .span-2 {
      grid-column: 1 / -1;
    }
    .actions-row {
      display: flex;
      justify-content: flex-end;
    }
    .filter-row {
      margin-top: 12px;
      margin-bottom: 8px;
    }
    .subtext {
      font-size: 0.8rem;
      color: #64748b;
    }
    .resolve-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0;
      flex-wrap: wrap;
    }
    .compact-select {
      width: 210px;
      margin-bottom: -1.25em;
    }
  `]
})
export class SolicitudesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly solicitudesService = inject(SolicitudesService);
  private readonly categoriasService = inject(CategoriasService);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['id', 'fecha', 'reportero', 'detalles', 'estado', 'acciones'];

  readonly solicitudes = signal<Solicitud[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly esPrimeraSolicitud = signal(true);
  readonly filtroEstado = signal<'TODAS' | EstadoSolicitud>('TODAS');
  private readonly categoriasPorSolicitud = signal<Record<number, number>>({});

  readonly solicitudesFiltradas = computed(() => {
    const estado = this.filtroEstado();
    const lista = this.solicitudes();
    return estado === 'TODAS' ? lista : lista.filter((s) => s.estado === estado);
  });

  readonly form = this.fb.nonNullable.group({
    dni: ['', Validators.required],
    fecha: [''],
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    direccion: ['', Validators.required],
    ciudad: ['', Validators.required],
    codigoPostal: ['', Validators.required],
    telefono: ['', Validators.required],
    equipoFotografico: [''],
    resumenCv: ['', Validators.required]
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.categoriasService.listarCategorias().subscribe({
      next: (cats) => this.categorias.set(cats),
      error: (err) => this.mostrarError(extractErrorMessage(err))
    });

    this.solicitudesService.listarSolicitudes().subscribe({
      next: (data) => {
        this.solicitudes.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mostrarError(extractErrorMessage(err));
      }
    });
  }

  togglePrimeraSolicitud(primera: boolean): void {
    this.esPrimeraSolicitud.set(primera);
    const camposPersonales = ['nombre', 'apellidos', 'direccion', 'ciudad', 'codigoPostal', 'telefono'] as const;
    for (const campo of camposPersonales) {
      const control = this.form.controls[campo];
      if (primera) {
        control.setValidators([Validators.required]);
      } else {
        control.clearValidators();
        control.setValue('');
      }
      control.updateValueAndValidity();
    }
  }

  crearSolicitud(): void {
    if (this.form.invalid) {
      return;
    }
    this.guardando.set(true);
    const raw = this.form.getRawValue();
    const payload: CrearSolicitudRequest = {
      dni: raw.dni,
      resumenCv: raw.resumenCv,
      equipoFotografico: raw.equipoFotografico || undefined,
      fecha: raw.fecha || undefined,
      ...(this.esPrimeraSolicitud()
        ? {
            nombre: raw.nombre,
            apellidos: raw.apellidos,
            direccion: raw.direccion,
            ciudad: raw.ciudad,
            codigoPostal: raw.codigoPostal,
            telefono: raw.telefono
          }
        : {})
    };

    this.solicitudesService.crearSolicitud(payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.snackBar.open('Solicitud registrada correctamente', 'Cerrar', { duration: 3500 });
        this.form.reset();
        this.cargarDatos();
      },
      error: (err) => {
        this.guardando.set(false);
        this.mostrarError(extractErrorMessage(err));
      }
    });
  }

  seleccionarCategoria(solicitudId: number, categoriaId: number): void {
    this.categoriasPorSolicitud.update((map) => ({ ...map, [solicitudId]: categoriaId }));
  }

  categoriaSeleccionada(solicitudId: number): number | null {
    return this.categoriasPorSolicitud()[solicitudId] ?? null;
  }

  aprobarSolicitud(solicitud: Solicitud): void {
    const categoriaId = this.categoriaSeleccionada(solicitud.id);
    if (!categoriaId) {
      return;
    }
    this.solicitudesService.aprobarSolicitud(solicitud.id, { categoriaId }).subscribe({
      next: () => {
        this.snackBar.open('Solicitud aprobada y reportero incorporado a la bolsa', 'Cerrar', { duration: 3500 });
        this.cargarDatos();
      },
      error: (err) => this.mostrarError(extractErrorMessage(err))
    });
  }

  rechazarSolicitud(solicitud: Solicitud): void {
    this.solicitudesService.rechazarSolicitud(solicitud.id).subscribe({
      next: () => {
        this.snackBar.open('Solicitud marcada como rechazada', 'Cerrar', { duration: 3500 });
        this.cargarDatos();
      },
      error: (err) => this.mostrarError(extractErrorMessage(err))
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
  }
}

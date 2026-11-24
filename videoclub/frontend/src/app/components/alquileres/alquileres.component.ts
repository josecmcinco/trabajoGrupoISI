import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AlquilerService } from '../../services/alquiler.service';
import { SocioService } from '../../services/socio.service';
import { VideoclubService } from '../../services/videoclub.service';
import { PeliculaService } from '../../services/pelicula.service';
import { UserDateContextService } from '../../services/user-date-context.service';
import { NotificationService } from '../../services/notification.service';
import { Alquiler } from '../../models/alquiler.model';
import { Socio } from '../../models/socio.model';
import { Videoclub } from '../../models/videoclub.model';
import { Pelicula } from '../../models/pelicula.model';

@Component({
  selector: 'app-alquileres',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDialogModule
  ],
  template: `
    <div class="container">
      <div class="page-header">
        <h1><mat-icon>shopping_cart</mat-icon> Gestión de Alquileres</h1>
        <button mat-flat-button color="primary" (click)="toggleNuevo()">
          <mat-icon>{{ showForm() ? 'close' : 'add_shopping_cart' }}</mat-icon>
          {{ showForm() ? 'Cancelar' : 'Nuevo Alquiler' }}
        </button>
      </div>

      <!-- Banner de Regla de Negocio de Fechas -->
      <div class="card-elevated info-banner">
        <mat-icon color="accent">calendar_clock</mat-icon>
        <div>
          <strong>Control Manual de Fechas:</strong>
          La fecha de recogida es fija tras el registro. La fecha de devolución solo puede actualizarse a una fecha
          <strong>posterior</strong> a la fecha actual manual del sistema (Fecha de referencia actual: 
          <code>{{ dateService.currentDate() }}</code>).
        </div>
      </div>

      <!-- Formulario para Crear Alquiler -->
      <div class="card-elevated" *ngIf="showForm()">
        <h2><mat-icon>post_add</mat-icon> Registrar Alquiler de Películas</h2>
        <form [formGroup]="form" (ngSubmit)="guardar()" class="form-grid">
          
          <mat-form-field appearance="outline">
            <mat-label>Socio</mat-label>
            <mat-select formControlName="socioId" required>
              <mat-option *ngFor="let s of socios()" [value]="s.id">
                {{ s.nombre }} (ID: {{ s.id }} - Origen: {{ s.videoclubOrigenCiudad }})
              </mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('socioId')?.invalid">Debe seleccionar un socio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Videoclub (Sede donde alquila)</mat-label>
            <mat-select formControlName="videoclubId" (selectionChange)="onVideoclubChange($event.value)" required>
              <mat-option *ngFor="let v of videoclubs()" [value]="v.id">
                {{ v.ciudad }} (ID: {{ v.id }})
              </mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('videoclubId')?.invalid">Debe seleccionar una sede</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Películas a Alquilar (Selección múltiple)</mat-label>
            <mat-select formControlName="peliculaIds" multiple required (selectionChange)="onPeliculasSelected($event.value)">
              <mat-option *ngFor="let p of peliculasDisponibles()" [value]="p.id">
                {{ p.nombre }} — {{ p.precioAlquiler | currency:'EUR':'symbol':'1.2-2' }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('peliculaIds')?.invalid">Seleccione al menos una película</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fecha de Recogida (Manual)</mat-label>
            <input matInput type="date" formControlName="fechaRecogida" required>
            <mat-error *ngIf="form.get('fechaRecogida')?.invalid">Fecha obligatoria</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fecha de Devolución (Manual)</mat-label>
            <input matInput type="date" formControlName="fechaDevolucion" required>
            <mat-error *ngIf="form.get('fechaDevolucion')?.invalid">Fecha obligatoria</mat-error>
          </mat-form-field>

          <!-- Resumen Derivado en Tiempo Real -->
          <div class="total-box">
            <span class="total-label">Total a Pagar (Derivado):</span>
            <span class="total-value">{{ totalCalculado() | currency:'EUR':'symbol':'1.2-2' }}</span>
          </div>

          <div class="form-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
              <mat-icon>check_circle</mat-icon> Confirmar Alquiler
            </button>
          </div>
        </form>
      </div>

      <!-- Modal / Panel de Modificación de Fecha de Devolución -->
      <div class="card-elevated edit-modal" *ngIf="alquilerEditando()">
        <h3>
          <mat-icon>edit_calendar</mat-icon> 
          Modificar Fecha de Devolución — Alquiler #{{ alquilerEditando()?.id }} ({{ alquilerEditando()?.socioNombre }})
        </h3>
        <p class="edit-hint">
          Fecha de Recogida (No editable): <strong>{{ alquilerEditando()?.fechaRecogida }}</strong> | 
          Fecha actual de referencia: <strong>{{ dateService.currentDate() }}</strong>
        </p>

        <div class="edit-inputs">
          <mat-form-field appearance="outline">
            <mat-label>Nueva Fecha de Devolución</mat-label>
            <input matInput type="date" [(ngModel)]="nuevaFechaDevolucion">
          </mat-form-field>

          <button mat-flat-button color="primary" (click)="guardarModificacionFecha()" [disabled]="!nuevaFechaDevolucion">
            <mat-icon>save</mat-icon> Actualizar Devolución
          </button>
          <button mat-stroked-button (click)="alquilerEditando.set(null)">
            Cancelar
          </button>
        </div>
      </div>

      <!-- Listado de Alquileres -->
      <div class="card-elevated">
        <table mat-table [dataSource]="alquileres()" class="mat-elevation-z0">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>Código</th>
            <td mat-cell *matCellDef="let a"><strong>#{{ a.id }}</strong></td>
          </ng-container>

          <ng-container matColumnDef="socio">
            <th mat-header-cell *matHeaderCellDef>Socio</th>
            <td mat-cell *matCellDef="let a">
              <span class="text-primary">{{ a.socioNombre }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="videoclub">
            <th mat-header-cell *matHeaderCellDef>Sede</th>
            <td mat-cell *matCellDef="let a">
              <span class="badge badge-primary">{{ a.videoclubCiudad }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="peliculas">
            <th mat-header-cell *matHeaderCellDef>Películas Alquiladas</th>
            <td mat-cell *matCellDef="let a">
              <div class="movies-chip-list">
                <span class="badge badge-accent" *ngFor="let p of a.peliculas">
                  {{ p.nombre }} ({{ p.precioAlquiler }}€)
                </span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="fechaRecogida">
            <th mat-header-cell *matHeaderCellDef>Recogida</th>
            <td mat-cell *matCellDef="let a">{{ a.fechaRecogida }}</td>
          </ng-container>

          <ng-container matColumnDef="fechaDevolucion">
            <th mat-header-cell *matHeaderCellDef>Devolución</th>
            <td mat-cell *matCellDef="let a">
              <strong>{{ a.fechaDevolucion }}</strong>
            </td>
          </ng-container>

          <ng-container matColumnDef="totalPagar">
            <th mat-header-cell *matHeaderCellDef>Total</th>
            <td mat-cell *matCellDef="let a">
              <span class="text-success">{{ a.totalPagar | currency:'EUR':'symbol':'1.2-2' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let a">
              <button mat-stroked-button color="accent" (click)="iniciarEdicionFecha(a)">
                <mat-icon>edit_calendar</mat-icon> Modificar Devolución
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="alquileres().length === 0" class="empty-state">
          <mat-icon>remove_shopping_cart</mat-icon>
          <p>No hay alquileres registrados en el sistema.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .info-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #fff3e0;
      border-left: 5px solid #ff9800;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      align-items: center;
      margin-top: 16px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .total-box {
      grid-column: 1 / -1;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #e8f5e9;
      border-radius: 8px;

      .total-label {
        font-weight: 500;
        font-size: 1.1rem;
        color: #2e7d32;
      }

      .total-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1b5e20;
      }
    }

    .form-actions {
      grid-column: 1 / -1;
      display: flex;
      justify-content: flex-end;
    }

    .edit-modal {
      background: #e3f2fd;
      border: 1px solid #90caf9;

      h3 {
        margin-top: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #0d47a1;
      }

      .edit-hint {
        color: #37474f;
        margin-bottom: 16px;
      }

      .edit-inputs {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
      }
    }

    .movies-chip-list {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
  `]
})
export class AlquileresComponent implements OnInit {
  private readonly alquilerService = inject(AlquilerService);
  private readonly socioService = inject(SocioService);
  private readonly videoclubService = inject(VideoclubService);
  private readonly peliculaService = inject(PeliculaService);
  readonly dateService = inject(UserDateContextService);
  private readonly fb = inject(FormBuilder);
  private readonly notify = inject(NotificationService);

  readonly alquileres = signal<Alquiler[]>([]);
  readonly socios = signal<Socio[]>([]);
  readonly videoclubs = signal<Videoclub[]>([]);
  readonly peliculasDisponibles = signal<Pelicula[]>([]);
  readonly showForm = signal<boolean>(false);
  readonly loading = signal<boolean>(false);

  readonly alquilerEditando = signal<Alquiler | null>(null);
  nuevaFechaDevolucion = '';

  readonly displayedColumns: string[] = [
    'id', 'socio', 'videoclub', 'peliculas', 'fechaRecogida', 'fechaDevolucion', 'totalPagar', 'acciones'
  ];

  form = this.fb.group({
    socioId: [null as number | null, Validators.required],
    videoclubId: [null as number | null, Validators.required],
    peliculaIds: [[] as number[], [Validators.required, Validators.minLength(1)]],
    fechaRecogida: [this.dateService.getDate(), Validators.required],
    fechaDevolucion: ['', Validators.required]
  });

  // Cálculo derivado en tiempo real de la suma de precios de películas seleccionadas
  readonly totalCalculado = computed(() => {
    const selectedIds = this.form.get('peliculaIds')?.value || [];
    const available = this.peliculasDisponibles();
    return selectedIds.reduce((sum, id) => {
      const p = available.find(item => item.id === id);
      return sum + (p ? Number(p.precioAlquiler) : 0);
    }, 0);
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.alquilerService.listar().subscribe({
      next: (data) => this.alquileres.set(data),
      error: () => this.notify.error('Error al cargar alquileres')
    });

    this.socioService.listar().subscribe({
      next: (data) => this.socios.set(data)
    });

    this.videoclubService.listar().subscribe({
      next: (data) => this.videoclubs.set(data)
    });
  }

  onVideoclubChange(videoclubId: number): void {
    this.form.patchValue({ peliculaIds: [] });
    if (!videoclubId) {
      this.peliculasDisponibles.set([]);
      return;
    }
    this.peliculaService.listar(videoclubId).subscribe({
      next: (data) => this.peliculasDisponibles.set(data),
      error: () => this.notify.error('Error al cargar películas de la sede')
    });
  }

  onPeliculasSelected(selected: number[]): void {
    // Forzamos actualización para re-evaluar totalCalculado
    this.form.get('peliculaIds')?.setValue(selected);
  }

  toggleNuevo(): void {
    const nextState = !this.showForm();
    this.showForm.set(nextState);
    if (nextState) {
      this.form.patchValue({
        fechaRecogida: this.dateService.getDate()
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) return;

    const val = this.form.value;
    if (val.fechaDevolucion! <= val.fechaRecogida!) {
      this.notify.error('La fecha de devolución debe ser posterior a la fecha de recogida.');
      return;
    }

    this.loading.set(true);
    this.alquilerService.crear(val as any).subscribe({
      next: () => {
        this.notify.success('Alquiler registrado con éxito');
        this.form.reset({
          socioId: null,
          videoclubId: null,
          peliculaIds: [],
          fechaRecogida: this.dateService.getDate(),
          fechaDevolucion: ''
        });
        this.peliculasDisponibles.set([]);
        this.showForm.set(false);
        this.cargarDatos();
      },
      error: (err) => {
        this.notify.error('Error al registrar alquiler: ' + (err.error?.message || err.message));
        this.loading.set(false);
      }
    });
  }

  iniciarEdicionFecha(alquiler: Alquiler): void {
    this.alquilerEditando.set(alquiler);
    this.nuevaFechaDevolucion = alquiler.fechaDevolucion;
  }

  guardarModificacionFecha(): void {
    const alquiler = this.alquilerEditando();
    if (!alquiler || !this.nuevaFechaDevolucion) return;

    const fechaRef = this.dateService.getDate();
    if (this.nuevaFechaDevolucion <= fechaRef) {
      this.notify.error(`La nueva fecha de devolución debe ser estrictamente posterior a la fecha actual (${fechaRef}).`);
      return;
    }

    this.alquilerService.modificarFechaDevolucion(alquiler.id, {
      nuevaFechaDevolucion: this.nuevaFechaDevolucion,
      fechaReferenciaUsuario: fechaRef
    }).subscribe({
      next: () => {
        this.notify.success('Fecha de devolución actualizada correctamente');
        this.alquilerEditando.set(null);
        this.cargarDatos();
      },
      error: (err) => {
        this.notify.error('Error al modificar fecha: ' + (err.error?.message || err.message));
      }
    });
  }
}

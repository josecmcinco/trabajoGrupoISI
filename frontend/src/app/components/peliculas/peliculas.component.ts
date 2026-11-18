import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PeliculaService } from '../../services/pelicula.service';
import { VideoclubService } from '../../services/videoclub.service';
import { NotificationService } from '../../services/notification.service';
import { Pelicula } from '../../models/pelicula.model';
import { Videoclub } from '../../models/videoclub.model';

@Component({
  selector: 'app-peliculas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="container">
      <div class="page-header">
        <h1><mat-icon>movie</mat-icon> Catálogo de Películas</h1>
        <button mat-flat-button color="primary" (click)="toggleNuevo()">
          <mat-icon>{{ showForm() ? 'close' : 'add' }}</mat-icon>
          {{ showForm() ? 'Cancelar' : 'Nueva Película' }}
        </button>
      </div>

      <!-- Filtro por Videoclub -->
      <div class="card-elevated filter-card">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Filtrar por Videoclub (Sede)</mat-label>
          <mat-select [ngModel]="filtroVideoclubId()" (ngModelChange)="onFiltroChange($event)">
            <mat-option [value]="null">Todas las sedes</mat-option>
            <mat-option *ngFor="let v of videoclubs()" [value]="v.id">
              {{ v.ciudad }} (Gerente: {{ v.nombreGerente }})
            </mat-option>
          </mat-select>
        </mat-form-field>

        <span class="info-note">
          <mat-icon>info</mat-icon> 
          <em>Regla de Negocio:</em> Películas homónimas en distintos videoclubs son objetos independientes con diferente ID.
        </span>
      </div>

      <!-- Formulario de Alta de Película -->
      <div class="card-elevated" *ngIf="showForm()">
        <h2><mat-icon>video_call</mat-icon> Añadir Película a Videoclub</h2>
        <form [formGroup]="form" (ngSubmit)="guardar()" class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Título de la Película</mat-label>
            <input matInput formControlName="nombre" placeholder="Ej: Matrix" required>
            <mat-error *ngIf="form.get('nombre')?.invalid">Campo obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Director (Opcional)</mat-label>
            <input matInput formControlName="director" placeholder="Ej: Christopher Nolan">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fecha de Estreno (Manual)</mat-label>
            <input matInput type="date" formControlName="fechaEstreno" required>
            <mat-error *ngIf="form.get('fechaEstreno')?.invalid">Fecha obligatoria</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Precio de Alquiler (€)</mat-label>
            <input matInput type="number" step="0.01" min="0.1" formControlName="precioAlquiler" required>
            <mat-error *ngIf="form.get('precioAlquiler')?.invalid">Precio mayor a 0</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Videoclub Asignado</mat-label>
            <mat-select formControlName="videoclubId" required>
              <mat-option *ngFor="let v of videoclubs()" [value]="v.id">
                {{ v.ciudad }} (ID: {{ v.id }})
              </mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('videoclubId')?.invalid">Debe asignar una sede</mat-error>
          </mat-form-field>

          <div class="form-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
              <mat-icon>save</mat-icon> Guardar Película
            </button>
          </div>
        </form>
      </div>

      <!-- Tabla de Películas -->
      <div class="card-elevated">
        <table mat-table [dataSource]="peliculas()" class="mat-elevation-z0">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>Código</th>
            <td mat-cell *matCellDef="let p"><strong>#{{ p.id }}</strong></td>
          </ng-container>

          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef>Título</th>
            <td mat-cell *matCellDef="let p">
              <span class="text-primary">{{ p.nombre }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="director">
            <th mat-header-cell *matHeaderCellDef>Director</th>
            <td mat-cell *matCellDef="let p">{{ p.director || '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="fechaEstreno">
            <th mat-header-cell *matHeaderCellDef>Estreno</th>
            <td mat-cell *matCellDef="let p">{{ p.fechaEstreno }}</td>
          </ng-container>

          <ng-container matColumnDef="precioAlquiler">
            <th mat-header-cell *matHeaderCellDef>Precio</th>
            <td mat-cell *matCellDef="let p">
              <span class="text-success">{{ p.precioAlquiler | currency:'EUR':'symbol':'1.2-2' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="videoclub">
            <th mat-header-cell *matHeaderCellDef>Sede / Videoclub</th>
            <td mat-cell *matCellDef="let p">
              <span class="badge badge-accent">{{ p.videoclubCiudad }} (#{{ p.videoclubId }})</span>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="peliculas().length === 0" class="empty-state">
          <mat-icon>movie_filter</mat-icon>
          <p>No se encontraron películas para los criterios seleccionados.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filter-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      padding: 16px 24px;
    }

    .filter-field {
      min-width: 280px;
    }

    .info-note {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: #555;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      align-items: center;
      margin-top: 16px;
    }

    .form-actions {
      grid-column: 1 / -1;
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class PeliculasComponent implements OnInit {
  private readonly peliculaService = inject(PeliculaService);
  private readonly videoclubService = inject(VideoclubService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly notify = inject(NotificationService);

  readonly peliculas = signal<Pelicula[]>([]);
  readonly videoclubs = signal<Videoclub[]>([]);
  readonly filtroVideoclubId = signal<number | null>(null);
  readonly showForm = signal<boolean>(false);
  readonly loading = signal<boolean>(false);

  readonly displayedColumns: string[] = ['id', 'nombre', 'director', 'fechaEstreno', 'precioAlquiler', 'videoclub'];

  form = this.fb.group({
    nombre: ['', Validators.required],
    director: [''],
    fechaEstreno: ['2024-01-01', Validators.required],
    precioAlquiler: [3.50, [Validators.required, Validators.min(0.01)]],
    videoclubId: [null as number | null, Validators.required]
  });

  ngOnInit(): void {
    this.cargarVideoclubs();
    this.route.queryParams.subscribe(params => {
      if (params['videoclubId']) {
        const id = Number(params['videoclubId']);
        this.filtroVideoclubId.set(id);
        this.form.patchValue({ videoclubId: id });
      }
      this.cargarPeliculas();
    });
  }

  cargarVideoclubs(): void {
    this.videoclubService.listar().subscribe({
      next: (data) => this.videoclubs.set(data),
      error: (err) => this.notify.error('Error al cargar videoclubs')
    });
  }

  cargarPeliculas(): void {
    this.loading.set(true);
    const vId = this.filtroVideoclubId() ?? undefined;
    this.peliculaService.listar(vId).subscribe({
      next: (data) => {
        this.peliculas.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.notify.error('Error al cargar películas');
        this.loading.set(false);
      }
    });
  }

  onFiltroChange(videoclubId: number | null): void {
    this.filtroVideoclubId.set(videoclubId);
    this.cargarPeliculas();
  }

  toggleNuevo(): void {
    this.showForm.set(!this.showForm());
  }

  guardar(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.peliculaService.crear(this.form.value as any).subscribe({
      next: () => {
        this.notify.success('Película agregada al catálogo');
        this.form.reset({
          nombre: '',
          director: '',
          fechaEstreno: '2024-01-01',
          precioAlquiler: 3.50,
          videoclubId: this.filtroVideoclubId()
        });
        this.showForm.set(false);
        this.cargarPeliculas();
      },
      error: (err) => {
        this.notify.error('Error al guardar: ' + (err.error?.message || err.message));
        this.loading.set(false);
      }
    });
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SocioService } from '../../services/socio.service';
import { VideoclubService } from '../../services/videoclub.service';
import { NotificationService } from '../../services/notification.service';
import { Socio } from '../../models/socio.model';
import { Videoclub } from '../../models/videoclub.model';

@Component({
  selector: 'app-socios',
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
        <h1><mat-icon>people</mat-icon> Gestión de Socios</h1>
        <button mat-flat-button color="primary" (click)="toggleNuevo()">
          <mat-icon>{{ showForm() ? 'close' : 'person_add' }}</mat-icon>
          {{ showForm() ? 'Cancelar' : 'Nuevo Socio' }}
        </button>
      </div>

      <div class="card-elevated info-banner">
        <mat-icon color="primary">verified_user</mat-icon>
        <div>
          <strong>Alcance de la Membresía APPV:</strong>
          El socio se registra en un videoclub de origen, pero cuenta con derecho a alquilar películas en 
          <strong>cualquiera de las sedes</strong> de la cadena.
        </div>
      </div>

      <!-- Formulario de Alta de Socio -->
      <div class="card-elevated" *ngIf="showForm()">
        <h2><mat-icon>person_add_alt</mat-icon> Registrar Nuevo Socio</h2>
        <form [formGroup]="form" (ngSubmit)="guardar()" class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Nombre Completo</mat-label>
            <input matInput formControlName="nombre" placeholder="Ej: Laura Gómez" required>
            <mat-error *ngIf="form.get('nombre')?.invalid">Campo obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Edad</mat-label>
            <input matInput type="number" min="0" max="120" formControlName="edad" required>
            <mat-error *ngIf="form.get('edad')?.invalid">Edad válida requerida</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Videoclub de Registro (Origen)</mat-label>
            <mat-select formControlName="videoclubOrigenId" required>
              <mat-option *ngFor="let v of videoclubs()" [value]="v.id">
                {{ v.ciudad }} (Gerente: {{ v.nombreGerente }})
              </mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('videoclubOrigenId')?.invalid">Debe indicar sede de registro</mat-error>
          </mat-form-field>

          <div class="form-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
              <mat-icon>save</mat-icon> Guardar Socio
            </button>
          </div>
        </form>
      </div>

      <!-- Tabla de Socios -->
      <div class="card-elevated">
        <table mat-table [dataSource]="socios()" class="mat-elevation-z0">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>Código Socio</th>
            <td mat-cell *matCellDef="let s"><strong>#{{ s.id }}</strong></td>
          </ng-container>

          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef>Nombre</th>
            <td mat-cell *matCellDef="let s">
              <span class="text-primary">{{ s.nombre }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="edad">
            <th mat-header-cell *matHeaderCellDef>Edad</th>
            <td mat-cell *matCellDef="let s">{{ s.edad }} años</td>
          </ng-container>

          <ng-container matColumnDef="origen">
            <th mat-header-cell *matHeaderCellDef>Sede de Registro</th>
            <td mat-cell *matCellDef="let s">
              <span class="badge badge-primary">{{ s.videoclubOrigenCiudad }} (#{{ s.videoclubOrigenId }})</span>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="socios().length === 0" class="empty-state">
          <mat-icon>group_off</mat-icon>
          <p>No hay socios registrados todavía.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .info-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #e8eaf6;
      border-left: 5px solid #1a237e;
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
export class SociosComponent implements OnInit {
  private readonly socioService = inject(SocioService);
  private readonly videoclubService = inject(VideoclubService);
  private readonly fb = inject(FormBuilder);
  private readonly notify = inject(NotificationService);

  readonly socios = signal<Socio[]>([]);
  readonly videoclubs = signal<Videoclub[]>([]);
  readonly showForm = signal<boolean>(false);
  readonly loading = signal<boolean>(false);

  readonly displayedColumns: string[] = ['id', 'nombre', 'edad', 'origen'];

  form = this.fb.group({
    nombre: ['', Validators.required],
    edad: [25, [Validators.required, Validators.min(0)]],
    videoclubOrigenId: [null as number | null, Validators.required]
  });

  ngOnInit(): void {
    this.cargarVideoclubs();
    this.cargarSocios();
  }

  cargarVideoclubs(): void {
    this.videoclubService.listar().subscribe({
      next: (data) => this.videoclubs.set(data),
      error: () => this.notify.error('Error al cargar videoclubs')
    });
  }

  cargarSocios(): void {
    this.loading.set(true);
    this.socioService.listar().subscribe({
      next: (data) => {
        this.socios.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.notify.error('Error al cargar socios: ' + (err.error?.message || err.message));
        this.loading.set(false);
      }
    });
  }

  toggleNuevo(): void {
    this.showForm.set(!this.showForm());
  }

  guardar(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.socioService.crear(this.form.value as any).subscribe({
      next: () => {
        this.notify.success('Socio registrado con éxito');
        this.form.reset({ nombre: '', edad: 25, videoclubOrigenId: null });
        this.showForm.set(false);
        this.cargarSocios();
      },
      error: (err) => {
        this.notify.error('Error al guardar socio: ' + (err.error?.message || err.message));
        this.loading.set(false);
      }
    });
  }
}

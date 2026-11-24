import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { VideoclubService } from '../../services/videoclub.service';
import { NotificationService } from '../../services/notification.service';
import { Videoclub } from '../../models/videoclub.model';

@Component({
  selector: 'app-videoclubs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="container">
      <div class="page-header">
        <h1><mat-icon>store</mat-icon> Gestión de Videoclubs (Sedes APPV)</h1>
        <button mat-flat-button color="primary" (click)="toggleNuevo()">
          <mat-icon>{{ showForm() ? 'close' : 'add' }}</mat-icon>
          {{ showForm() ? 'Cancelar' : 'Nueva Sede' }}
        </button>
      </div>

      <!-- Formulario de Alta de Videoclub -->
      <div class="card-elevated" *ngIf="showForm()">
        <h2><mat-icon>add_business</mat-icon> Registrar Nuevo Videoclub</h2>
        <form [formGroup]="form" (ngSubmit)="guardar()" class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Nombre del Gerente</mat-label>
            <input matInput formControlName="nombreGerente" placeholder="Ej: Marta Gómez" required>
            <mat-error *ngIf="form.get('nombreGerente')?.invalid">Campo obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Ciudad</mat-label>
            <input matInput formControlName="ciudad" placeholder="Ej: Valencia" required>
            <mat-error *ngIf="form.get('ciudad')?.invalid">Campo obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Calle</mat-label>
            <input matInput formControlName="calle" placeholder="Ej: Gran Vía 12" required>
            <mat-error *ngIf="form.get('calle')?.invalid">Campo obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Código Postal (5 caracteres)</mat-label>
            <input matInput formControlName="codigoPostal" maxlength="5" placeholder="Ej: 46001" required>
            <mat-error *ngIf="form.get('codigoPostal')?.invalid">Debe contener 5 caracteres</mat-error>
          </mat-form-field>

          <div class="form-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
              <mat-icon>save</mat-icon> Guardar Videoclub
            </button>
          </div>
        </form>
      </div>

      <!-- Listado de Videoclubs -->
      <div class="card-elevated">
        <table mat-table [dataSource]="videoclubs()" class="mat-elevation-z0">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>Código</th>
            <td mat-cell *matCellDef="let v"><strong>#{{ v.id }}</strong></td>
          </ng-container>

          <ng-container matColumnDef="nombreGerente">
            <th mat-header-cell *matHeaderCellDef>Gerente</th>
            <td mat-cell *matCellDef="let v">{{ v.nombreGerente }}</td>
          </ng-container>

          <ng-container matColumnDef="ciudad">
            <th mat-header-cell *matHeaderCellDef>Ciudad</th>
            <td mat-cell *matCellDef="let v">
              <span class="badge badge-primary">{{ v.ciudad }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="calle">
            <th mat-header-cell *matHeaderCellDef>Calle</th>
            <td mat-cell *matCellDef="let v">{{ v.calle }}</td>
          </ng-container>

          <ng-container matColumnDef="codigoPostal">
            <th mat-header-cell *matHeaderCellDef>C.P.</th>
            <td mat-cell *matCellDef="let v">{{ v.codigoPostal }}</td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let v">
              <a mat-button color="accent" [routerLink]="['/peliculas']" [queryParams]="{ videoclubId: v.id }">
                <mat-icon>movie</mat-icon> Ver Películas
              </a>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="videoclubs().length === 0" class="empty-state">
          <mat-icon>store</mat-icon>
          <p>No hay videoclubs registrados todavía.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
export class VideoclubsComponent implements OnInit {
  private readonly videoclubService = inject(VideoclubService);
  private readonly fb = inject(FormBuilder);
  private readonly notify = inject(NotificationService);

  readonly videoclubs = signal<Videoclub[]>([]);
  readonly showForm = signal<boolean>(false);
  readonly loading = signal<boolean>(false);

  readonly displayedColumns: string[] = ['id', 'nombreGerente', 'ciudad', 'calle', 'codigoPostal', 'acciones'];

  form = this.fb.group({
    nombreGerente: ['', Validators.required],
    ciudad: ['', Validators.required],
    calle: ['', Validators.required],
    codigoPostal: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]]
  });

  ngOnInit(): void {
    this.cargarVideoclubs();
  }

  cargarVideoclubs(): void {
    this.loading.set(true);
    this.videoclubService.listar().subscribe({
      next: (data) => {
        this.videoclubs.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.notify.error('Error al cargar sedes: ' + (err.error?.message || err.message));
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
    this.videoclubService.crear(this.form.value as any).subscribe({
      next: () => {
        this.notify.success('Videoclub registrado correctamente');
        this.form.reset();
        this.showForm.set(false);
        this.cargarVideoclubs();
      },
      error: (err) => {
        this.notify.error('Error al guardar: ' + (err.error?.message || err.message));
        this.loading.set(false);
      }
    });
  }
}

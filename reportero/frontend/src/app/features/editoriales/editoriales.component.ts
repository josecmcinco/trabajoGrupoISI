import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Editorial } from '../../core/models/siger.models';
import { EditorialesService } from '../../core/services/editoriales.service';
import { extractErrorMessage } from '../../core/utils/error.utils';

@Component({
  selector: 'app-editoriales',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="section-header">
        <h1>Gestión de Editoriales</h1>
        <button mat-stroked-button color="primary" (click)="cargarEditoriales()">
          <mat-icon>refresh</mat-icon>
          Actualizar
        </button>
      </div>

      @if (cargando()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      <mat-card>
        <mat-card-header>
          <mat-card-title>
            {{ editorialEditando() ? 'Editar Editorial #' + editorialEditando()!.id : 'Nueva Editorial' }}
          </mat-card-title>
          <mat-card-subtitle>
            El CIF debe ser único. No se pueden eliminar editoriales que tengan albaranes asociados.
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="guardarEditorial()" class="editorial-form">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Nombre *</mat-label>
                <input matInput formControlName="nombre" placeholder="Ej. Ediciones Prensa Ibérica" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>CIF *</mat-label>
                <input matInput formControlName="cif" placeholder="Ej. B12345678" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="span-2">
                <mat-label>Dirección *</mat-label>
                <input matInput formControlName="direccion" placeholder="Calle, número, ciudad..." />
              </mat-form-field>
            </div>

            <div class="actions-row">
              @if (editorialEditando()) {
                <button mat-stroked-button type="button" (click)="cancelarEdicion()">
                  Cancelar
                </button>
              }
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || guardando()">
                <mat-icon>{{ editorialEditando() ? 'save' : 'add_business' }}</mat-icon>
                {{ editorialEditando() ? 'Guardar Cambios' : 'Registrar Editorial' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Listado de Editoriales ({{ editoriales().length }})</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table class="siger-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>CIF</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (ed of editoriales(); track ed.id) {
                <tr>
                  <td>#{{ ed.id }}</td>
                  <td><strong>{{ ed.nombre }}</strong></td>
                  <td>{{ ed.cif }}</td>
                  <td>{{ ed.direccion }}</td>
                  <td>
                    <div class="row-actions">
                      <button mat-stroked-button color="primary" (click)="seleccionarParaEditar(ed)">
                        <mat-icon>edit</mat-icon>
                        Editar
                      </button>
                      <button mat-stroked-button color="warn" (click)="eliminarEditorial(ed)">
                        <mat-icon>delete</mat-icon>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          @if (editoriales().length === 0) {
            <div class="empty-state">No hay editoriales registradas todavía.</div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .editorial-form {
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
      gap: 8px;
    }
    .row-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  `]
})
export class EditorialesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly editorialesService = inject(EditorialesService);
  private readonly snackBar = inject(MatSnackBar);

  readonly editoriales = signal<Editorial[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly editorialEditando = signal<Editorial | null>(null);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    cif: ['', [Validators.required, Validators.maxLength(20)]],
    direccion: ['', [Validators.required, Validators.maxLength(250)]]
  });

  ngOnInit(): void {
    this.cargarEditoriales();
  }

  cargarEditoriales(): void {
    this.cargando.set(true);
    this.editorialesService.listarEditoriales().subscribe({
      next: (data) => {
        this.editoriales.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mostrarError(extractErrorMessage(err));
      }
    });
  }

  seleccionarParaEditar(editorial: Editorial): void {
    this.editorialEditando.set(editorial);
    this.form.patchValue({
      nombre: editorial.nombre,
      cif: editorial.cif,
      direccion: editorial.direccion
    });
  }

  cancelarEdicion(): void {
    this.editorialEditando.set(null);
    this.form.reset();
  }

  guardarEditorial(): void {
    if (this.form.invalid) {
      return;
    }
    const payload = this.form.getRawValue();
    const editando = this.editorialEditando();
    this.guardando.set(true);

    const peticion$ = editando
      ? this.editorialesService.actualizarEditorial(editando.id, payload)
      : this.editorialesService.crearEditorial(payload);

    peticion$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.snackBar.open(
          editando ? 'Editorial actualizada correctamente' : 'Editorial registrada correctamente',
          'Cerrar',
          { duration: 3500 }
        );
        this.cancelarEdicion();
        this.cargarEditoriales();
      },
      error: (err) => {
        this.guardando.set(false);
        this.mostrarError(extractErrorMessage(err));
      }
    });
  }

  eliminarEditorial(editorial: Editorial): void {
    this.editorialesService.eliminarEditorial(editorial.id).subscribe({
      next: () => {
        this.snackBar.open(`Editorial "${editorial.nombre}" eliminada`, 'Cerrar', { duration: 3500 });
        if (this.editorialEditando()?.id === editorial.id) {
          this.cancelarEdicion();
        }
        this.cargarEditoriales();
      },
      error: (err) => this.mostrarError(extractErrorMessage(err))
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
  }
}

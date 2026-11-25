import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Albaran, Editorial, Reportaje } from '../../core/models/siger.models';
import { AlbaranesService } from '../../core/services/albaranes.service';
import { EditorialesService } from '../../core/services/editoriales.service';
import { ReportajesService } from '../../core/services/reportajes.service';
import { extractErrorMessage } from '../../core/utils/error.utils';

@Component({
  selector: 'app-albaranes',
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
        <h1>Albaranes de Compra</h1>
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
          <mat-card-title>Adquirir Reportaje (Generar Albarán)</mat-card-title>
          <mat-card-subtitle>
            Un reportaje puede venderse a varias editoriales. El pago al reportero se calcula automáticamente en el servidor.
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="crearAlbaran()" class="albaran-form">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Reportaje *</mat-label>
                <mat-select formControlName="reportajeId" (selectionChange)="reportajeSeleccionadoId.set($event.value)">
                  @for (rep of reportajes(); track rep.id) {
                    <mat-option [value]="rep.id">
                      #{{ rep.id }} — {{ rep.reportero.nombre }} {{ rep.reportero.apellidos }}
                      ({{ rep.numeroFotos }} fotos) · {{ rep.descripcion }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Editorial *</mat-label>
                <mat-select formControlName="editorialId">
                  @for (ed of editoriales(); track ed.id) {
                    <mat-option [value]="ed.id">
                      {{ ed.nombre }} ({{ ed.cif }})
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Precio cobrado a editorial (€) *</mat-label>
                <input
                  matInput
                  type="number"
                  min="0"
                  step="0.50"
                  formControlName="precioEditorial"
                  (input)="actualizarPrecioLocal($event)" />
              </mat-form-field>
            </div>

            @if (reportajeSeleccionado(); as rep) {
              <div class="preview-box" [class.preview-invalid]="margenNegativo()">
                <div>
                  <strong>Pago orientativo al reportero:</strong>
                  {{ pagoReporteroOrientativo() | currency: 'EUR' }}
                  <span class="subtext">
                    ({{ rep.numeroFotos }} fotos × {{ rep.reportero.categoria?.precioPorFoto | currency: 'EUR' }}/foto ·
                    Nivel {{ rep.reportero.categoria?.nivel }})
                  </span>
                </div>
                @if (precioEditorialValor() !== null) {
                  <div>
                    <strong>Margen de la agencia:</strong>
                    {{ (precioEditorialValor()! - pagoReporteroOrientativo()) | currency: 'EUR' }}
                  </div>
                }
                @if (margenNegativo()) {
                  <div class="error-text">
                    El precio cobrado a la editorial no puede ser inferior al importe que percibe el reportero.
                  </div>
                }
              </div>
            }

            <div class="actions-row">
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="form.invalid || margenNegativo() || guardando()">
                <mat-icon>receipt_long</mat-icon>
                Emitir Albarán
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Histórico de Albaranes ({{ albaranes().length }})</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table class="siger-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Editorial</th>
                <th>Reportaje</th>
                <th>Pago Editorial</th>
                <th>Pago Reportero</th>
                <th>Margen Agencia</th>
              </tr>
            </thead>
            <tbody>
              @for (alb of albaranes(); track alb.id) {
                <tr>
                  <td>#{{ alb.id }}</td>
                  <td>{{ alb.fechaCreacion | date: 'dd/MM/yyyy HH:mm' }}</td>
                  <td>
                    <strong>{{ alb.editorial.nombre }}</strong>
                    <div class="subtext">CIF: {{ alb.editorial.cif }}</div>
                  </td>
                  <td>
                    <strong>Reportaje #{{ alb.reportaje.id }}</strong> ({{ alb.reportaje.numeroFotos }} fotos)
                    <div class="subtext">
                      {{ alb.reportaje.reportero.nombre }} {{ alb.reportaje.reportero.apellidos }} ·
                      {{ alb.reportaje.descripcion }}
                    </div>
                  </td>
                  <td>{{ alb.precioEditorial | currency: 'EUR' }}</td>
                  <td>{{ alb.precioReportero | currency: 'EUR' }}</td>
                  <td><strong>{{ alb.beneficioAgencia | currency: 'EUR' }}</strong></td>
                </tr>
              }
            </tbody>
          </table>

          @if (albaranes().length === 0) {
            <div class="empty-state">No hay albaranes de compra emitidos todavía.</div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .albaran-form {
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
    .preview-box {
      padding: 12px 16px;
      border-radius: 8px;
      background-color: #eef2ff;
      border: 1px solid #c7d2fe;
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 0.9rem;
    }
    .preview-invalid {
      background-color: #fee2e2;
      border-color: #fca5a5;
    }
    .error-text {
      color: #991b1b;
      font-weight: 500;
    }
    .actions-row {
      display: flex;
      justify-content: flex-end;
    }
    .subtext {
      font-size: 0.8rem;
      color: #64748b;
    }
  `]
})
export class AlbaranesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly albaranesService = inject(AlbaranesService);
  private readonly reportajesService = inject(ReportajesService);
  private readonly editorialesService = inject(EditorialesService);
  private readonly snackBar = inject(MatSnackBar);

  readonly albaranes = signal<Albaran[]>([]);
  readonly reportajes = signal<Reportaje[]>([]);
  readonly editoriales = signal<Editorial[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);

  readonly reportajeSeleccionadoId = signal<number | null>(null);
  readonly precioEditorialValor = signal<number | null>(null);

  readonly reportajeSeleccionado = computed(() => {
    const id = this.reportajeSeleccionadoId();
    return this.reportajes().find((r) => r.id === id) ?? null;
  });

  readonly pagoReporteroOrientativo = computed(() => {
    const rep = this.reportajeSeleccionado();
    const precioFoto = rep?.reportero.categoria?.precioPorFoto ?? 0;
    return rep ? Number((rep.numeroFotos * precioFoto).toFixed(2)) : 0;
  });

  readonly margenNegativo = computed(() => {
    const rep = this.reportajeSeleccionado();
    const precioEd = this.precioEditorialValor();
    if (!rep || precioEd === null || Number.isNaN(precioEd)) {
      return false;
    }
    return precioEd < this.pagoReporteroOrientativo();
  });

  readonly form = this.fb.group({
    reportajeId: [null as number | null, Validators.required],
    editorialId: [null as number | null, Validators.required],
    precioEditorial: [null as number | null, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.reportajesService.listarReportajes().subscribe({
      next: (data) => this.reportajes.set(data),
      error: (err) => this.mostrarError(extractErrorMessage(err))
    });

    this.editorialesService.listarEditoriales().subscribe({
      next: (data) => this.editoriales.set(data),
      error: (err) => this.mostrarError(extractErrorMessage(err))
    });

    this.albaranesService.listarAlbaranes().subscribe({
      next: (data) => {
        this.albaranes.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mostrarError(extractErrorMessage(err));
      }
    });
  }

  actualizarPrecioLocal(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value === '') {
      this.precioEditorialValor.set(null);
      return;
    }
    const val = Number(input.value);
    this.precioEditorialValor.set(Number.isNaN(val) ? null : val);
  }

  crearAlbaran(): void {
    if (this.form.invalid || this.margenNegativo()) {
      return;
    }
    const raw = this.form.getRawValue();
    if (!raw.reportajeId || !raw.editorialId || raw.precioEditorial === null) {
      return;
    }
    this.guardando.set(true);
    this.albaranesService
      .crearAlbaran({
        reportajeId: raw.reportajeId,
        editorialId: raw.editorialId,
        precioEditorial: Number(raw.precioEditorial)
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.snackBar.open('Albarán generado correctamente', 'Cerrar', { duration: 3500 });
          this.form.reset();
          this.reportajeSeleccionadoId.set(null);
          this.precioEditorialValor.set(null);
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

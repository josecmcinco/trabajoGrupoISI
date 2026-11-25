import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Categoria, Reportero } from '../../core/models/siger.models';
import { CategoriasService } from '../../core/services/categorias.service';
import { ReporterosService } from '../../core/services/reporteros.service';
import { extractErrorMessage } from '../../core/utils/error.utils';

@Component({
  selector: 'app-reporteros',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule
  ],
  template: `
    <div class="page-container">
      <div class="section-header">
        <h1>Bolsa de Reporteros y Promoción</h1>
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
          <mat-card-title>Reporteros en Bolsa</mat-card-title>
          <mat-card-subtitle>
            Solo se permite ascender a categorías superiores; nunca se puede bajar la categoría de un reportero.
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <table class="siger-table">
            <thead>
              <tr>
                <th>DNI</th>
                <th>Reportero</th>
                <th>Categoría Actual</th>
                <th>Promocionar</th>
              </tr>
            </thead>
            <tbody>
              @for (r of reporteros(); track r.id) {
                <tr>
                  <td>{{ r.dni }}</td>
                  <td>
                    <strong>{{ r.nombre }} {{ r.apellidos }}</strong>
                    <div class="subtext">{{ r.ciudad }} · Tel: {{ r.telefono }}</div>
                  </td>
                  <td>
                    @if (r.categoria) {
                      Nivel {{ r.categoria.nivel }} — {{ r.categoria.nombre }}
                      ({{ r.categoria.precioPorHoja | currency: 'EUR' }}/hoja · {{ r.categoria.precioPorFoto | currency: 'EUR' }}/foto)
                    }
                  </td>
                  <td>
                    @if (categoriasSuperiores(r).length === 0) {
                      <span class="subtext">Categoría máxima alcanzada</span>
                    } @else {
                      <div class="promote-row">
                        <mat-form-field appearance="outline" class="compact-select">
                          <mat-label>Nueva categoría</mat-label>
                          <mat-select
                            [value]="categoriaDestino(r.id)"
                            (selectionChange)="seleccionarDestino(r.id, $event.value)">
                            @for (cat of categoriasSuperiores(r); track cat.id) {
                              <mat-option [value]="cat.id">
                                Nivel {{ cat.nivel }} - {{ cat.nombre }}
                              </mat-option>
                            }
                          </mat-select>
                        </mat-form-field>
                        <button
                          mat-flat-button
                          color="primary"
                          [disabled]="!categoriaDestino(r.id)"
                          (click)="promocionar(r)">
                          Ascender
                        </button>
                      </div>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>

          @if (reporteros().length === 0) {
            <div class="empty-state">No hay reporteros en bolsa todavía.</div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .subtext {
      font-size: 0.8rem;
      color: #64748b;
    }
    .promote-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0;
    }
    .compact-select {
      width: 220px;
      margin-bottom: -1.25em;
    }
  `]
})
export class ReporterosComponent implements OnInit {
  private readonly reporterosService = inject(ReporterosService);
  private readonly categoriasService = inject(CategoriasService);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['dni', 'nombre', 'categoriaActual', 'promocion'];
  readonly reporteros = signal<Reportero[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(false);
  private readonly destinos = signal<Record<number, number>>({});

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.categoriasService.listarCategorias().subscribe({
      next: (cats) => this.categorias.set(cats),
      error: (err) => this.snackBar.open(extractErrorMessage(err), 'Cerrar', { duration: 5000 })
    });

    this.reporterosService.listarReporteros(true).subscribe({
      next: (data) => {
        this.reporteros.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.snackBar.open(extractErrorMessage(err), 'Cerrar', { duration: 5000 });
      }
    });
  }

  categoriasSuperiores(reportero: Reportero): Categoria[] {
    const nivelActual = reportero.categoria?.nivel ?? 0;
    return this.categorias().filter((c) => c.nivel > nivelActual);
  }

  seleccionarDestino(reporteroId: number, categoriaId: number): void {
    this.destinos.update((map) => ({ ...map, [reporteroId]: categoriaId }));
  }

  categoriaDestino(reporteroId: number): number | null {
    return this.destinos()[reporteroId] ?? null;
  }

  promocionar(reportero: Reportero): void {
    const categoriaId = this.categoriaDestino(reportero.id);
    if (!categoriaId) {
      return;
    }
    this.reporterosService.promocionarReportero(reportero.id, { categoriaId }).subscribe({
      next: () => {
        this.snackBar.open(`${reportero.nombre} ${reportero.apellidos} promocionado correctamente`, 'Cerrar', {
          duration: 3500
        });
        this.cargarDatos();
      },
      error: (err) => this.snackBar.open(extractErrorMessage(err), 'Cerrar', { duration: 5000 })
    });
  }
}

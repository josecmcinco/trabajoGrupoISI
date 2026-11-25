import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Categoria } from '../../core/models/siger.models';
import { CategoriasService } from '../../core/services/categorias.service';
import { extractErrorMessage } from '../../core/utils/error.utils';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTableModule
  ],
  template: `
    <div class="page-container">
      <div class="section-header">
        <h1>Gestión de Categorías</h1>
        <button mat-stroked-button color="primary" (click)="cargarCategorias()">
          <mat-icon>refresh</mat-icon>
          Actualizar
        </button>
      </div>

      @if (cargando()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      <mat-card>
        <mat-card-header>
          <mat-card-title>Niveles de Calidad y Tarifas (Hoja Escrita y Foto)</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table class="siger-table">
            <thead>
              <tr>
                <th>Nivel</th>
                <th>Categoría</th>
                <th>Precio / Hoja</th>
                <th>Precio / Foto</th>
                <th>Actualizar Tarifas</th>
              </tr>
            </thead>
            <tbody>
              @for (c of categorias(); track c.id) {
                <tr>
                  <td>Nivel {{ c.nivel }}</td>
                  <td>{{ c.nombre }}</td>
                  <td>{{ c.precioPorHoja | currency: 'EUR' }}</td>
                  <td>{{ c.precioPorFoto | currency: 'EUR' }}</td>
                  <td>
                    <div class="edit-price-row">
                      <mat-form-field appearance="outline" class="price-input">
                        <mat-label>Precio / hoja (€)</mat-label>
                        <input
                          matInput
                          type="number"
                          min="0.01"
                          step="0.50"
                          [ngModel]="precioHojaEditado(c.id, c.precioPorHoja)"
                          (ngModelChange)="cambiarPrecioHojaLocal(c.id, $event)" />
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="price-input">
                        <mat-label>Precio / foto (€)</mat-label>
                        <input
                          matInput
                          type="number"
                          min="0.01"
                          step="0.50"
                          [ngModel]="precioFotoEditado(c.id, c.precioPorFoto)"
                          (ngModelChange)="cambiarPrecioFotoLocal(c.id, $event)" />
                      </mat-form-field>

                      <button mat-flat-button color="primary" (click)="guardarPrecios(c)">
                        Guardar
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .edit-price-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      padding: 6px 0;
    }
    .price-input {
      width: 150px;
      margin-bottom: -1.25em;
    }
  `]
})
export class CategoriasComponent implements OnInit {
  private readonly categoriasService = inject(CategoriasService);
  private readonly snackBar = inject(MatSnackBar);

  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(false);
  private readonly preciosHojaBorrador = signal<Record<number, number>>({});
  private readonly preciosFotoBorrador = signal<Record<number, number>>({});

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.cargando.set(true);
    this.categoriasService.listarCategorias().subscribe({
      next: (data) => {
        this.categorias.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.snackBar.open(extractErrorMessage(err), 'Cerrar', { duration: 5000 });
      }
    });
  }

  precioHojaEditado(id: number, actual: number): number {
    return this.preciosHojaBorrador()[id] ?? actual;
  }

  cambiarPrecioHojaLocal(id: number, valor: number): void {
    this.preciosHojaBorrador.update((map) => ({ ...map, [id]: Number(valor) }));
  }

  precioFotoEditado(id: number, actual: number): number {
    return this.preciosFotoBorrador()[id] ?? actual;
  }

  cambiarPrecioFotoLocal(id: number, valor: number): void {
    this.preciosFotoBorrador.update((map) => ({ ...map, [id]: Number(valor) }));
  }

  guardarPrecios(categoria: Categoria): void {
    const precioPorHoja = this.precioHojaEditado(categoria.id, categoria.precioPorHoja);
    const precioPorFoto = this.precioFotoEditado(categoria.id, categoria.precioPorFoto);
    this.categoriasService.actualizarPrecio(categoria.id, { precioPorHoja, precioPorFoto }).subscribe({
      next: () => {
        this.snackBar.open(`Tarifas de ${categoria.nombre} actualizadas`, 'Cerrar', { duration: 3500 });
        this.cargarCategorias();
      },
      error: (err) => this.snackBar.open(extractErrorMessage(err), 'Cerrar', { duration: 5000 })
    });
  }
}

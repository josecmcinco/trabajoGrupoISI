import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActualizarPrecioCategoriaRequest, Categoria } from '../models/siger.models';

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/categorias`;

  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.baseUrl);
  }

  actualizarPrecio(id: number, request: ActualizarPrecioCategoriaRequest): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.baseUrl}/${id}/precio`, request);
  }
}

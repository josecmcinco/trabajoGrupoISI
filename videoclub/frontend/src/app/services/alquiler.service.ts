import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alquiler, CrearAlquilerRequest, ModificarDevolucionRequest } from '../models/alquiler.model';

@Injectable({
  providedIn: 'root'
})
export class AlquilerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/alquileres';

  listar(socioId?: number, videoclubId?: number): Observable<Alquiler[]> {
    let params = new HttpParams();
    if (socioId) params = params.set('socioId', socioId.toString());
    if (videoclubId) params = params.set('videoclubId', videoclubId.toString());

    return this.http.get<Alquiler[]>(this.apiUrl, { params });
  }

  obtenerPorId(id: number): Observable<Alquiler> {
    return this.http.get<Alquiler>(`${this.apiUrl}/${id}`);
  }

  crear(request: CrearAlquilerRequest): Observable<Alquiler> {
    return this.http.post<Alquiler>(this.apiUrl, request);
  }

  modificarFechaDevolucion(id: number, request: ModificarDevolucionRequest): Observable<Alquiler> {
    return this.http.patch<Alquiler>(`${this.apiUrl}/${id}/fecha-devolucion`, request);
  }
}

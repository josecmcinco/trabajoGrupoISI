import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pelicula, PeliculaRequest } from '../models/pelicula.model';

@Injectable({
  providedIn: 'root'
})
export class PeliculaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/peliculas';

  listar(videoclubId?: number): Observable<Pelicula[]> {
    let params = new HttpParams();
    if (videoclubId) {
      params = params.set('videoclubId', videoclubId.toString());
    }
    return this.http.get<Pelicula[]>(this.apiUrl, { params });
  }

  obtenerPorId(id: number): Observable<Pelicula> {
    return this.http.get<Pelicula>(`${this.apiUrl}/${id}`);
  }

  crear(request: PeliculaRequest): Observable<Pelicula> {
    return this.http.post<Pelicula>(this.apiUrl, request);
  }

  actualizar(id: number, request: PeliculaRequest): Observable<Pelicula> {
    return this.http.put<Pelicula>(`${this.apiUrl}/${id}`, request);
  }
}

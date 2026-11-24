import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Socio, SocioRequest } from '../models/socio.model';

@Injectable({
  providedIn: 'root'
})
export class SocioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/socios';

  listar(): Observable<Socio[]> {
    return this.http.get<Socio[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Socio> {
    return this.http.get<Socio>(`${this.apiUrl}/${id}`);
  }

  crear(request: SocioRequest): Observable<Socio> {
    return this.http.post<Socio>(this.apiUrl, request);
  }

  actualizar(id: number, request: SocioRequest): Observable<Socio> {
    return this.http.put<Socio>(`${this.apiUrl}/${id}`, request);
  }
}

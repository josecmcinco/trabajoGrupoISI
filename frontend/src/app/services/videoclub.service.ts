import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Videoclub, VideoclubRequest } from '../models/videoclub.model';

@Injectable({
  providedIn: 'root'
})
export class VideoclubService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/videoclubs';

  listar(): Observable<Videoclub[]> {
    return this.http.get<Videoclub[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Videoclub> {
    return this.http.get<Videoclub>(`${this.apiUrl}/${id}`);
  }

  crear(request: VideoclubRequest): Observable<Videoclub> {
    return this.http.post<Videoclub>(this.apiUrl, request);
  }

  actualizar(id: number, request: VideoclubRequest): Observable<Videoclub> {
    return this.http.put<Videoclub>(`${this.apiUrl}/${id}`, request);
  }
}

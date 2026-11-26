import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AsignarExclusivaRequest,
  CrearExclusivaRequest,
  EstadoExclusiva,
  Exclusiva,
  FinalizarExclusivaRequest
} from '../models/siger.models';

@Injectable({ providedIn: 'root' })
export class ExclusivasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/exclusivas`;

  listarExclusivas(estado?: EstadoExclusiva): Observable<Exclusiva[]> {
    const params = estado ? new HttpParams().set('estado', estado) : undefined;
    return this.http.get<Exclusiva[]>(this.baseUrl, { params });
  }

  crearExclusiva(request: CrearExclusivaRequest): Observable<Exclusiva> {
    return this.http.post<Exclusiva>(this.baseUrl, request);
  }

  asignarExclusiva(id: number, request: AsignarExclusivaRequest): Observable<Exclusiva> {
    return this.http.patch<Exclusiva>(`${this.baseUrl}/${id}/asignar`, request);
  }

  finalizarExclusiva(id: number, request: FinalizarExclusivaRequest): Observable<Exclusiva> {
    return this.http.patch<Exclusiva>(`${this.baseUrl}/${id}/finalizar`, request);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadisticaSocio, CalcularEstadisticaRequest } from '../models/estadistica.model';

@Injectable({
  providedIn: 'root'
})
export class EstadisticaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/estadisticas';

  listarTodas(): Observable<EstadisticaSocio[]> {
    return this.http.get<EstadisticaSocio[]>(this.apiUrl);
  }

  listarPorSocio(socioId: number): Observable<EstadisticaSocio[]> {
    return this.http.get<EstadisticaSocio[]>(`${this.apiUrl}/socio/${socioId}`);
  }

  calcularYGuardar(request: CalcularEstadisticaRequest): Observable<EstadisticaSocio> {
    return this.http.post<EstadisticaSocio>(`${this.apiUrl}/calcular`, request);
  }
}

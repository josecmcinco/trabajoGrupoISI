import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PromocionarReporteroRequest, Reportero } from '../models/siger.models';

@Injectable({ providedIn: 'root' })
export class ReporterosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reporteros`;

  listarReporteros(soloEnBolsa = true): Observable<Reportero[]> {
    const params = new HttpParams().set('soloEnBolsa', String(soloEnBolsa));
    return this.http.get<Reportero[]>(this.baseUrl, { params });
  }

  promocionarReportero(id: number, request: PromocionarReporteroRequest): Observable<Reportero> {
    return this.http.post<Reportero>(`${this.baseUrl}/${id}/promocionar`, request);
  }
}

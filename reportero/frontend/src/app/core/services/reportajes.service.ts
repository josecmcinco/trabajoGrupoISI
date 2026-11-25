import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CrearReportajeRequest, Reportaje } from '../models/siger.models';

@Injectable({ providedIn: 'root' })
export class ReportajesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reportajes`;

  listarReportajes(): Observable<Reportaje[]> {
    return this.http.get<Reportaje[]>(this.baseUrl);
  }

  crearReportaje(request: CrearReportajeRequest): Observable<Reportaje> {
    return this.http.post<Reportaje>(this.baseUrl, request);
  }
}

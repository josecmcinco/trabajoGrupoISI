import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AprobarSolicitudRequest, CrearSolicitudRequest, Solicitud } from '../models/siger.models';

@Injectable({ providedIn: 'root' })
export class SolicitudesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/solicitudes`;

  crearSolicitud(request: CrearSolicitudRequest): Observable<Solicitud> {
    return this.http.post<Solicitud>(this.baseUrl, request);
  }

  listarSolicitudes(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.baseUrl);
  }

  listarSolicitudesAceptadas(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.baseUrl}/aceptadas`);
  }

  aprobarSolicitud(id: number, request: AprobarSolicitudRequest): Observable<Solicitud> {
    return this.http.post<Solicitud>(`${this.baseUrl}/${id}/aprobar`, request);
  }

  rechazarSolicitud(id: number): Observable<Solicitud> {
    return this.http.post<Solicitud>(`${this.baseUrl}/${id}/rechazar`, {});
  }
}

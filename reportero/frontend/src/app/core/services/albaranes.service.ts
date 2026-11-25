import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Albaran, CrearAlbaranRequest } from '../models/siger.models';

@Injectable({ providedIn: 'root' })
export class AlbaranesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/albaranes`;

  listarAlbaranes(): Observable<Albaran[]> {
    return this.http.get<Albaran[]>(this.baseUrl);
  }

  crearAlbaran(request: CrearAlbaranRequest): Observable<Albaran> {
    return this.http.post<Albaran>(this.baseUrl, request);
  }
}

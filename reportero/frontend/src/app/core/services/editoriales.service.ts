import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Editorial, EditorialRequest } from '../models/siger.models';

@Injectable({ providedIn: 'root' })
export class EditorialesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/editoriales`;

  listarEditoriales(): Observable<Editorial[]> {
    return this.http.get<Editorial[]>(this.baseUrl);
  }

  crearEditorial(request: EditorialRequest): Observable<Editorial> {
    return this.http.post<Editorial>(this.baseUrl, request);
  }

  actualizarEditorial(id: number, request: EditorialRequest): Observable<Editorial> {
    return this.http.put<Editorial>(`${this.baseUrl}/${id}`, request);
  }

  eliminarEditorial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

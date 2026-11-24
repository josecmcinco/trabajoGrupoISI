import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserDateContextService {
  // Fecha manual del sistema introducida por el usuario (prohibido usar new Date() del reloj del sistema)
  private readonly _currentDate = signal<string>('2026-11-17');

  readonly currentDate = this._currentDate.asReadonly();

  setDate(newDate: string): void {
    if (newDate) {
      this._currentDate.set(newDate);
    }
  }

  getDate(): string {
    return this._currentDate();
  }
}

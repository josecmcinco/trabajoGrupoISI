import { Injectable, signal } from '@angular/core';

export type UserRole = 'ADMIN' | 'GERENTE' | 'SOCIO';

@Injectable({
  providedIn: 'root'
})
export class UserRoleContextService {
  private readonly _currentRole = signal<UserRole>('ADMIN');

  readonly currentRole = this._currentRole.asReadonly();

  setRole(role: UserRole): void {
    this._currentRole.set(role);
  }

  getRole(): UserRole {
    return this._currentRole();
  }

  isAdmin(): boolean {
    return this._currentRole() === 'ADMIN';
  }
}

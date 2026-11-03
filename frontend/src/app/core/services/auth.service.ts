import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Usuario } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private url = `${environment.apiUrl}/auth`;

  // El usuario se guarda en un signal y en sessionStorage (para que sobreviva a un F5)
  readonly usuario = signal<Usuario | null>(this.leerSesion());
  readonly estaAutenticado = computed(() => this.usuario() !== null);

  login(username: string, password: string) {
    return this.http.post<Usuario>(`${this.url}/login`, { username, password }).pipe(
      tap((usuario) => {
        this.usuario.set(usuario);
        sessionStorage.setItem('usuario', JSON.stringify(usuario));
      }),
    );
  }

  logout() {
    this.usuario.set(null);
    sessionStorage.removeItem('usuario');
    this.router.navigateByUrl('/login');
  }

  private leerSesion(): Usuario | null {
    const guardado = sessionStorage.getItem('usuario');
    return guardado ? (JSON.parse(guardado) as Usuario) : null;
  }
}

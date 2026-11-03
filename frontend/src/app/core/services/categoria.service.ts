import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { Categoria } from '../models';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/categorias`;

  listar() {
    return this.http.get<Categoria[]>(this.url);
  }

  crear(categoria: { nombre: string; descripcion: string | null }) {
    return this.http.post<Categoria>(this.url, categoria);
  }
}

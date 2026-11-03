import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { Producto, ProductoGuardar } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/productos`;

  listar(busqueda = '', idCategoria = 0, soloActivos = false) {
    let params = new HttpParams().set('solo_activos', soloActivos);
    if (busqueda.trim()) params = params.set('busqueda', busqueda.trim());
    if (idCategoria > 0) params = params.set('id_categoria', idCategoria);
    return this.http.get<Producto[]>(this.url, { params });
  }

  stockBajo() {
    return this.http.get<Producto[]>(`${this.url}/stock-bajo`);
  }

  crear(producto: ProductoGuardar) {
    return this.http.post<Producto>(this.url, producto);
  }

  actualizar(id: number, producto: ProductoGuardar) {
    return this.http.put<Producto>(`${this.url}/${id}`, producto);
  }

  cambiarEstado(id: number, activo: boolean) {
    return this.http.patch<Producto>(`${this.url}/${id}/estado`, { activo });
  }
}

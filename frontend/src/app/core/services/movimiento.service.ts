import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { Movimiento, MovimientoGuardar } from '../models';

@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/movimientos`;

  listar(idProducto = 0, desde = '', hasta = '') {
    let params = new HttpParams();
    if (idProducto > 0) params = params.set('id_producto', idProducto);
    if (desde) params = params.set('fecha_desde', desde);
    if (hasta) params = params.set('fecha_hasta', hasta);
    return this.http.get<Movimiento[]>(this.url, { params });
  }

  registrarEntrada(datos: MovimientoGuardar) {
    return this.http.post(`${this.url}/entradas`, datos);
  }

  registrarSalida(datos: MovimientoGuardar) {
    return this.http.post(`${this.url}/salidas`, datos);
  }
}

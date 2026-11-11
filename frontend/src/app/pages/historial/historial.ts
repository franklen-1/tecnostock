import { DatePipe } from '@angular/common';
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';

import { Movimiento, Producto } from '../../core/models';
import { MovimientoService } from '../../core/services/movimiento.service';
import { ProductoService } from '../../core/services/producto.service';
import { mensajeError } from '../../core/utils';

@Component({
  selector: 'app-historial',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './historial.html',
})
export class Historial {
  private movimientoService = inject(MovimientoService);
  private productoService = inject(ProductoService);

  movimientos = signal<Movimiento[]>([]);
  productos = signal<Producto[]>([]);
  error = signal('');

  // Filtros (formulario sencillo de consulta, no de registro)
  idProducto = signal(0);
  desde = signal('');
  hasta = signal('');

  constructor() {
    this.productoService.listar().subscribe((lista) => this.productos.set(lista));
    this.consultar();
  }

  consultar() {
    this.error.set('');
    this.movimientoService.listar(this.idProducto(), this.desde(), this.hasta()).subscribe({
      next: (lista) => this.movimientos.set(lista),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  limpiar() {
    this.idProducto.set(0);
    this.desde.set('');
    this.hasta.set('');
    this.consultar();
  }
}

import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';

import { Producto } from '../../core/models';
import { ProductoService } from '../../core/services/producto.service';

@Component({
  selector: 'app-stock-bajo',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './stock-bajo.html',
})
export class StockBajo {
  private servicio = inject(ProductoService);
  productos = signal<Producto[]>([]);

  constructor() {
    this.servicio.stockBajo().subscribe((lista) => this.productos.set(lista));
  }
}

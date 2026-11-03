import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, maxLength, minLength, required, submit, validate } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

import { Producto } from '../../core/models';
import { MovimientoService } from '../../core/services/movimiento.service';
import { ProductoService } from '../../core/services/producto.service';
import { ahoraLocal, mensajeError } from '../../core/utils';

@Component({
  selector: 'app-movimientos',
  imports: [FormField],
  templateUrl: './movimientos.html',
})
export class Movimientos {
  private movimientoService = inject(MovimientoService);
  private productoService = inject(ProductoService);

  tipo = signal<'E' | 'S'>('E');                 // E = entrada, S = salida
  productos = signal<Producto[]>([]);
  mensaje = signal('');
  error = signal('');

  modelo = signal({ id_producto: '', cantidad: 1, fecha: ahoraLocal(), motivo: '' });
  formulario = form(this.modelo, (c) => {
    required(c.id_producto, { message: 'Selecciona un producto.' });
    validate(c.cantidad, ({ value }) =>
      Number.isInteger(value()) && value() > 0 ? null : { kind: 'cantidad', message: 'La cantidad debe ser un entero mayor que cero.' });
    required(c.fecha, { message: 'La fecha es obligatoria.' });
    required(c.motivo, { message: 'El motivo es obligatorio.' });
    minLength(c.motivo, 3, { message: 'El motivo debe tener al menos 3 caracteres.' });
    maxLength(c.motivo, 200, { message: 'El motivo admite máximo 200 caracteres.' });
  });

  // Producto elegido en el formulario (para mostrar su stock actual)
  productoSeleccionado = computed(() =>
    this.productos().find((p) => String(p.id_producto) === this.modelo().id_producto) ?? null);

  constructor() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.listar('', 0, true).subscribe((lista) => this.productos.set(lista));
  }

  cambiarTipo(tipo: 'E' | 'S') {
    this.tipo.set(tipo);
    this.mensaje.set('');
    this.error.set('');
  }

  registrar(evento: Event) {
    evento.preventDefault();
    this.mensaje.set('');
    this.error.set('');
    submit(this.formulario, async () => {
      const m = this.modelo();
      const datos = {
        id_producto: Number(m.id_producto),
        cantidad: m.cantidad,
        fecha: m.fecha,
        motivo: m.motivo.trim(),
      };
      try {
        if (this.tipo() === 'E') await firstValueFrom(this.movimientoService.registrarEntrada(datos));
        else await firstValueFrom(this.movimientoService.registrarSalida(datos));

        this.mensaje.set(this.tipo() === 'E' ? 'Entrada registrada.' : 'Salida registrada.');
        this.modelo.set({ id_producto: m.id_producto, cantidad: 1, fecha: ahoraLocal(), motivo: '' });
        this.formulario().reset();
        this.cargarProductos();                // se vuelve a leer el stock actualizado desde la API
      } catch (e) {
        this.error.set(mensajeError(e));       // ej. "Stock insuficiente..." viene del procedimiento almacenado
      }
    });
  }
}

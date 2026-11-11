import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import {
  FormField,
  form,
  maxLength,
  minLength,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

import { Categoria, Producto } from '../../core/models';
import { CategoriaService } from '../../core/services/categoria.service';
import { ProductoService } from '../../core/services/producto.service';
import { mensajeError } from '../../core/utils';

// Valores iniciales del formulario (nuevo producto)
const VACIO = {
  codigo: '',
  nombre: '',
  descripcion: '',
  id_categoria: '', // texto, porque un <select> devuelve texto; se convierte a número al guardar
  precio_compra: 0,
  precio_venta: 0,
  stock_minimo: 0,
};

@Component({
  selector: 'app-productos',
  imports: [FormField, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './productos.html',
})
export class Productos {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);

  // ---- Datos de la pantalla ----
  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]); // se cargan desde la API (no están escritas en el código)
  mensaje = signal('');
  error = signal('');

  // ---- Filtros del listado ----
  busqueda = signal('');
  filtroCategoria = signal(0);
  soloActivos = signal(false);

  // ---- Formulario (Signal Forms) ----
  mostrarFormulario = signal(false);
  editandoId = signal<number | null>(null); // null = creando, número = editando ese producto
  modelo = signal({ ...VACIO });
  formulario = form(this.modelo, (c) => {
    required(c.codigo, { message: 'El código es obligatorio.' });
    minLength(c.codigo, 2, { message: 'El código debe tener al menos 2 caracteres.' });
    maxLength(c.codigo, 30, { message: 'El código admite máximo 30 caracteres.' });
    required(c.nombre, { message: 'El nombre es obligatorio.' });
    minLength(c.nombre, 2, { message: 'El nombre debe tener al menos 2 caracteres.' });
    maxLength(c.descripcion, 300, { message: 'La descripción admite máximo 300 caracteres.' });
    required(c.id_categoria, { message: 'Selecciona una categoría.' });
    // Validaciones propias: devuelven un error {kind, message} o null si todo está bien
    validate(c.precio_compra, ({ value }) =>
      value() > 0
        ? null
        : { kind: 'precio', message: 'El precio de compra debe ser mayor que cero.' },
    );
    validate(c.precio_venta, ({ value }) =>
      value() > 0
        ? null
        : { kind: 'precio', message: 'El precio de venta debe ser mayor que cero.' },
    );
    validate(c.stock_minimo, ({ value }) =>
      Number.isInteger(value()) && value() >= 0
        ? null
        : { kind: 'stock', message: 'El stock mínimo debe ser un entero mayor o igual a cero.' },
    );
  });

  constructor() {
    this.categoriaService.listar().subscribe((lista) => this.categorias.set(lista));
    this.cargar();
  }

  cargar() {
    this.productoService
      .listar(this.busqueda(), this.filtroCategoria(), this.soloActivos())
      .subscribe((lista) => this.productos.set(lista));
  }

  // ---- Filtros ----
  alBuscar(texto: string) {
    this.busqueda.set(texto);
    this.cargar();
  }
  alFiltrarCategoria(valor: string) {
    this.filtroCategoria.set(Number(valor));
    this.cargar();
  }
  alCambiarActivos(marcado: boolean) {
    this.soloActivos.set(marcado);
    this.cargar();
  }

  // ---- Abrir / cerrar formulario ----
  nuevo() {
    this.editandoId.set(null);
    this.modelo.set({ ...VACIO });
    this.formulario().reset();
    this.limpiarMensajes();
    this.mostrarFormulario.set(true);
  }

  editar(p: Producto) {
    this.editandoId.set(p.id_producto);
    this.modelo.set({
      codigo: p.codigo,
      nombre: p.nombre,
      descripcion: p.descripcion ?? '',
      id_categoria: String(p.id_categoria),
      precio_compra: p.precio_compra,
      precio_venta: p.precio_venta,
      stock_minimo: p.stock_minimo,
    });
    this.formulario().reset();
    this.limpiarMensajes();
    this.mostrarFormulario.set(true);
  }

  cancelar() {
    this.mostrarFormulario.set(false);
  }

  // ---- Guardar (crear o actualizar) ----
  guardar(evento: Event) {
    evento.preventDefault();
    this.limpiarMensajes();
    submit(this.formulario, async () => {
      const m = this.modelo();
      const datos = {
        codigo: m.codigo.trim(),
        nombre: m.nombre.trim(),
        descripcion: m.descripcion.trim() || null,
        id_categoria: Number(m.id_categoria),
        precio_compra: m.precio_compra,
        precio_venta: m.precio_venta,
        stock_minimo: m.stock_minimo,
      };
      try {
        const id = this.editandoId();
        if (id === null) await firstValueFrom(this.productoService.crear(datos));
        else await firstValueFrom(this.productoService.actualizar(id, datos));
        this.mensaje.set(id === null ? 'Producto registrado.' : 'Producto actualizado.');
        this.mostrarFormulario.set(false);
        this.cargar(); // refresca el listado con lo que hay en SQL Server
      } catch (e) {
        this.error.set(mensajeError(e));
      }
    });
  }

  // ---- Activar / desactivar (nunca se borra el producto) ----
  cambiarEstado(p: Producto) {
    this.limpiarMensajes();
    this.productoService.cambiarEstado(p.id_producto, !p.activo).subscribe({
      next: () => {
        this.mensaje.set(p.activo ? 'Producto desactivado.' : 'Producto activado.');
        this.cargar();
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  private limpiarMensajes() {
    this.mensaje.set('');
    this.error.set('');
  }
}

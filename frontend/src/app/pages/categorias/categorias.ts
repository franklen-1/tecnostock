import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormField, form, minLength, maxLength, required, submit } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

import { Categoria } from '../../core/models';
import { CategoriaService } from '../../core/services/categoria.service';
import { mensajeError } from '../../core/utils';

@Component({
  selector: 'app-categorias',
  imports: [FormField],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './categorias.html',
})
export class Categorias {
  private servicio = inject(CategoriaService);

  categorias = signal<Categoria[]>([]);
  mensaje = signal('');
  error = signal('');

  modelo = signal({ nombre: '', descripcion: '' });
  formulario = form(this.modelo, (c) => {
    required(c.nombre, { message: 'El nombre es obligatorio.' });
    minLength(c.nombre, 2, { message: 'El nombre debe tener al menos 2 caracteres.' });
    maxLength(c.nombre, 80, { message: 'El nombre admite máximo 80 caracteres.' });
    maxLength(c.descripcion, 250, { message: 'La descripción admite máximo 250 caracteres.' });
  });

  constructor() {
    this.cargar();
  }

  cargar() {
    this.servicio.listar().subscribe((lista) => this.categorias.set(lista));
  }

  guardar(evento: Event) {
    evento.preventDefault();
    this.mensaje.set('');
    this.error.set('');
    submit(this.formulario, async () => {
      try {
        const { nombre, descripcion } = this.modelo();
        await firstValueFrom(this.servicio.crear({ nombre, descripcion: descripcion || null }));
        this.mensaje.set('Categoría registrada.');
        this.modelo.set({ nombre: '', descripcion: '' });
        this.formulario().reset();
        this.cargar(); // se vuelve a consultar la API para mostrar el cambio
      } catch (e) {
        this.error.set(mensajeError(e));
      }
    });
  }
}

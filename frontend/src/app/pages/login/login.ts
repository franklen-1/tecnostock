import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormField, form, required, submit } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { mensajeError } from '../../core/utils';

@Component({
  selector: 'app-login',
  imports: [FormField],
  templateUrl: './login.html',
   styleUrl: './login.css'
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  // 1) El MODELO es un signal con los datos del formulario
  modelo = signal({ username: '', password: '' });

  // 2) form() envuelve el modelo y define las validaciones (con sus mensajes)
  formulario = form(this.modelo, (campo) => {
    required(campo.username, { message: 'El usuario es obligatorio.' });
    required(campo.password, { message: 'La contraseña es obligatoria.' });
  });

  error = signal('');

  // 3) submit() marca los campos como tocados y solo ejecuta si el formulario es válido
  ingresar(evento: Event) {
    evento.preventDefault();
    this.error.set('');
    submit(this.formulario, async () => {
      try {
        const { username, password } = this.modelo();
        await firstValueFrom(this.auth.login(username, password));
        this.router.navigateByUrl('/dashboard');
      } catch (e) {
        this.error.set(mensajeError(e));
      }
    });
  }
}

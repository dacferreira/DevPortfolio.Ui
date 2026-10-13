import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthLayout } from '../auth-layout/auth-layout';

@Component({
  selector: 'app-esqueci-senha',
  imports: [ReactiveFormsModule, RouterLink, AuthLayout],
  templateUrl: './esqueci-senha.html',
  styleUrl: './esqueci-senha.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EsqueciSenha {
  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly solicitado = signal(false);

  protected emailInvalido(): boolean {
    const controle = this.form.controls.email;
    return controle.invalid && (controle.touched || controle.dirty);
  }

  // O envio do link depende de um serviço de e-mail na API, ainda não implementado.
  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.solicitado.set(true);
  }
}

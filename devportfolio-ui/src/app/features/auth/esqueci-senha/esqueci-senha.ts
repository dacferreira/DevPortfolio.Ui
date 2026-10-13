import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ContaService } from '../../../core/conta/conta.service';
import { mensagemDeErro } from '../../../core/http/api-resposta';
import { AuthLayout } from '../auth-layout/auth-layout';

@Component({
  selector: 'app-esqueci-senha',
  imports: [ReactiveFormsModule, RouterLink, AuthLayout],
  templateUrl: './esqueci-senha.html',
  styleUrl: './esqueci-senha.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EsqueciSenha {
  private readonly contaService = inject(ContaService);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly enviando = signal(false);
  protected readonly confirmacao = signal<string | null>(null);
  protected readonly erro = signal<string | null>(null);

  protected emailInvalido(): boolean {
    const controle = this.form.controls.email;
    return controle.invalid && (controle.touched || controle.dirty);
  }

  protected enviar(): void {
    if (this.enviando()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.erro.set(null);
    this.confirmacao.set(null);
    this.enviando.set(true);

    this.contaService
      .solicitarRedefinicaoSenha(this.form.controls.email.value)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (mensagem) => this.confirmacao.set(mensagem),
        error: (erro: HttpErrorResponse) =>
          this.erro.set(
            erro.status === 0
              ? 'Não foi possível conectar ao servidor. Tente novamente.'
              : (mensagemDeErro(erro) ?? 'Ocorreu um erro ao enviar o link. Tente novamente.'),
          ),
      });
  }
}

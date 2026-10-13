import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ContaService } from '../../../core/conta/conta.service';
import { mensagemDeErro } from '../../../core/http/api-resposta';
import { AuthLayout } from '../auth-layout/auth-layout';
import { MENSAGEM_SENHA_FRACA, senhaForte, senhasIguais } from '../validadores';

type Campo = 'nome' | 'email' | 'senha' | 'confirmarSenha' | 'aceitouTermos';

@Component({
  selector: 'app-cadastro',
  imports: [ReactiveFormsModule, RouterLink, AuthLayout],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cadastro {
  private readonly contaService = inject(ContaService);
  private readonly router = inject(Router);

  protected readonly mensagemSenhaFraca = MENSAGEM_SENHA_FRACA;

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      senha: ['', [Validators.required, senhaForte]],
      confirmarSenha: ['', [Validators.required]],
      aceitouTermos: [false, [Validators.requiredTrue]],
    },
    { validators: senhasIguais('senha', 'confirmarSenha') },
  );

  protected readonly mostrarSenha = signal(false);
  protected readonly mostrarConfirmacao = signal(false);
  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected campoInvalido(campo: Campo): boolean {
    const controle = this.form.controls[campo];
    const tocado = controle.touched || controle.dirty;
    if (campo === 'confirmarSenha') {
      return tocado && (controle.invalid || this.form.hasError('senhasDiferentes'));
    }
    return tocado && controle.invalid;
  }

  protected criarConta(): void {
    if (this.enviando()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.erro.set(null);
    this.enviando.set(true);

    this.contaService
      .registrar(this.form.getRawValue())
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/login'], { queryParams: { cadastro: 'ok' } }),
        error: (erro: HttpErrorResponse) => this.erro.set(this.mensagemDeErro(erro)),
      });
  }

  private mensagemDeErro(erro: HttpErrorResponse): string {
    if (erro.status === 0) {
      return 'Não foi possível conectar ao servidor. Tente novamente.';
    }
    return mensagemDeErro(erro) ?? 'Ocorreu um erro ao criar a conta. Tente novamente.';
  }
}

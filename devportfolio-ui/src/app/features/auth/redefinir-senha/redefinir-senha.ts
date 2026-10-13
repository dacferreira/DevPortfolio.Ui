import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ContaService } from '../../../core/conta/conta.service';
import { mensagemDeErro } from '../../../core/http/api-resposta';
import { AuthLayout } from '../auth-layout/auth-layout';
import { MENSAGEM_SENHA_FRACA, senhaForte, senhasIguais } from '../validadores';

// Destino do link enviado por e-mail: /redefinir-senha?token=...
@Component({
  selector: 'app-redefinir-senha',
  imports: [ReactiveFormsModule, RouterLink, AuthLayout],
  templateUrl: './redefinir-senha.html',
  styleUrl: './redefinir-senha.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedefinirSenha {
  private readonly contaService = inject(ContaService);
  private readonly router = inject(Router);

  protected readonly token = inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? '';
  protected readonly mensagemSenhaFraca = MENSAGEM_SENHA_FRACA;

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      novaSenha: ['', [Validators.required, senhaForte]],
      confirmarSenha: ['', [Validators.required]],
    },
    { validators: senhasIguais('novaSenha', 'confirmarSenha') },
  );

  protected readonly mostrarSenha = signal(false);
  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly linkInvalido = signal(!this.token);

  protected campoInvalido(campo: 'novaSenha' | 'confirmarSenha'): boolean {
    const controle = this.form.controls[campo];
    const tocado = controle.touched || controle.dirty;
    if (campo === 'confirmarSenha') {
      return tocado && (controle.invalid || this.form.hasError('senhasDiferentes'));
    }
    return tocado && controle.invalid;
  }

  protected redefinir(): void {
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
      .redefinirSenha({ token: this.token, ...this.form.getRawValue() })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/login'], { queryParams: { senha: 'redefinida' } }),
        error: (erro: HttpErrorResponse) => this.tratarErro(erro),
      });
  }

  private tratarErro(erro: HttpErrorResponse): void {
    if (erro.error?.erro?.codigo === 'TOKEN_INVALIDO') {
      this.linkInvalido.set(true);
      return;
    }
    this.erro.set(
      erro.status === 0
        ? 'Não foi possível conectar ao servidor. Tente novamente.'
        : (mensagemDeErro(erro) ?? 'Ocorreu um erro ao redefinir a senha. Tente novamente.'),
    );
  }
}

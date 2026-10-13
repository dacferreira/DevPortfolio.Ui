import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { mensagemDeErro } from '../../../core/http/api-resposta';
import { AuthLayout } from '../auth-layout/auth-layout';

const ROTA_APOS_LOGIN = '/admin';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, AuthLayout],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
    lembrar: [false],
  });

  protected readonly mostrarSenha = signal(false);
  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected alternarSenha(): void {
    this.mostrarSenha.update((valor) => !valor);
  }

  protected campoInvalido(campo: 'email' | 'senha'): boolean {
    const controle = this.form.controls[campo];
    return controle.invalid && (controle.touched || controle.dirty);
  }

  protected entrar(): void {
    // Impede submissões duplicadas enquanto a requisição anterior não termina.
    if (this.enviando()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, senha, lembrar } = this.form.getRawValue();
    this.erro.set(null);
    this.enviando.set(true);

    this.authService
      .login({ email, senha, lembrarDeMim: lembrar })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl(this.destinoAposLogin()),
        error: (erro: HttpErrorResponse) => this.erro.set(this.mensagemDeErro(erro)),
      });
  }

  // Aceita apenas caminhos internos, para não permitir redirecionamento para outro site.
  private destinoAposLogin(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    return returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : ROTA_APOS_LOGIN;
  }

  private mensagemDeErro(erro: HttpErrorResponse): string {
    if (erro.status === 0) {
      return 'Não foi possível conectar ao servidor. Tente novamente.';
    }
    if (erro.status === 401) {
      return 'E-mail ou senha inválidos.';
    }
    return mensagemDeErro(erro) ?? 'Ocorreu um erro ao entrar. Tente novamente.';
  }
}

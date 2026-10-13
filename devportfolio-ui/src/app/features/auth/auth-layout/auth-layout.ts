import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthIlustracao } from './auth-ilustracao/auth-ilustracao';

// Moldura das telas de autenticação: apresentação à esquerda e painel com o formulário à direita.
@Component({
  selector: 'app-auth-layout',
  imports: [RouterLink, AuthIlustracao],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayout {
  readonly titulo = input.required<string>();
  readonly destaque = input<string>();
  // Texto na mesma linha do destaque, antes dele, sem a cor de destaque (ex.: "comunidade ").
  readonly antesDoDestaque = input<string>();
  readonly texto = input.required<string>();
}

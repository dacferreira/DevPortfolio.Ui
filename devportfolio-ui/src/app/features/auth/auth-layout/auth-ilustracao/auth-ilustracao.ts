import { ChangeDetectionStrategy, Component } from '@angular/core';

// Ilustração decorativa das telas de autenticação: notebook com código e as tecnologias do portfólio.
@Component({
  selector: 'app-auth-ilustracao',
  templateUrl: './auth-ilustracao.html',
  styleUrl: './auth-ilustracao.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class AuthIlustracao {}

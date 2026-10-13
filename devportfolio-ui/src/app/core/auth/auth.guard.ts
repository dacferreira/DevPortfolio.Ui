import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// Controla apenas a navegação: quem protege os dados é a API, que valida a sessão em cada endpoint.
export const authGuard: CanActivateFn = async (_route, state) => {
  const router = inject(Router);
  const autenticado = await inject(AuthService).verificarSessao();

  return autenticado || router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

// Evita que um usuário já autenticado volte para a tela de login.
export const visitanteGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const autenticado = await inject(AuthService).verificarSessao();

  return autenticado ? router.createUrlTree(['/admin']) : true;
};

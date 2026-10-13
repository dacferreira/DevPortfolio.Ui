import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ehAdministrador } from './auth.models';
import { AuthService } from './auth.service';

// Controla apenas a navegação: quem protege os dados é a API, que valida a sessão em cada endpoint.
export const authGuard: CanActivateFn = async (_route, state) => {
  const router = inject(Router);
  const autenticado = await inject(AuthService).verificarSessao();

  return autenticado || router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

// Área restrita: exige sessão e perfil Administrador. Visitantes voltam para a página inicial.
export const adminGuard: CanActivateFn = async (_route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!(await authService.verificarSessao())) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  return ehAdministrador(authService.usuario()) || router.createUrlTree(['/']);
};

// Evita que um usuário já autenticado volte para as telas de login e cadastro.
export const visitanteGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!(await authService.verificarSessao())) {
    return true;
  }
  return router.createUrlTree([ehAdministrador(authService.usuario()) ? '/admin' : '/']);
};

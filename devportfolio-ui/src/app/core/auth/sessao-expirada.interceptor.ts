import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

// Quando um endpoint protegido responde 401, a sessão expirou: limpa o estado e volta ao login.
// As rotas de /auth tratam o 401 por conta própria (ex.: senha incorreta no login).
export const sessaoExpiradaInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((erro: unknown) => {
      if (erro instanceof HttpErrorResponse && erro.status === 401 && !req.url.includes('/auth/')) {
        authService.encerrarSessaoLocal();
        router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => erro);
    }),
  );
};

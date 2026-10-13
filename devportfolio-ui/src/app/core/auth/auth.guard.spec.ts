import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { authGuard, visitanteGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('Guards de autenticação', () => {
  const rota = {} as ActivatedRouteSnapshot;
  const estado = { url: '/admin' } as RouterStateSnapshot;

  function configurar(autenticado: boolean): void {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { verificarSessao: () => Promise.resolve(autenticado) } },
      ],
    });
  }

  function executar(guard: typeof authGuard) {
    return TestBed.runInInjectionContext(() => guard(rota, estado)) as Promise<boolean | UrlTree>;
  }

  it('authGuard deve liberar usuário autenticado', async () => {
    configurar(true);

    expect(await executar(authGuard)).toBe(true);
  });

  it('authGuard deve enviar visitante para o login guardando a página pedida', async () => {
    configurar(false);

    const resultado = await executar(authGuard);

    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe('/login?returnUrl=%2Fadmin');
  });

  it('visitanteGuard deve liberar o login para visitante', async () => {
    configurar(false);

    expect(await executar(visitanteGuard)).toBe(true);
  });

  it('visitanteGuard deve enviar usuário autenticado para a área restrita', async () => {
    configurar(true);

    const resultado = await executar(visitanteGuard);

    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe('/admin');
  });
});

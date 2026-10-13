import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { adminGuard, authGuard, visitanteGuard } from './auth.guard';
import { Perfil, UsuarioAutenticado } from './auth.models';
import { AuthService } from './auth.service';

describe('Guards de autenticação', () => {
  const rota = {} as ActivatedRouteSnapshot;
  const estado = { url: '/admin' } as RouterStateSnapshot;

  function configurar(perfil: Perfil | null): void {
    const usuario: UsuarioAutenticado | null = perfil
      ? { id: 1, nome: 'Diogo', email: 'diogo@email.com', perfil }
      : null;

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { verificarSessao: () => Promise.resolve(usuario !== null), usuario: signal(usuario) },
        },
      ],
    });
  }

  async function executar(guard: typeof authGuard): Promise<boolean | string> {
    const resultado = (await TestBed.runInInjectionContext(() => guard(rota, estado))) as boolean | UrlTree;
    return resultado instanceof UrlTree ? TestBed.inject(Router).serializeUrl(resultado) : resultado;
  }

  it('authGuard deve liberar usuário autenticado', async () => {
    configurar('Visitante');

    expect(await executar(authGuard)).toBe(true);
  });

  it('authGuard deve enviar visitante para o login guardando a página pedida', async () => {
    configurar(null);

    expect(await executar(authGuard)).toBe('/login?returnUrl=%2Fadmin');
  });

  it('adminGuard deve liberar administrador', async () => {
    configurar('Administrador');

    expect(await executar(adminGuard)).toBe(true);
  });

  it('adminGuard deve mandar visitante autenticado para a página inicial', async () => {
    configurar('Visitante');

    expect(await executar(adminGuard)).toBe('/');
  });

  it('adminGuard deve mandar quem não está autenticado para o login', async () => {
    configurar(null);

    expect(await executar(adminGuard)).toBe('/login?returnUrl=%2Fadmin');
  });

  it('visitanteGuard deve liberar o login para quem não está autenticado', async () => {
    configurar(null);

    expect(await executar(visitanteGuard)).toBe(true);
  });

  it('visitanteGuard deve enviar administrador autenticado para a área restrita', async () => {
    configurar('Administrador');

    expect(await executar(visitanteGuard)).toBe('/admin');
  });

  it('visitanteGuard deve enviar visitante autenticado para a página inicial', async () => {
    configurar('Visitante');

    expect(await executar(visitanteGuard)).toBe('/');
  });
});

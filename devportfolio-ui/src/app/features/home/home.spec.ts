import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Perfil, UsuarioAutenticado } from '../../core/auth/auth.models';
import { AuthService } from '../../core/auth/auth.service';
import { Home } from './home';

describe('Home', () => {
  let authService: {
    usuario: ReturnType<typeof signal<UsuarioAutenticado | null>>;
    verificarSessao: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  async function montar(perfil: Perfil | null): Promise<HTMLElement> {
    authService = {
      usuario: signal(perfil ? { id: 1, nome: 'Maria', email: 'maria@email.com', perfil } : null),
      verificarSessao: vi.fn().mockResolvedValue(perfil !== null),
      logout: vi.fn().mockReturnValue(of(undefined)),
    };
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('deve verificar a sessão ao abrir', async () => {
    await montar(null);

    expect(authService.verificarSessao).toHaveBeenCalled();
  });

  it('deve oferecer o login para quem não está autenticado', async () => {
    const elemento = await montar(null);

    expect(elemento.querySelector('a')?.getAttribute('href')).toBe('/login');
  });

  it('deve cumprimentar o visitante sem oferecer a área restrita', async () => {
    const elemento = await montar('Visitante');

    expect(elemento.textContent).toContain('Olá, Maria!');
    expect(elemento.querySelector('a[href="/admin"]')).toBeNull();
  });

  it('deve levar o administrador à área restrita', async () => {
    const elemento = await montar('Administrador');

    expect(elemento.querySelector('a[href="/admin"]')).toBeTruthy();
  });

  it('deve permitir sair', async () => {
    const elemento = await montar('Visitante');

    elemento.querySelector<HTMLButtonElement>('button')!.click();

    expect(authService.logout).toHaveBeenCalled();
  });
});

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Home } from './home';

describe('Home', () => {
  async function montar(autenticado: boolean): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([]), { provide: AuthService, useValue: { autenticado: signal(autenticado) } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('deve oferecer o login para visitantes', async () => {
    const elemento = await montar(false);

    expect(elemento.querySelector('a')?.getAttribute('href')).toBe('/login');
  });

  it('deve levar o usuário autenticado à área restrita', async () => {
    const elemento = await montar(true);

    expect(elemento.querySelector('a')?.getAttribute('href')).toBe('/admin');
  });
});

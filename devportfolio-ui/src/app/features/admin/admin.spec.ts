import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { Admin } from './admin';

describe('Admin', () => {
  let fixture: ComponentFixture<Admin>;
  let authService: { usuario: ReturnType<typeof signal>; logout: ReturnType<typeof vi.fn> };
  let navegar: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    authService = {
      usuario: signal({ id: 1, nome: 'Diogo', email: 'diogo@email.com', perfil: 'Administrador' }),
      logout: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [Admin],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(Admin);
    await fixture.whenStable();
  });

  it('deve exibir o usuário autenticado', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Olá, Diogo!');
  });

  it('deve sair e voltar ao login', () => {
    authService.logout.mockReturnValue(of(undefined));

    (fixture.nativeElement as HTMLElement).querySelector('button')!.click();

    expect(authService.logout).toHaveBeenCalled();
    expect(navegar).toHaveBeenCalledWith('/login');
  });

  it('deve voltar ao login mesmo se o logout falhar na API', () => {
    authService.logout.mockReturnValue(throwError(() => new Error('falha')));

    (fixture.nativeElement as HTMLElement).querySelector('button')!.click();

    expect(navegar).toHaveBeenCalledWith('/login');
  });
});

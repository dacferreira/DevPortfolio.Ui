import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { sessaoExpiradaInterceptor } from './sessao-expirada.interceptor';

describe('sessaoExpiradaInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: { encerrarSessaoLocal: ReturnType<typeof vi.fn> };
  let navegar: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    authService = { encerrarSessaoLocal: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([sessaoExpiradaInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => httpMock.verify());

  it('deve encerrar a sessão e voltar ao login quando um endpoint protegido responder 401', () => {
    http.get('/api/projetos').subscribe({ error: () => undefined });
    httpMock.expectOne('/api/projetos').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(authService.encerrarSessaoLocal).toHaveBeenCalled();
    expect(navegar).toHaveBeenCalledWith(['/login'], expect.anything());
  });

  it('não deve interferir no 401 das rotas de autenticação', () => {
    http.post('/api/auth/login', {}).subscribe({ error: () => undefined });
    httpMock.expectOne('/api/auth/login').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(authService.encerrarSessaoLocal).not.toHaveBeenCalled();
    expect(navegar).not.toHaveBeenCalled();
  });
});

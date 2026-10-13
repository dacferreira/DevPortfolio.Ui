import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UsuarioAutenticado } from './auth.models';
import { AuthService } from './auth.service';

const USUARIO: UsuarioAutenticado = { id: 1, nome: 'Diogo', email: 'diogo@email.com', perfil: 'Administrador' };

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function responderCsrf(): void {
    const req = httpMock.expectOne('/api/auth/csrf');
    expect(req.request.method).toBe('GET');
    req.flush(null, { status: 204, statusText: 'No Content' });
  }

  it('deve obter o token anti-CSRF e enviar as credenciais no login', () => {
    let usuario: UsuarioAutenticado | undefined;
    service.login({ email: 'diogo@email.com', senha: 'Senha@123', lembrarDeMim: true }).subscribe((u) => (usuario = u));

    responderCsrf();
    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'diogo@email.com', senha: 'Senha@123', lembrarDeMim: true });
    req.flush({ sucesso: true, dados: USUARIO, erro: null });

    expect(usuario).toEqual(USUARIO);
    expect(service.autenticado()).toBe(true);
    expect(service.usuario()).toEqual(USUARIO);
  });

  it('não deve guardar nada no navegador além dos cookies emitidos pela API', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    service.login({ email: 'diogo@email.com', senha: 'Senha@123', lembrarDeMim: true }).subscribe();

    responderCsrf();
    httpMock.expectOne('/api/auth/login').flush({ sucesso: true, dados: USUARIO, erro: null });

    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });

  it('não deve autenticar quando a API recusar o login', () => {
    service.login({ email: 'diogo@email.com', senha: 'errada', lembrarDeMim: false }).subscribe({ error: () => undefined });

    responderCsrf();
    httpMock.expectOne('/api/auth/login').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(service.autenticado()).toBe(false);
  });

  it('deve reconhecer uma sessão ativa', async () => {
    const verificacao = service.verificarSessao();

    responderCsrf();
    await Promise.resolve();
    httpMock.expectOne('/api/auth/me').flush({ sucesso: true, dados: USUARIO, erro: null });

    expect(await verificacao).toBe(true);
    expect(service.usuario()).toEqual(USUARIO);
  });

  it('deve tratar sessão ausente como não autenticado e consultar a API uma única vez', async () => {
    const verificacao = service.verificarSessao();

    responderCsrf();
    await Promise.resolve();
    httpMock.expectOne('/api/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(await verificacao).toBe(false);
    expect(await service.verificarSessao()).toBe(false);
    httpMock.expectNone('/api/auth/me');
  });

  it('deve encerrar a sessão local no logout, mesmo com erro na API', () => {
    service.login({ email: 'diogo@email.com', senha: 'Senha@123', lembrarDeMim: false }).subscribe();
    responderCsrf();
    httpMock.expectOne('/api/auth/login').flush({ sucesso: true, dados: USUARIO, erro: null });

    service.logout().subscribe({ error: () => undefined });
    httpMock.expectOne('/api/auth/logout').flush(null, { status: 500, statusText: 'Erro' });

    expect(service.autenticado()).toBe(false);
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ContaService } from './conta.service';

describe('ContaService', () => {
  let service: ContaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ContaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function responderCsrf(): void {
    httpMock.expectOne('/api/auth/csrf').flush(null, { status: 204, statusText: 'No Content' });
  }

  it('deve obter o token anti-CSRF e registrar a conta', () => {
    const dados = { nome: 'Maria', email: 'maria@email.com', senha: 'Senha123', confirmarSenha: 'Senha123', aceitouTermos: true };
    let perfil: string | undefined;
    service.registrar(dados).subscribe((u) => (perfil = u.perfil));

    responderCsrf();
    const req = httpMock.expectOne('/api/conta/registro');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dados);
    req.flush({ sucesso: true, dados: { id: 2, nome: 'Maria', email: 'maria@email.com', perfil: 'Visitante' }, erro: null });

    expect(perfil).toBe('Visitante');
  });

  it('deve solicitar a redefinição e devolver a mensagem da API', () => {
    let mensagem: string | undefined;
    service.solicitarRedefinicaoSenha('maria@email.com').subscribe((m) => (mensagem = m));

    responderCsrf();
    const req = httpMock.expectOne('/api/conta/esqueci-senha');
    expect(req.request.body).toEqual({ email: 'maria@email.com' });
    req.flush({ sucesso: true, dados: 'Mensagem da API', erro: null });

    expect(mensagem).toBe('Mensagem da API');
  });

  it('deve enviar o token e a nova senha', () => {
    const dados = { token: 'abc', novaSenha: 'Senha123', confirmarSenha: 'Senha123' };
    service.redefinirSenha(dados).subscribe();

    responderCsrf();
    const req = httpMock.expectOne('/api/conta/redefinir-senha');
    expect(req.request.body).toEqual(dados);
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});

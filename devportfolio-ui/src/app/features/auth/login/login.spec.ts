import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { UsuarioAutenticado } from '../../../core/auth/auth.models';
import { AuthService } from '../../../core/auth/auth.service';
import { Login } from './login';

const USUARIO: UsuarioAutenticado = { id: 1, nome: 'Diogo', email: 'diogo@email.com', perfil: 'Administrador' };

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let elemento: HTMLElement;
  let authService: { login: ReturnType<typeof vi.fn> };
  let navegar: ReturnType<typeof vi.spyOn>;

  async function montar(url = '/'): Promise<void> {
    authService = { login: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    // Navega antes de criar o componente para simular o ?returnUrl= da URL.
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    navegar = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    fixture = TestBed.createComponent(Login);
    elemento = fixture.nativeElement;
    await fixture.whenStable();
  }

  function campo(seletor: string): HTMLInputElement {
    return elemento.querySelector<HTMLInputElement>(seletor)!;
  }

  function preencher(seletor: string, valor: string): void {
    campo(seletor).value = valor;
    campo(seletor).dispatchEvent(new Event('input'));
  }

  function preencherCredenciaisValidas(): void {
    preencher('#email', 'diogo@email.com');
    preencher('#senha', 'Senha@123');
  }

  async function enviar(): Promise<void> {
    elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function botaoEntrar(): HTMLButtonElement {
    return elemento.querySelector<HTMLButtonElement>('button[type=submit]')!;
  }

  function alerta(): string | undefined {
    return elemento.querySelector('[role=alert]')?.textContent?.trim();
  }

  it('deve criar o componente', async () => {
    await montar();

    expect(fixture.componentInstance).toBeTruthy();
    expect(elemento.querySelector('h1')?.textContent).toContain('Entrar na sua conta');
  });

  it('deve iniciar com o formulário vazio', async () => {
    await montar();

    expect(campo('#email').value).toBe('');
    expect(campo('#senha').value).toBe('');
    expect(campo('input[type=checkbox]').checked).toBe(false);
    expect(alerta()).toBeUndefined();
  });

  it('deve validar e-mail obrigatório e inválido', async () => {
    await montar();

    await enviar();
    expect(elemento.textContent).toContain('Informe seu e-mail.');
    expect(campo('#email').getAttribute('aria-invalid')).toBe('true');

    preencher('#email', 'email-invalido');
    await fixture.whenStable();
    expect(elemento.textContent).toContain('Informe um e-mail válido.');
  });

  it('deve validar senha obrigatória', async () => {
    await montar();
    preencher('#email', 'diogo@email.com');

    await enviar();

    expect(elemento.textContent).toContain('Informe sua senha.');
    expect(campo('#senha').getAttribute('aria-invalid')).toBe('true');
  });

  it('não deve chamar a API com formulário inválido', async () => {
    await montar();
    preencher('#email', 'email-invalido');

    await enviar();

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('deve chamar o serviço com as credenciais válidas', async () => {
    await montar();
    authService.login.mockReturnValue(of(USUARIO));
    preencherCredenciaisValidas();
    campo('input[type=checkbox]').click();

    await enviar();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'diogo@email.com',
      senha: 'Senha@123',
      lembrarDeMim: true,
    });
  });

  it('deve indicar carregamento durante a requisição', async () => {
    await montar();
    const resposta = new Subject<UsuarioAutenticado>();
    authService.login.mockReturnValue(resposta);
    preencherCredenciaisValidas();

    await enviar();

    expect(botaoEntrar().disabled).toBe(true);
    expect(botaoEntrar().getAttribute('aria-busy')).toBe('true');
    expect(botaoEntrar().textContent).toContain('Entrando...');

    resposta.next(USUARIO);
    resposta.complete();
    await fixture.whenStable();

    expect(botaoEntrar().disabled).toBe(false);
    expect(botaoEntrar().textContent).toContain('Entrar');
  });

  it('deve tratar credenciais incorretas', async () => {
    await montar();
    authService.login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    preencherCredenciaisValidas();

    await enviar();

    expect(alerta()).toBe('E-mail ou senha inválidos.');
    expect(navegar).not.toHaveBeenCalled();
    expect(botaoEntrar().disabled).toBe(false);
  });

  it('deve exibir a mensagem da API para usuário inativo', async () => {
    await montar();
    const erro = { sucesso: false, dados: null, erro: { codigo: 'USUARIO_INATIVO', mensagem: 'Usuário inativo.' } };
    authService.login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403, error: erro })));
    preencherCredenciaisValidas();

    await enviar();

    expect(alerta()).toBe('Usuário inativo.');
  });

  it('deve informar quando a API estiver indisponível', async () => {
    await montar();
    authService.login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    preencherCredenciaisValidas();

    await enviar();

    expect(alerta()).toContain('Não foi possível conectar ao servidor');
  });

  it('deve redirecionar para a área restrita após autenticação bem-sucedida', async () => {
    await montar();
    authService.login.mockReturnValue(of(USUARIO));
    preencherCredenciaisValidas();

    await enviar();

    expect(navegar).toHaveBeenCalledWith('/admin');
  });

  it('deve levar o visitante para a página inicial após o login', async () => {
    await montar();
    authService.login.mockReturnValue(of({ ...USUARIO, perfil: 'Visitante' }));
    preencherCredenciaisValidas();

    await enviar();

    expect(navegar).toHaveBeenCalledWith('/');
  });

  it('deve exibir aviso de conta criada', async () => {
    await montar('/?cadastro=ok');

    expect(elemento.querySelector('[role=status]')?.textContent).toContain('Conta criada!');
  });

  it('deve exibir aviso de senha redefinida', async () => {
    await montar('/?senha=redefinida');

    expect(elemento.querySelector('[role=status]')?.textContent).toContain('Senha redefinida!');
  });

  it('deve redirecionar para a página solicitada antes do login', async () => {
    await montar('/?returnUrl=%2Fadmin%2Fperfil');
    authService.login.mockReturnValue(of(USUARIO));
    preencherCredenciaisValidas();

    await enviar();

    expect(navegar).toHaveBeenCalledWith('/admin/perfil');
  });

  it('não deve redirecionar para outro site', async () => {
    await montar('/?returnUrl=%2F%2Fsite-malicioso.com');
    authService.login.mockReturnValue(of(USUARIO));
    preencherCredenciaisValidas();

    await enviar();

    expect(navegar).toHaveBeenCalledWith('/admin');
  });

  it('deve impedir submissões duplicadas', async () => {
    await montar();
    authService.login.mockReturnValue(new Subject<UsuarioAutenticado>());
    preencherCredenciaisValidas();

    await enviar();
    await enviar();

    expect(authService.login).toHaveBeenCalledTimes(1);
  });

  it('deve alternar a visibilidade da senha', async () => {
    await montar();
    expect(campo('#senha').type).toBe('password');

    elemento.querySelector<HTMLButtonElement>('.campo__acao')!.click();
    await fixture.whenStable();

    expect(campo('#senha').type).toBe('text');
  });
});

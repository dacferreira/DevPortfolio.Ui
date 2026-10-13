import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { UsuarioAutenticado } from '../../../core/auth/auth.models';
import { ContaService } from '../../../core/conta/conta.service';
import { Cadastro } from './cadastro';

const VISITANTE: UsuarioAutenticado = { id: 2, nome: 'Maria', email: 'maria@email.com', perfil: 'Visitante' };

describe('Cadastro', () => {
  let fixture: ComponentFixture<Cadastro>;
  let elemento: HTMLElement;
  let contaService: { registrar: ReturnType<typeof vi.fn> };
  let navegar: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    contaService = { registrar: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Cadastro],
      providers: [provideRouter([]), { provide: ContaService, useValue: contaService }],
    }).compileComponents();

    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(Cadastro);
    elemento = fixture.nativeElement;
    await fixture.whenStable();
  });

  function preencher(seletor: string, valor: string): void {
    const input = elemento.querySelector<HTMLInputElement>(seletor)!;
    input.value = valor;
    input.dispatchEvent(new Event('input'));
  }

  function preencherValido(): void {
    preencher('#nome', 'Maria');
    preencher('#email', 'maria@email.com');
    preencher('#senha', 'Senha123');
    preencher('#confirmarSenha', 'Senha123');
    elemento.querySelector<HTMLInputElement>('input[type=checkbox]')!.click();
  }

  async function enviar(): Promise<void> {
    elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('deve renderizar os textos da tela', () => {
    expect(elemento.querySelector('h1')?.textContent).toContain('Criar conta');
    expect(elemento.textContent).toContain('Junte-se à');
    expect(elemento.querySelector('h2 .destaque')?.textContent).toBe('Diogo.dev');
    expect(elemento.querySelector('a[href="/login"]')).toBeTruthy();
  });

  it('deve validar os campos obrigatórios sem chamar a API', async () => {
    await enviar();

    expect(elemento.textContent).toContain('Informe seu nome.');
    expect(elemento.textContent).toContain('Informe seu e-mail.');
    expect(elemento.textContent).toContain('Informe uma senha.');
    expect(elemento.textContent).toContain('Confirme sua senha.');
    expect(elemento.textContent).toContain('É preciso aceitar os termos');
    expect(contaService.registrar).not.toHaveBeenCalled();
  });

  it('deve exigir senha com letras e números', async () => {
    preencher('#senha', 'somenteletras');

    await enviar();

    expect(elemento.textContent).toContain('Use de 8 a 128 caracteres, com letras e números.');
  });

  it('deve avisar quando as senhas não conferem', async () => {
    preencherValido();
    preencher('#confirmarSenha', 'Outra1234');

    await enviar();

    expect(elemento.textContent).toContain('As senhas não conferem.');
    expect(contaService.registrar).not.toHaveBeenCalled();
  });

  it('deve criar a conta e levar ao login com aviso', async () => {
    contaService.registrar.mockReturnValue(of(VISITANTE));
    preencherValido();

    await enviar();

    expect(contaService.registrar).toHaveBeenCalledWith({
      nome: 'Maria',
      email: 'maria@email.com',
      senha: 'Senha123',
      confirmarSenha: 'Senha123',
      aceitouTermos: true,
    });
    expect(navegar).toHaveBeenCalledWith(['/login'], { queryParams: { cadastro: 'ok' } });
  });

  it('deve indicar carregamento e impedir envios duplicados', async () => {
    contaService.registrar.mockReturnValue(new Subject<UsuarioAutenticado>());
    preencherValido();

    await enviar();
    await enviar();

    const botao = elemento.querySelector<HTMLButtonElement>('button[type=submit]')!;
    expect(contaService.registrar).toHaveBeenCalledTimes(1);
    expect(botao.disabled).toBe(true);
    expect(botao.textContent).toContain('Criando conta...');
  });

  it('deve exibir a mensagem de e-mail já cadastrado', async () => {
    const erro = { sucesso: false, dados: null, erro: { codigo: 'EMAIL_JA_CADASTRADO', mensagem: 'Este e-mail já está cadastrado.' } };
    contaService.registrar.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409, error: erro })));
    preencherValido();

    await enviar();

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('Este e-mail já está cadastrado.');
    expect(navegar).not.toHaveBeenCalled();
  });
});

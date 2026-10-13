import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { ContaService } from '../../../core/conta/conta.service';
import { EsqueciSenha } from './esqueci-senha';

describe('EsqueciSenha', () => {
  let fixture: ComponentFixture<EsqueciSenha>;
  let elemento: HTMLElement;
  let contaService: { solicitarRedefinicaoSenha: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    contaService = { solicitarRedefinicaoSenha: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [EsqueciSenha],
      providers: [provideRouter([]), { provide: ContaService, useValue: contaService }],
    }).compileComponents();

    fixture = TestBed.createComponent(EsqueciSenha);
    elemento = fixture.nativeElement;
    await fixture.whenStable();
  });

  function preencherEmail(valor: string): void {
    const email = elemento.querySelector<HTMLInputElement>('#email')!;
    email.value = valor;
    email.dispatchEvent(new Event('input'));
  }

  async function enviar(): Promise<void> {
    elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('deve renderizar os textos da tela', () => {
    expect(elemento.querySelector('h1')?.textContent).toContain('Esqueci minha senha');
    expect(elemento.textContent).toContain('Não se preocupe!');
    expect(elemento.querySelector('a[href="/login"]')).toBeTruthy();
  });

  it('deve validar o e-mail sem chamar a API', async () => {
    await enviar();

    expect(elemento.textContent).toContain('Informe seu e-mail.');
    expect(contaService.solicitarRedefinicaoSenha).not.toHaveBeenCalled();
  });

  it('deve solicitar o link e exibir a confirmação da API', async () => {
    contaService.solicitarRedefinicaoSenha.mockReturnValue(of('Se o e-mail estiver cadastrado, você receberá um link.'));
    preencherEmail('maria@email.com');

    await enviar();

    expect(contaService.solicitarRedefinicaoSenha).toHaveBeenCalledWith('maria@email.com');
    expect(elemento.querySelector('[role=status]')?.textContent).toContain('você receberá um link');
  });

  it('deve indicar carregamento e impedir envios duplicados', async () => {
    contaService.solicitarRedefinicaoSenha.mockReturnValue(new Subject<string>());
    preencherEmail('maria@email.com');

    await enviar();
    await enviar();

    expect(contaService.solicitarRedefinicaoSenha).toHaveBeenCalledTimes(1);
    expect(elemento.querySelector<HTMLButtonElement>('button[type=submit]')!.disabled).toBe(true);
  });

  it('deve exibir a mensagem da API quando houver muitas tentativas', async () => {
    const erro = { sucesso: false, dados: null, erro: { codigo: 'MUITAS_TENTATIVAS', mensagem: 'Muitas tentativas.' } };
    contaService.solicitarRedefinicaoSenha.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 429, error: erro })));
    preencherEmail('maria@email.com');

    await enviar();

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('Muitas tentativas.');
  });
});

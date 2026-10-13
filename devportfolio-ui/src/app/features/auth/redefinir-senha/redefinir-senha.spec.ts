import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ContaService } from '../../../core/conta/conta.service';
import { RedefinirSenha } from './redefinir-senha';

describe('RedefinirSenha', () => {
  let fixture: ComponentFixture<RedefinirSenha>;
  let elemento: HTMLElement;
  let contaService: { redefinirSenha: ReturnType<typeof vi.fn> };
  let navegar: ReturnType<typeof vi.spyOn>;

  async function montar(url: string): Promise<void> {
    contaService = { redefinirSenha: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [RedefinirSenha],
      providers: [provideRouter([]), { provide: ContaService, useValue: contaService }],
    }).compileComponents();

    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(RedefinirSenha);
    elemento = fixture.nativeElement;
    await fixture.whenStable();
  }

  function preencher(seletor: string, valor: string): void {
    const input = elemento.querySelector<HTMLInputElement>(seletor)!;
    input.value = valor;
    input.dispatchEvent(new Event('input'));
  }

  async function enviar(): Promise<void> {
    elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('deve informar link inválido quando não há token', async () => {
    await montar('/');

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('inválido ou expirou');
    expect(elemento.querySelector('form')).toBeNull();
    expect(elemento.querySelector('a[href="/esqueci-senha"]')).toBeTruthy();
  });

  it('deve validar a nova senha e a confirmação', async () => {
    await montar('/?token=abc');
    preencher('#novaSenha', 'Senha123');
    preencher('#confirmarSenha', 'Outra1234');

    await enviar();

    expect(elemento.textContent).toContain('As senhas não conferem.');
    expect(contaService.redefinirSenha).not.toHaveBeenCalled();
  });

  it('deve enviar o token da URL e levar ao login com aviso', async () => {
    await montar('/?token=abc-123');
    contaService.redefinirSenha.mockReturnValue(of(undefined));
    preencher('#novaSenha', 'Senha123');
    preencher('#confirmarSenha', 'Senha123');

    await enviar();

    expect(contaService.redefinirSenha).toHaveBeenCalledWith({
      token: 'abc-123',
      novaSenha: 'Senha123',
      confirmarSenha: 'Senha123',
    });
    expect(navegar).toHaveBeenCalledWith(['/login'], { queryParams: { senha: 'redefinida' } });
  });

  it('deve tratar token expirado ou já utilizado', async () => {
    await montar('/?token=abc-123');
    const erro = { sucesso: false, dados: null, erro: { codigo: 'TOKEN_INVALIDO', mensagem: 'Link inválido.' } };
    contaService.redefinirSenha.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 400, error: erro })));
    preencher('#novaSenha', 'Senha123');
    preencher('#confirmarSenha', 'Senha123');

    await enviar();

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('inválido ou expirou');
    expect(navegar).not.toHaveBeenCalled();
  });
});

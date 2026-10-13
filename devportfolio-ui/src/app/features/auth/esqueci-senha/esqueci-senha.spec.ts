import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EsqueciSenha } from './esqueci-senha';

describe('EsqueciSenha', () => {
  let fixture: ComponentFixture<EsqueciSenha>;
  let elemento: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EsqueciSenha],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EsqueciSenha);
    elemento = fixture.nativeElement;
    await fixture.whenStable();
  });

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

  it('deve validar o e-mail', async () => {
    await enviar();

    expect(elemento.textContent).toContain('Informe seu e-mail.');
    expect(elemento.querySelector('[role=status]')).toBeNull();
  });

  it('deve informar que a recuperação ainda não está disponível', async () => {
    const email = elemento.querySelector<HTMLInputElement>('#email')!;
    email.value = 'diogo@email.com';
    email.dispatchEvent(new Event('input'));

    await enviar();

    expect(elemento.querySelector('[role=status]')?.textContent).toContain('ainda não está disponível');
  });
});

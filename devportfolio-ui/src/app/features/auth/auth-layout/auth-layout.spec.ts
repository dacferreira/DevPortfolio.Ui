import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthLayout } from './auth-layout';

@Component({
  imports: [AuthLayout],
  template: `<app-auth-layout titulo="Olá," destaque="Diogo!" texto="Texto de apoio"><p id="conteudo">Formulário</p></app-auth-layout>`,
})
class Hospedeiro {}

describe('AuthLayout', () => {
  it('deve exibir a apresentação, o logo e o conteúdo projetado', async () => {
    await TestBed.configureTestingModule({ imports: [Hospedeiro], providers: [provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(Hospedeiro);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('h2')?.textContent).toContain('Olá,');
    expect(elemento.querySelector('h2 .destaque')?.textContent).toBe('Diogo!');
    expect(elemento.textContent).toContain('Texto de apoio');
    expect(elemento.querySelector('.logo')?.textContent).toContain('Diogo.dev');
    expect(elemento.querySelector('#conteudo')).toBeTruthy();
  });
});

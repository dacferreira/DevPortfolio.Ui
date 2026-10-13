import { TestBed } from '@angular/core/testing';
import { AuthIlustracao } from './auth-ilustracao';

describe('AuthIlustracao', () => {
  it('deve renderizar a ilustração como elemento decorativo', () => {
    const fixture = TestBed.createComponent(AuthIlustracao);
    fixture.detectChanges();
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.getAttribute('aria-hidden')).toBe('true');
    expect(elemento.querySelector('svg')).toBeTruthy();
  });
});

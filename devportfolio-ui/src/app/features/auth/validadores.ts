import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

// Mesma regra da API (DevPortfolio.Application/Conta/Dtos/RegrasSenha.cs).
export const senhaForte: ValidatorFn = Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).{8,128}$/);

export const MENSAGEM_SENHA_FRACA = 'Use de 8 a 128 caracteres, com letras e números.';

// Validador de grupo: erro "senhasDiferentes" quando a confirmação foi preenchida e não confere.
export function senhasIguais(campoSenha: string, campoConfirmacao: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const senha = grupo.get(campoSenha)?.value;
    const confirmacao = grupo.get(campoConfirmacao)?.value;
    return confirmacao && senha !== confirmacao ? { senhasDiferentes: true } : null;
  };
}

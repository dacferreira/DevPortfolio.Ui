export interface RegistroRequest {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  aceitouTermos: boolean;
}

export interface RedefinirSenhaRequest {
  token: string;
  novaSenha: string;
  confirmarSenha: string;
}

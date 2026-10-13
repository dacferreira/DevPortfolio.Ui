export interface LoginRequest {
  email: string;
  senha: string;
  lembrarDeMim: boolean;
}

export interface UsuarioAutenticado {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
  lembrarDeMim: boolean;
}

// Perfis definidos na API (DevPortfolio.Domain/Enums/PerfilUsuario.cs).
export type Perfil = 'Administrador' | 'Visitante';

export interface UsuarioAutenticado {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
}

export function ehAdministrador(usuario: UsuarioAutenticado | null): boolean {
  return usuario?.perfil === 'Administrador';
}

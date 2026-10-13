import { HttpErrorResponse } from '@angular/common/http';

// Envelope padrão das respostas da API (DevPortfolio.API/Contracts/ApiResposta.cs).
export interface ApiResposta<T> {
  sucesso: boolean;
  dados: T | null;
  erro: ApiErro | null;
}

export interface ApiErro {
  codigo: string;
  mensagem: string;
  detalhes?: Record<string, string[]> | null;
}

// Mensagem de erro enviada pela API, quando a resposta segue o envelope padrão.
export function mensagemDeErro(erro: HttpErrorResponse): string | null {
  const corpo = erro.error as Partial<ApiResposta<unknown>> | null;
  return corpo?.erro?.mensagem ?? null;
}

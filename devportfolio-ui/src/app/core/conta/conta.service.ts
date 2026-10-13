import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UsuarioAutenticado } from '../auth/auth.models';
import { ApiResposta } from '../http/api-resposta';
import { RedefinirSenhaRequest, RegistroRequest } from './conta.models';

// Cadastro e recuperação de senha (API: /api/conta). Cada POST obtém antes o token anti-CSRF.
@Injectable({ providedIn: 'root' })
export class ContaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/conta`;

  registrar(dados: RegistroRequest): Observable<UsuarioAutenticado> {
    return this.comTokenCsrf(() => this.http.post<ApiResposta<UsuarioAutenticado>>(`${this.url}/registro`, dados)).pipe(
      map((resposta) => resposta.dados as UsuarioAutenticado),
    );
  }

  // A API responde igual para qualquer e-mail; a mensagem vem dela.
  solicitarRedefinicaoSenha(email: string): Observable<string> {
    return this.comTokenCsrf(() => this.http.post<ApiResposta<string>>(`${this.url}/esqueci-senha`, { email })).pipe(
      map((resposta) => resposta.dados ?? ''),
    );
  }

  redefinirSenha(dados: RedefinirSenhaRequest): Observable<void> {
    return this.comTokenCsrf(() => this.http.post<void>(`${this.url}/redefinir-senha`, dados));
  }

  private comTokenCsrf<T>(requisicao: () => Observable<T>): Observable<T> {
    return this.http.get<void>(`${environment.apiUrl}/auth/csrf`).pipe(switchMap(requisicao));
  }
}

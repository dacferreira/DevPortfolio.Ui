import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, firstValueFrom, map, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResposta } from '../http/api-resposta';
import { LoginRequest, UsuarioAutenticado } from './auth.models';

// A sessão fica num cookie HttpOnly emitido pela API: o front nunca vê nem guarda o token.
// O token anti-CSRF (cookie XSRF-TOKEN) é enviado no header X-XSRF-TOKEN pelo próprio HttpClient.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/auth`;

  private readonly usuarioAtual = signal<UsuarioAutenticado | null>(null);
  private verificacaoSessao: Promise<boolean> | null = null;

  readonly usuario = this.usuarioAtual.asReadonly();
  readonly autenticado = computed(() => this.usuarioAtual() !== null);

  // Consulta a API uma única vez por carregamento da aplicação.
  verificarSessao(): Promise<boolean> {
    this.verificacaoSessao ??= firstValueFrom(
      this.obterTokenCsrf().pipe(
        switchMap(() => this.http.get<ApiResposta<UsuarioAutenticado>>(`${this.url}/me`)),
        map((resposta) => resposta.dados),
        catchError(() => of(null)),
        tap((usuario) => this.usuarioAtual.set(usuario)),
        map((usuario) => usuario !== null),
      ),
    );
    return this.verificacaoSessao;
  }

  login(credenciais: LoginRequest): Observable<UsuarioAutenticado> {
    return this.obterTokenCsrf().pipe(
      switchMap(() => this.http.post<ApiResposta<UsuarioAutenticado>>(`${this.url}/login`, credenciais)),
      map((resposta) => resposta.dados as UsuarioAutenticado),
      tap((usuario) => this.definirSessao(usuario)),
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.url}/logout`, {}).pipe(finalize(() => this.definirSessao(null)));
  }

  // Usado quando a API informa que a sessão expirou.
  encerrarSessaoLocal(): void {
    this.definirSessao(null);
  }

  private definirSessao(usuario: UsuarioAutenticado | null): void {
    this.usuarioAtual.set(usuario);
    this.verificacaoSessao = Promise.resolve(usuario !== null);
  }

  private obterTokenCsrf(): Observable<void> {
    return this.http.get<void>(`${this.url}/csrf`);
  }
}

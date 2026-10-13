# DevPortfolio.Ui

Front-end do DevPortfolio em Angular 22 (standalone, SCSS, Vitest).

```
src/app/
├── core/       serviços globais (AuthService, guards, interceptor, envelope da API)
├── shared/     componentes reutilizáveis
├── features/   telas (auth/login, auth/esqueci-senha, home, admin)
└── layout/     estrutura de página
```

## Rotas

| Rota | Finalidade | Proteção |
|---|---|---|
| `/` | Página inicial pública | — |
| `/login` | Autenticação | `visitanteGuard` (usuário logado vai para `/admin` ou `/`, conforme o perfil) |
| `/esqueci-senha` | Recuperação de acesso | — |
| `/redefinir-senha` | Nova senha (link do e-mail, `?token=`) | — |
| `/cadastro` | Criar conta (perfil Visitante) | `visitanteGuard` |
| `/admin` | Área restrita | `adminGuard` (somente perfil Administrador) |

Os guards controlam apenas a navegação. A segurança dos dados fica na API, que valida a sessão em cada endpoint.

## Autenticação

- A sessão fica num cookie HttpOnly emitido pela API. O front não lê nem guarda tokens (nada em `localStorage`).
- Antes do login o `AuthService` chama `GET /api/auth/csrf`. O `HttpClient` envia o cookie `XSRF-TOKEN`
  no header `X-XSRF-TOKEN` em todo POST/PUT/PATCH/DELETE.
- Se um endpoint protegido responder 401, o `sessaoExpiradaInterceptor` encerra a sessão local e volta ao login.

## Ambiente

| Arquivo | `apiUrl` |
|---|---|
| `src/environments/environment.ts` (produção) | `/api` |
| `src/environments/environment.development.ts` | `/api`, encaminhado pelo `proxy.conf.json` para `http://localhost:5128` |

Front e API precisam estar na mesma origem (os cookies são SameSite=Strict e o token CSRF só é enviado em URLs relativas).
Em produção, sirva os dois no mesmo domínio.

## Comandos

```bash
npm start                                  # ng serve com proxy para a API
npm test                                   # testes (Vitest) em modo watch
npm run test:ci                            # testes uma vez, com cobertura (pasta coverage/)
npm run lint                               # ESLint (angular-eslint)
npx ng build --configuration production    # mesmo build do pipeline
```

O pipeline (`.github/workflows/ci.yml`) roda lint, testes com cobertura e o build de produção.

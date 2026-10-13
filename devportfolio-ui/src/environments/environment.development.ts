// Em desenvolvimento o ng serve encaminha /api para a API (proxy.conf.json),
// mantendo front e API na mesma origem para os cookies de sessão e CSRF.
export const environment = {
  production: false,
  apiUrl: '/api',
};

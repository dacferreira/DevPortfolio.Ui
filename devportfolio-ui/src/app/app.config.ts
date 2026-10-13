import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { sessaoExpiradaInterceptor } from './core/auth/sessao-expirada.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // O HttpClient já envia o cookie XSRF-TOKEN no header X-XSRF-TOKEN (proteção CSRF).
    provideHttpClient(withFetch(), withInterceptors([sessaoExpiradaInterceptor]))
  ]
};

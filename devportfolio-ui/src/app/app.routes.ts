import { Routes } from '@angular/router';
import { adminGuard, visitanteGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Diogo.dev',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'login',
    title: 'Entrar | Diogo.dev',
    canActivate: [visitanteGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'cadastro',
    title: 'Criar conta | Diogo.dev',
    canActivate: [visitanteGuard],
    loadComponent: () => import('./features/auth/cadastro/cadastro').then((m) => m.Cadastro),
  },
  {
    path: 'esqueci-senha',
    title: 'Esqueci minha senha | Diogo.dev',
    loadComponent: () => import('./features/auth/esqueci-senha/esqueci-senha').then((m) => m.EsqueciSenha),
  },
  {
    path: 'redefinir-senha',
    title: 'Redefinir senha | Diogo.dev',
    loadComponent: () => import('./features/auth/redefinir-senha/redefinir-senha').then((m) => m.RedefinirSenha),
  },
  {
    path: 'admin',
    title: 'Área restrita | Diogo.dev',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin').then((m) => m.Admin),
  },
  { path: '**', redirectTo: '' },
];

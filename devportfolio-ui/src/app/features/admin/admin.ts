import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';

// Área restrita (provisória): protegida pelo authGuard no front e pela sessão na API.
@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Admin {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly usuario = this.authService.usuario;
  protected readonly saindo = signal(false);

  protected sair(): void {
    if (this.saindo()) {
      return;
    }
    this.saindo.set(true);

    // A sessão local é encerrada mesmo se a API falhar.
    this.authService
      .logout()
      .pipe(finalize(() => this.router.navigateByUrl('/login')))
      .subscribe({ error: () => undefined });
  }
}

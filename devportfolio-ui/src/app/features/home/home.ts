import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ehAdministrador } from '../../core/auth/auth.models';
import { AuthService } from '../../core/auth/auth.service';

// Página inicial pública (provisória até a home do portfólio ser implementada).
@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private readonly authService = inject(AuthService);

  protected readonly usuario = this.authService.usuario;
  protected readonly administrador = computed(() => ehAdministrador(this.usuario()));

  ngOnInit(): void {
    void this.authService.verificarSessao();
  }

  protected sair(): void {
    this.authService.logout().subscribe({ error: () => undefined });
  }
}

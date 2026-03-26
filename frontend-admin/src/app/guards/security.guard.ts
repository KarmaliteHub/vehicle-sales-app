import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ConfigurationService, SecuritySettings } from '../services/configuration.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SecurityGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private configurationService: ConfigurationService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    return this.configurationService.getSecuritySettings().pipe(
      take(1),
      map((settings: SecuritySettings) => {
        const token = this.authService.getDecodedToken();
        if (!token) {
          return false;
        }

        const tokenExp = token.exp * 1000;
        const now = Date.now();

        // Verificar tiempo de sesión
        const sessionTimeout = settings.sessionTimeout * 60 * 1000;
        const lastActivity = localStorage.getItem('last_activity');

        if (lastActivity) {
          const lastActivityTime = parseInt(lastActivity, 10);
          if (now - lastActivityTime > sessionTimeout) {
            this.authService.logout();
            this.router.navigate(['/login']);
            return false;
          }
        }

        // Actualizar última actividad
        localStorage.setItem('last_activity', now.toString());

        // Verificar expiración de token
        if (tokenExp < now) {
          this.authService.refreshToken().subscribe({
            next: () => {
              return true;
            },
            error: () => {
              this.authService.logout();
              this.router.navigate(['/login']);
              return false;
            }
          });
        }

        return true;
      })
    );
  }
}

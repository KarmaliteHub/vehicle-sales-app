import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    console.log('🛡️ [AuthGuard] canActivate llamado');
    console.log('🛡️ [AuthGuard] Ruta solicitada:', state.url);

    const isLoggedIn = this.authService.isLoggedIn();
    console.log('🛡️ [AuthGuard] Usuario logueado?', isLoggedIn);

    if (isLoggedIn) {
      console.log('✅ [AuthGuard] Acceso permitido a:', state.url);
      return true;
    } else {
      console.log('❌ [AuthGuard] Acceso denegado, redirigiendo a login');
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }
}

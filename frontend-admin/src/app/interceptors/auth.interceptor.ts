import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log('🔌 [AuthInterceptor] Interceptando request:', req.url);
  console.log('🔌 [AuthInterceptor] Token presente:', !!token);

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('🔌 [AuthInterceptor] Token agregado al header Authorization');
  }

  return next(authReq).pipe(
    catchError((error) => {
      console.error('🔌 [AuthInterceptor] Error en request:', error.status, error.statusText);

      if (error.status === 401) {
        console.log('🔌 [AuthInterceptor] Error 401, intentando refrescar token');

        return authService.refreshToken().pipe(
          switchMap((response: any) => {
            console.log('🔌 [AuthInterceptor] Token refrescado exitosamente');
            const newToken = response.access;

            const clonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(clonedReq);
          }),
          catchError((refreshError) => {
            console.error('🔌 [AuthInterceptor] Error refrescando token:', refreshError);
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<any> {
    console.log('🔐 [AuthService] Intentando login con usuario:', username);
    console.log('🔐 [AuthService] API URL:', `${this.apiUrl}/token/`);

    return this.http.post(`${this.apiUrl}/token/`, { username, password }).pipe(
      tap((response: any) => {
        console.log('✅ [AuthService] Login exitoso. Response recibido:', response);
        console.log('✅ [AuthService] Access token:', response.access ? 'Presente' : 'No presente');
        console.log('✅ [AuthService] Refresh token:', response.refresh ? 'Presente' : 'No presente');

        if (response.access) {
          localStorage.setItem('access_token', response.access);
          console.log('✅ [AuthService] Access token guardado en localStorage');
        }
        if (response.refresh) {
          localStorage.setItem('refresh_token', response.refresh);
          console.log('✅ [AuthService] Refresh token guardado en localStorage');
        }

        this.isAuthenticatedSubject.next(true);
        console.log('✅ [AuthService] Estado de autenticación actualizado a true');
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ [AuthService] Error en login:');
        console.error('❌ Status:', error.status);
        console.error('❌ StatusText:', error.statusText);
        console.error('❌ Error completo:', error);

        if (error.error) {
          console.error('❌ Error body:', error.error);
        }

        return throwError(() => error);
      })
    );
  }

  register(userData: any): Observable<any> {
    console.log('📝 [AuthService] Intentando registrar usuario:', userData.username);

    return this.http.post(`${this.apiUrl}/register/`, userData).pipe(
      tap((response: any) => {
        console.log('✅ [AuthService] Registro exitoso:', response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ [AuthService] Error en registro:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    console.log('🚪 [AuthService] Cerrando sesión');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const token = localStorage.getItem('access_token');
    console.log('🔑 [AuthService] getToken llamado, token existe:', !!token);
    return token;
  }

  isLoggedIn(): boolean {
    const hasToken = this.hasToken();
    console.log('🔍 [AuthService] isLoggedIn:', hasToken);
    return hasToken;
  }

  private hasToken(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  getDecodedToken(): any {
    const token = this.getToken();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('🔓 [AuthService] Token decodificado:', decoded);
        return decoded;
      } catch (error) {
        console.error('❌ [AuthService] Error decodificando token:', error);
        return null;
      }
    }
    return null;
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    console.log('🔄 [AuthService] Refrescando token, refresh token existe:', !!refreshToken);

    return this.http.post(`${this.apiUrl}/token/refresh/`, { refresh: refreshToken }).pipe(
      tap((response: any) => {
        console.log('✅ [AuthService] Token refrescado exitosamente');
        if (response.access) {
          localStorage.setItem('access_token', response.access);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ [AuthService] Error refrescando token:', error);
        return throwError(() => error);
      })
    );
  }
}

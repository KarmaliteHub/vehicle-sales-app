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
    return this.http.post(`${this.apiUrl}/token/`, { username, password }).pipe(
      tap((response: any) => {
        if (response.access) {
          localStorage.setItem('access_token', response.access);
        }
        if (response.refresh) {
          localStorage.setItem('refresh_token', response.refresh);
        }
        this.isAuthenticatedSubject.next(true);
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, userData);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('last_activity');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getDecodedToken(): any {
    const token = this.getToken();
    if (token) {
      try {
        return jwtDecode(token);
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post(`${this.apiUrl}/token/refresh/`, { refresh: refreshToken }).pipe(
      tap((response: any) => {
        if (response.access) {
          localStorage.setItem('access_token', response.access);
        }
      })
    );
  }
}

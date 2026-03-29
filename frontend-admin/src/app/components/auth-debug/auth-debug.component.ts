import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-debug',
  // standalone: true, // COMENTAR O QUITAR ESTA LÍNEA
  // imports: [CommonModule], // QUITAR ESTA LÍNEA TAMBIÉN
  template: `
    <div style="padding: 20px; background: #1e1e1e; border-radius: 8px; margin: 20px; border: 1px solid #ff7700;">
      <h2 style="color: #ff7700;">🔧 Debug de Autenticación</h2>
      <div *ngIf="isLoggedIn; else notLoggedIn">
        <p style="color: #4caf50;">✅ Usuario autenticado</p>
        <p><strong>Token:</strong> {{ token ? 'Presente' : 'No presente' }}</p>
        <p><strong>Token decodificado:</strong></p>
        <pre style="background: #2d2d2d; padding: 10px; border-radius: 4px; overflow-x: auto;">{{ decodedToken | json }}</pre>
      </div>
      <ng-template #notLoggedIn>
        <p style="color: #f44336;">❌ Usuario NO autenticado</p>
      </ng-template>
      <div style="margin-top: 15px;">
        <button (click)="refresh()" style="margin-right: 10px; padding: 8px 16px; background: #ff7700; color: white; border: none; border-radius: 4px; cursor: pointer;">🔄 Actualizar</button>
        <button (click)="checkLocalStorage()" style="padding: 8px 16px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer;">📋 Ver LocalStorage</button>
        <button (click)="clearLocalStorage()" style="margin-left: 10px; padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">🗑️ Limpiar Storage</button>
      </div>
      <div *ngIf="localStorageData" style="margin-top: 15px;">
        <h3>LocalStorage:</h3>
        <pre style="background: #2d2d2d; padding: 10px; border-radius: 4px; overflow-x: auto;">{{ localStorageData | json }}</pre>
      </div>
    </div>
  `,
  styles: [`
    pre {
      font-size: 12px;
      max-height: 200px;
      overflow-y: auto;
    }
    button {
      cursor: pointer;
      transition: opacity 0.3s;
    }
    button:hover {
      opacity: 0.8;
    }
  `]
})
export class AuthDebugComponent implements OnInit {
  isLoggedIn = false;
  token: string | null = null;
  decodedToken: any = null;
  localStorageData: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.checkAuth();
  }

  checkAuth(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.token = this.authService.getToken();
    this.decodedToken = this.authService.getDecodedToken();
    console.log('🔧 [AuthDebug] isLoggedIn:', this.isLoggedIn);
    console.log('🔧 [AuthDebug] token:', this.token);
    console.log('🔧 [AuthDebug] decodedToken:', this.decodedToken);
  }

  refresh(): void {
    this.checkAuth();
  }

  checkLocalStorage(): void {
    this.localStorageData = {
      access_token: localStorage.getItem('access_token'),
      refresh_token: localStorage.getItem('refresh_token'),
      last_activity: localStorage.getItem('last_activity')
    };
    console.log('📋 [AuthDebug] LocalStorage:', this.localStorageData);

    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('📋 [AuthDebug] Payload del token:', payload);
          console.log('📋 [AuthDebug] Expira en:', new Date(payload.exp * 1000).toLocaleString());
          this.localStorageData.token_payload = payload;
          this.localStorageData.expires_at = new Date(payload.exp * 1000).toLocaleString();
        }
      } catch (e) {
        console.error('📋 [AuthDebug] Error decodificando token:', e);
      }
    }
  }

  clearLocalStorage(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('last_activity');
    console.log('🗑️ [AuthDebug] LocalStorage limpiado');
    this.localStorageData = null;
    this.checkAuth();
  }
}

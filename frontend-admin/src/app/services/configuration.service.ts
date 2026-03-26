import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer, of, BehaviorSubject } from 'rxjs';
import { retry, catchError, switchMap, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ApiService } from './api.service'; // Asegurar que ApiService está importado
import { environment } from '../../environments/environment';

// Interfaces TypeScript para tipos de configuración
export interface GeneralSettings {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  timezone: string;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  font: string;
  logo?: File;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  salesNotifications: boolean;
  inventoryNotifications: boolean;
  marketingNotifications: boolean;
  securityNotifications: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginAttempts: number;
}

export interface SystemConfiguration {
  id?: number;
  key: string;
  value: any;
  category: 'general' | 'appearance' | 'notifications' | 'security';
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  updated_by?: number;
}

export interface ConfigurationResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SystemConfiguration[];
}

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private apiUrl = environment.apiUrl;
  private maxRetries = 3;
  private retryDelay = 1000;
  private logoUrlSubject = new BehaviorSubject<string | null>(null);
  public logoUrl$ = this.logoUrlSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private apiService: ApiService  // Inyectar ApiService correctamente
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
          break;
        case 400:
          errorMessage = 'Datos inválidos. Verifica la información ingresada.';
          break;
        case 401:
          errorMessage = 'No autorizado. Por favor inicia sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          errorMessage = 'Configuración no encontrada.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. El equipo técnico ha sido notificado.';
          break;
        default:
          errorMessage = `Error del servidor: ${error.status}`;
      }
    }

    console.error('Configuration Service Error:', error);
    return throwError(() => new Error(errorMessage));
  };

  private retryWithBackoff<T>(source: Observable<T>): Observable<T> {
    return source.pipe(
      retry({
        count: this.maxRetries,
        delay: (error, retryCount) => {
          if (error.status === 0 || error.status >= 500) {
            return timer(this.retryDelay * retryCount);
          }
          return throwError(() => error);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Obtener todas las configuraciones
  getAllConfigurations(): Observable<ConfigurationResponse> {
    return this.retryWithBackoff(
      this.http.get<ConfigurationResponse>(`${this.apiUrl}/configurations/`, {
        headers: this.getHeaders()
      })
    );
  }

  // Obtener configuraciones por categoría
  getConfigurationsByCategory(category: string): Observable<SystemConfiguration[]> {
    return this.retryWithBackoff(
      this.http.get<SystemConfiguration[]>(`${this.apiUrl}/configurations/by_category/`, {
        headers: this.getHeaders(),
        params: { category }
      })
    ).pipe(
      map(response => {
        // La API devuelve directamente el array, no un objeto con results
        return Array.isArray(response) ? response : (response as any).results || [];
      })
    );
  }

  // Obtener una configuración específica
  getConfiguration(id: number): Observable<SystemConfiguration> {
    return this.retryWithBackoff(
      this.http.get<SystemConfiguration>(`${this.apiUrl}/configurations/${id}/`, {
        headers: this.getHeaders()
      })
    );
  }

  // Crear nueva configuración
  createConfiguration(config: Partial<SystemConfiguration>): Observable<SystemConfiguration> {
    return this.retryWithBackoff(
      this.http.post<SystemConfiguration>(`${this.apiUrl}/configurations/`, config, {
        headers: this.getHeaders()
      })
    );
  }

  // Actualizar configuración existente
  updateConfiguration(id: number, config: Partial<SystemConfiguration>): Observable<SystemConfiguration> {
    return this.retryWithBackoff(
      this.http.put<SystemConfiguration>(`${this.apiUrl}/configurations/${id}/`, config, {
        headers: this.getHeaders()
      })
    );
  }

  // Actualización masiva de configuraciones
  bulkUpdateConfigurations(configurations: Partial<SystemConfiguration>[]): Observable<any> {
    return this.retryWithBackoff(
      this.http.post(`${this.apiUrl}/configurations/bulk_update/`, {
        configurations
      }, {
        headers: this.getHeaders()
      })
    );
  }

  // Eliminar configuración
  deleteConfiguration(id: number): Observable<void> {
    return this.retryWithBackoff(
      this.http.delete<void>(`${this.apiUrl}/configurations/${id}/`, {
        headers: this.getHeaders()
      })
    );
  }

  // Métodos específicos para cada tipo de configuración

  // Configuraciones generales
  getGeneralSettings(): Observable<GeneralSettings> {
    return this.getConfigurationsByCategory('general').pipe(
      map((configs: SystemConfiguration[]) => {
        const settings: GeneralSettings = {
          companyName: 'KARMALITE Motors',
          email: 'info@karmalite.com',
          phone: '+1 (555) 123-4567',
          address: '123 Automotive Ave, Detroit, MI',
          currency: 'USD',
          timezone: 'America/New_York'
        };

        if (configs && Array.isArray(configs)) {
          configs.forEach(config => {
            if (config.key && config.key in settings) {
              (settings as any)[config.key] = config.value;
            }
          });
        }

        return settings;
      })
    );
  }

  saveGeneralSettings(settings: GeneralSettings): Observable<any> {
    const configurations = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      category: 'general' as const,
      description: `General setting: ${key}`
    }));

    return this.bulkUpdateConfigurations(configurations);
  }

  // Configuraciones de apariencia
  getAppearanceSettings(): Observable<AppearanceSettings> {
    return this.getConfigurationsByCategory('appearance').pipe(
      map((configs: SystemConfiguration[]) => {
        const settings: AppearanceSettings = {
          theme: 'dark',
          primaryColor: '#ff7700',
          secondaryColor: '#ffd700',
          font: 'Roboto'
        };

        if (configs && Array.isArray(configs)) {
          configs.forEach(config => {
            if (config.key && config.key in settings) {
              (settings as any)[config.key] = config.value;
            }
          });
        }

        return settings;
      })
    );
  }

  saveAppearanceSettings(settings: AppearanceSettings): Observable<any> {
    const configurations = Object.entries(settings)
      .filter(([key]) => key !== 'logo')
      .map(([key, value]) => ({
        key,
        value,
        category: 'appearance' as const,
        description: `Appearance setting: ${key}`
      }));

    return this.bulkUpdateConfigurations(configurations);
  }

  // Configuraciones de notificaciones
  getNotificationSettings(): Observable<NotificationSettings> {
    return this.getConfigurationsByCategory('notifications').pipe(
      map((configs: SystemConfiguration[]) => {
        const settings: NotificationSettings = {
          emailNotifications: true,
          salesNotifications: true,
          inventoryNotifications: true,
          marketingNotifications: true,
          securityNotifications: true
        };

        if (configs && Array.isArray(configs)) {
          configs.forEach(config => {
            if (config.key && config.key in settings) {
              (settings as any)[config.key] = config.value;
            }
          });
        }

        return settings;
      })
    );
  }

  saveNotificationSettings(settings: NotificationSettings): Observable<any> {
    const configurations = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      category: 'notifications' as const,
      description: `Notification setting: ${key}`
    }));

    return this.bulkUpdateConfigurations(configurations);
  }

  // Configuraciones de seguridad
  getSecuritySettings(): Observable<SecuritySettings> {
    return this.getConfigurationsByCategory('security').pipe(
      map((configs: SystemConfiguration[]) => {
        const settings: SecuritySettings = {
          twoFactorAuth: false,
          sessionTimeout: 30,
          passwordExpiry: 90,
          loginAttempts: 5
        };

        if (configs && Array.isArray(configs)) {
          configs.forEach(config => {
            if (config.key && config.key in settings) {
              (settings as any)[config.key] = config.value;
            }
          });
        }

        return settings;
      })
    );
  }

  saveSecuritySettings(settings: SecuritySettings): Observable<any> {
    const configurations = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      category: 'security' as const,
      description: `Security setting: ${key}`
    }));

    return this.bulkUpdateConfigurations(configurations);
  }

  // Métodos para logo
  loadLogo(): void {
    if (!this.apiService) {
      console.error('ApiService no está disponible');
      return;
    }

    this.apiService.getLogo().subscribe({
      next: (logos) => {
        if (logos && logos.length > 0) {
          const activeLogo = logos.find((logo: any) => logo.is_active);
          if (activeLogo && activeLogo.logo_url) {
            this.logoUrlSubject.next(activeLogo.logo_url);
          }
        }
      },
      error: (error) => {
        console.error('Error loading logo:', error);
      }
    });
  }

  getCurrentLogoUrl(): string | null {
    return this.logoUrlSubject.value;
  }
}

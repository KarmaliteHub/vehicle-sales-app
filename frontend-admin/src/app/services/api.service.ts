import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer, BehaviorSubject } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ApiErrorHandlerService } from './api-error-handler.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private baseUrl = environment.apiUrl.replace('/api', ''); // URL base sin /api

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private apiErrorHandler: ApiErrorHandlerService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private getFormDataHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    // Para FormData, no establecemos Content-Type, el navegador lo hará automáticamente
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Maneja errores HTTP con reintentos automáticos para errores de conexión
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('🚨 API Error:', error);

    // Si es un error de conexión, intentar reintentos
    if (this.apiErrorHandler.shouldRetry(error)) {
      console.log('🔄 Error de conexión detectado, se aplicarán reintentos automáticos');
      return throwError(() => error);
    }

    // Para otros errores, no reintentar
    return throwError(() => error);
  }

  /**
   * Ejecuta una petición HTTP con manejo de errores y reintentos
   */
  private executeRequest<T>(request: Observable<T>): Observable<T> {
    return request.pipe(
      retry({
        count: 3,
        delay: (error: HttpErrorResponse, retryCount: number) => {
          if (this.apiErrorHandler.shouldRetry(error)) {
            const delayTime = this.apiErrorHandler.getRetryDelay(retryCount - 1);
            console.log(`🔄 Reintentando en ${delayTime}ms (intento ${retryCount}/3)`);
            return timer(delayTime);
          }
          return throwError(() => error);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Método para construir URLs de imágenes completas - VERSIÓN CORREGIDA
  getImageUrl(imagePath: string): string {
    console.log('🖼️ API SERVICE - getImageUrl called with:', imagePath);

    if (!imagePath || imagePath === 'null' || imagePath === 'undefined' || imagePath === '') {
      console.log('🖼️ No image path, returning default');
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23333"%3E%3Cpath d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 8h-4v4h-4v-4H6V7h4V3h4v4h4v4z"%3E%3C/path%3E%3C/svg%3E';
    }

    // Ya es URL completa (http://, https://, data:image)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:image')) {
      console.log('🖼️ Already full URL:', imagePath);
      return imagePath;
    }

    // Caso especial para Cloudinary
    if (imagePath.includes('cloudinary.com')) {
      console.log('🖼️ Cloudinary URL:', imagePath);
      return imagePath;
    }

    // Ruta relativa - construir URL completa
    console.log('🖼️ Relative path detected:', imagePath);

    // Eliminar prefijos duplicados
    let cleanPath = imagePath;
    if (cleanPath.startsWith('/media/')) {
      cleanPath = cleanPath.substring(6); // Quitar '/media/'
    }
    if (cleanPath.startsWith('media/')) {
      cleanPath = cleanPath.substring(6); // Quitar 'media/'
    }

    // Construir URL completa
    const fullUrl = `${this.baseUrl}/media/${cleanPath}`;
    console.log('🖼️ Built full URL:', fullUrl);
    return fullUrl;
  }

  getLogo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/site-logo/`, { headers: this.getHeaders() });
  }

  uploadLogo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post(`${this.apiUrl}/site-logo/`, formData, {
      headers: this.getFormDataHeaders()
    });
  }

  deleteLogo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/site-logo/${id}/`, { headers: this.getHeaders() });
  }

  // Test notification
  sendTestNotification(): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-test-notification/`, {}, { headers: this.getHeaders() });
  }

  // Cars
  getCars(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cars/`, { headers: this.getHeaders() });
  }

  getCar(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/cars/${id}/`, { headers: this.getHeaders() });
  }

  createCar(car: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cars/`, car, { headers: this.getFormDataHeaders() });
  }

  updateCar(id: number, car: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/cars/${id}/`, car, { headers: this.getFormDataHeaders() });
  }

  deleteCar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cars/${id}/`, { headers: this.getHeaders() });
  }

  // Motorcycles
  getMotorcycles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/motorcycles/`, { headers: this.getHeaders() });
  }

  getMotorcycle(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/motorcycles/${id}/`, { headers: this.getHeaders() });
  }

  createMotorcycle(motorcycle: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/motorcycles/`, motorcycle, { headers: this.getFormDataHeaders() });
  }

  updateMotorcycle(id: number, motorcycle: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/motorcycles/${id}/`, motorcycle, { headers: this.getFormDataHeaders() });
  }

  deleteMotorcycle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/motorcycles/${id}/`, { headers: this.getHeaders() });
  }

  // Users
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/`, { headers: this.getHeaders() });
  }

  // Sales
  getSales(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sales/`, { headers: this.getHeaders() });
  }

  createSale(sale: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/sales/`, sale, { headers: this.getHeaders() });
  }

  getCarById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cars/${id}/`, { headers: this.getHeaders() });
  }

  getMotorcycleById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/motorcycles/${id}/`, { headers: this.getHeaders() });
  }

  // Settings
  updateSettings(settings: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/settings/`, settings, { headers: this.getHeaders() });
  }

  // Configurations - New methods for system configurations
  getConfigurations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/configurations/`, { headers: this.getHeaders() });
  }

  getConfigurationsByCategory(category: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/configurations/by_category/`, {
      headers: this.getHeaders(),
      params: { category }
    });
  }

  createConfiguration(config: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/configurations/`, config, { headers: this.getHeaders() });
  }

  updateConfiguration(id: number, config: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/configurations/${id}/`, config, { headers: this.getHeaders() });
  }

  bulkUpdateConfigurations(configurations: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/configurations/bulk_update/`, {
      configurations
    }, { headers: this.getHeaders() });
  }

  deleteConfiguration(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/configurations/${id}/`, { headers: this.getHeaders() });
  }

  // Contact Messages
  getContactMessages(): Observable<any> {
    return this.http.get(`${this.apiUrl}/contact-messages/`, { headers: this.getHeaders() });
  }

  updateContactMessage(id: number, data: any): Observable<any> {
    // Usar PATCH para actualizaciones parciales
    return this.http.patch(`${this.apiUrl}/contact-messages/${id}/`, data, { headers: this.getHeaders() });
  }

  deleteContactMessage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/contact-messages/${id}/`, { headers: this.getHeaders() });
  }


  // Subscribers
  getSubscribers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/subscribers/`, { headers: this.getHeaders() });
  }

  deleteSubscriber(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/subscribers/${id}/`, { headers: this.getHeaders() });
  }

  // Featured Items
  getFeaturedItems(): Observable<any> {
    const request = this.http.get(`${this.apiUrl}/featured/`, { headers: this.getHeaders() });
    return this.executeRequest(request);
  }

  createFeaturedItem(item: any): Observable<any> {
    const request = this.http.post(`${this.apiUrl}/featured/`, item, { headers: this.getHeaders() });
    return this.executeRequest(request);
  }

  deleteFeaturedItem(id: number): Observable<any> {
    const request = this.http.delete(`${this.apiUrl}/featured/${id}/`, { headers: this.getHeaders() });
    return this.executeRequest(request);
  }

  getAvailableCars(): Observable<any> {
    const request = this.http.get(`${this.apiUrl}/available-cars/`, { headers: this.getHeaders() });
    return this.executeRequest(request);
  }

  getAvailableMotorcycles(): Observable<any> {
    const request = this.http.get(`${this.apiUrl}/available-motorcycles/`, { headers: this.getHeaders() });
    return this.executeRequest(request);
  }

  // Discounts
  getDiscounts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/discounts/`, { headers: this.getHeaders() });
  }

  createDiscount(discount: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/discounts/`, discount, { headers: this.getHeaders() });
  }

  deleteDiscount(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/discounts/${id}/`, { headers: this.getHeaders() });
  }

  getAvailableCarsForDiscount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/available-cars-discount/`, { headers: this.getHeaders() });
  }

  getAvailableMotorcyclesForDiscount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/available-motorcycles-discount/`, { headers: this.getHeaders() });
  }
}

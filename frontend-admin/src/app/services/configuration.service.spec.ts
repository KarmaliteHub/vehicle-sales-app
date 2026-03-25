import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfigurationService, GeneralSettings, AppearanceSettings } from './configuration.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('ConfigurationService', () => {
  let service: ConfigurationService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ConfigurationService,
        { provide: AuthService, useValue: spy }
      ]
    });

    service = TestBed.inject(ConfigurationService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authServiceSpy.getToken.and.returnValue('mock-token');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all configurations', () => {
    const mockResponse = {
      count: 2,
      next: null,
      previous: null,
      results: [
        { id: 1, key: 'companyName', value: 'Test Company', category: 'general' as const },
        { id: 2, key: 'theme', value: 'dark', category: 'appearance' as const }
      ]
    };

    service.getAllConfigurations().subscribe(response => {
      expect(response.count).toBe(mockResponse.count);
      expect(response.results.length).toBe(2);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/configurations/`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    req.flush(mockResponse);
  });

  it('should get configurations by category', () => {
    const mockResponse = {
      count: 1,
      next: null,
      previous: null,
      results: [
        { id: 1, key: 'companyName', value: 'Test Company', category: 'general' as const }
      ]
    };

    service.getConfigurationsByCategory('general').subscribe(response => {
      expect(response.count).toBe(1);
      expect(response.results[0].category).toBe('general');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/configurations/by_category/?category=general`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should save general settings', () => {
    const settings: GeneralSettings = {
      companyName: 'Test Company',
      email: 'test@example.com',
      phone: '+1234567890',
      address: 'Test Address',
      currency: 'USD',
      timezone: 'America/New_York'
    };

    service.saveGeneralSettings(settings).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/configurations/bulk_update/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.configurations).toBeDefined();
    expect(req.request.body.configurations.length).toBe(6);
    req.flush({ success: true });
  });

  it('should handle errors gracefully', () => {
    service.getAllConfigurations().subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.message).toContain('Error interno del servidor');
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/configurations/`);
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle connection errors', () => {
    service.getAllConfigurations().subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.message).toContain('No se pudo conectar con el servidor');
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/configurations/`);
    req.error(new ErrorEvent('Network error'), { status: 0 });
  });

  it('should get general settings with defaults', () => {
    const mockResponse = {
      count: 2,
      next: null,
      previous: null,
      results: [
        { id: 1, key: 'companyName', value: 'Custom Company', category: 'general' as const },
        { id: 2, key: 'email', value: 'custom@example.com', category: 'general' as const }
      ]
    };

    service.getGeneralSettings().subscribe(settings => {
      expect(settings.companyName).toBe('Custom Company');
      expect(settings.email).toBe('custom@example.com');
      expect(settings.currency).toBe('USD'); // Default value
      expect(settings.timezone).toBe('America/New_York'); // Default value
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/configurations/by_category/?category=general`);
    req.flush(mockResponse);
  });

  it('should get appearance settings with defaults', () => {
    const mockResponse = {
      count: 1,
      next: null,
      previous: null,
      results: [
        { id: 1, key: 'theme', value: 'light', category: 'appearance' as const }
      ]
    };

    service.getAppearanceSettings().subscribe(settings => {
      expect(settings.theme).toBe('light');
      expect(settings.primaryColor).toBe('#ff7700'); // Default value
      expect(settings.font).toBe('Roboto'); // Default value
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/configurations/by_category/?category=appearance`);
    req.flush(mockResponse);
  });
});

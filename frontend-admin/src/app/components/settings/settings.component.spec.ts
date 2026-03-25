import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { SettingsComponent } from './settings.component';
import { ConfigurationService, GeneralSettings } from '../../services/configuration.service';
import { ApiService } from '../../services/api.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let mockConfigurationService: jasmine.SpyObj<ConfigurationService>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const mockGeneralSettings: GeneralSettings = {
    companyName: 'Test Company',
    email: 'test@example.com',
    phone: '+1234567890',
    address: 'Test Address',
    currency: 'USD',
    timezone: 'America/New_York'
  };

  beforeEach(async () => {
    const configSpy = jasmine.createSpyObj('ConfigurationService', [
      'getGeneralSettings',
      'getAppearanceSettings',
      'getNotificationSettings',
      'getSecuritySettings',
      'saveGeneralSettings',
      'saveAppearanceSettings',
      'saveNotificationSettings',
      'saveSecuritySettings'
    ]);
    const apiSpy = jasmine.createSpyObj('ApiService', ['updateSettings']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        SettingsComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ConfigurationService, useValue: configSpy },
        { provide: ApiService, useValue: apiSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    mockConfigurationService = TestBed.inject(ConfigurationService) as jasmine.SpyObj<ConfigurationService>;
    mockApiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    // Setup default mock returns
    mockConfigurationService.getGeneralSettings.and.returnValue(of(mockGeneralSettings));
    mockConfigurationService.getAppearanceSettings.and.returnValue(of({
      theme: 'dark',
      primaryColor: '#ff7700',
      secondaryColor: '#ffd700',
      font: 'Roboto'
    }));
    mockConfigurationService.getNotificationSettings.and.returnValue(of({
      emailNotifications: true,
      salesNotifications: true,
      inventoryNotifications: true,
      marketingNotifications: true,
      securityNotifications: true
    }));
    mockConfigurationService.getSecuritySettings.and.returnValue(of({
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAttempts: 5
    }));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all settings on init', () => {
    fixture.detectChanges();

    expect(mockConfigurationService.getGeneralSettings).toHaveBeenCalled();
    expect(mockConfigurationService.getAppearanceSettings).toHaveBeenCalled();
    expect(mockConfigurationService.getNotificationSettings).toHaveBeenCalled();
    expect(mockConfigurationService.getSecuritySettings).toHaveBeenCalled();
  });

  it('should populate general form with loaded settings', () => {
    fixture.detectChanges();

    expect(component.generalForm.get('companyName')?.value).toBe('Test Company');
    expect(component.generalForm.get('email')?.value).toBe('test@example.com');
    expect(component.generalForm.get('phone')?.value).toBe('+1234567890');
  });

  it('should call save method for general settings', () => {
    mockConfigurationService.saveGeneralSettings.and.returnValue(of({}));
    fixture.detectChanges();

    component.saveGeneralSettings();

    expect(mockConfigurationService.saveGeneralSettings).toHaveBeenCalled();
  });

  it('should validate form before saving', () => {
    fixture.detectChanges();

    // Make form invalid
    component.generalForm.patchValue({ email: 'invalid-email' });
    component.generalForm.get('email')?.setErrors({ email: true });

    component.saveGeneralSettings();

    expect(mockConfigurationService.saveGeneralSettings).not.toHaveBeenCalled();
  });

  it('should prevent multiple simultaneous saves', () => {
    mockConfigurationService.saveGeneralSettings.and.returnValue(of({}));
    fixture.detectChanges();

    component.isSavingGeneral = true;
    component.saveGeneralSettings();

    expect(mockConfigurationService.saveGeneralSettings).not.toHaveBeenCalled();
  });

  it('should reset forms when resetSettings is called', () => {
    fixture.detectChanges();

    spyOn(window, 'confirm').and.returnValue(true);

    component.resetSettings();

    expect(component.generalForm.get('companyName')?.value).toBe('KARMALITE Motors');
    expect(component.appearanceForm.get('theme')?.value).toBe('dark');
  });

  it('should not reset settings if user cancels', () => {
    fixture.detectChanges();
    const originalCompanyName = component.generalForm.get('companyName')?.value;

    spyOn(window, 'confirm').and.returnValue(false);

    component.resetSettings();

    expect(component.generalForm.get('companyName')?.value).toBe(originalCompanyName);
  });
});

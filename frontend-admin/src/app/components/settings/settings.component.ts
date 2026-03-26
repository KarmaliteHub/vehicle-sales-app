import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../services/api.service';
import {
  ConfigurationService,
  GeneralSettings,
  AppearanceSettings,
  NotificationSettings,
  SecuritySettings
} from '../../services/configuration.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    CommonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ]
})
export class SettingsComponent implements OnInit {
  generalForm: FormGroup;
  appearanceForm: FormGroup;
  notificationsForm: FormGroup;
  securityForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  // Estados de carga
  isLoadingGeneral = false;
  isLoadingAppearance = false;
  isLoadingNotifications = false;
  isLoadingSecurity = false;

  // Estados de guardado
  isSavingGeneral = false;
  isSavingAppearance = false;
  isSavingNotifications = false;
  isSavingSecurity = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private apiService: ApiService,
    private configurationService: ConfigurationService
  ) {
    this.generalForm = this.fb.group({
      companyName: ['KARMALITE Motors', Validators.required],
      email: ['info@karmalite.com', [Validators.required, Validators.email]],
      phone: ['+1 (555) 123-4567', Validators.required],
      address: ['123 Automotive Ave, Detroit, MI', Validators.required],
      currency: ['USD', Validators.required],
      timezone: ['America/New_York', Validators.required]
    });

    this.appearanceForm = this.fb.group({
      theme: ['dark', Validators.required],
      primaryColor: ['#ff7700', Validators.required],
      secondaryColor: ['#ffd700', Validators.required],
      font: ['Roboto', Validators.required],
      logo: ['']
    });

    this.notificationsForm = this.fb.group({
      emailNotifications: [true],
      salesNotifications: [true],
      inventoryNotifications: [true],
      marketingNotifications: [true],
      securityNotifications: [true]
    });

    this.securityForm = this.fb.group({
      twoFactorAuth: [false],
      sessionTimeout: [30, [Validators.min(5), Validators.max(120)]],
      passwordExpiry: [90, [Validators.min(30), Validators.max(365)]],
      loginAttempts: [5, [Validators.min(3), Validators.max(10)]]
    });
  }

  ngOnInit(): void {
    this.loadAllSettings();
  }

  loadAllSettings(): void {
    this.loadGeneralSettings();
    this.loadAppearanceSettings();
    this.loadNotificationSettings();
    this.loadSecuritySettings();
  }

  loadGeneralSettings(): void {
    this.isLoadingGeneral = true;
    this.configurationService.getGeneralSettings().subscribe({
      next: (settings: GeneralSettings) => {
        this.generalForm.patchValue(settings);
        this.isLoadingGeneral = false;
      },
      error: (error) => {
        console.error('Error cargando configuraciones generales:', error);
        this.showErrorMessage('Error al cargar configuraciones generales', error.message);
        this.isLoadingGeneral = false;
      }
    });
  }

  loadAppearanceSettings(): void {
    this.isLoadingAppearance = true;
    this.configurationService.getAppearanceSettings().subscribe({
      next: (settings: AppearanceSettings) => {
        this.appearanceForm.patchValue(settings);
        this.applyThemeChanges(settings.theme);
        this.isLoadingAppearance = false;
      },
      error: (error) => {
        console.error('Error cargando configuraciones de apariencia:', error);
        this.showErrorMessage('Error al cargar configuraciones de apariencia', error.message);
        this.isLoadingAppearance = false;
      }
    });
  }

  loadNotificationSettings(): void {
    this.isLoadingNotifications = true;
    this.configurationService.getNotificationSettings().subscribe({
      next: (settings: NotificationSettings) => {
        this.notificationsForm.patchValue(settings);
        this.isLoadingNotifications = false;
      },
      error: (error) => {
        console.error('Error cargando configuraciones de notificaciones:', error);
        this.showErrorMessage('Error al cargar configuraciones de notificaciones', error.message);
        this.isLoadingNotifications = false;
      }
    });
  }

  loadSecuritySettings(): void {
    this.isLoadingSecurity = true;
    this.configurationService.getSecuritySettings().subscribe({
      next: (settings: SecuritySettings) => {
        this.securityForm.patchValue(settings);
        this.isLoadingSecurity = false;
      },
      error: (error) => {
        console.error('Error cargando configuraciones de seguridad:', error);
        this.showErrorMessage('Error al cargar configuraciones de seguridad', error.message);
        this.isLoadingSecurity = false;
      }
    });
  }

  private applyThemeChanges(theme: string): void {
    // Aplicar cambios de tema inmediatamente
    const body = document.body;
    body.classList.remove('light-theme', 'dark-theme');

    if (theme === 'auto') {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
    } else {
      body.classList.add(`${theme}-theme`);
    }
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(title: string, details?: string): void {
    const message = details ? `${title}: ${details}` : title;
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadLogo(): void {
    if (this.selectedFile) {
      // Simular subida de archivo
      setTimeout(() => {
        this.snackBar.open('Logo actualizado correctamente', 'Cerrar', { duration: 3000 });
        this.selectedFile = null;
      }, 1000);
    }
  }

  saveGeneralSettings(): void {
    if (this.generalForm.valid && !this.isSavingGeneral) {
      this.isSavingGeneral = true;
      const settings: GeneralSettings = this.generalForm.value;

      this.configurationService.saveGeneralSettings(settings).subscribe({
        next: () => {
          this.showSuccessMessage('Configuración general guardada correctamente');
          // Recargar los settings para asegurar consistencia
          this.loadGeneralSettings();
          this.isSavingGeneral = false;
        },
        error: (error) => {
          console.error('Error guardando configuración general:', error);
          this.showErrorMessage('Error al guardar la configuración general', error.message);
          this.isSavingGeneral = false;
        }
      });
    } else if (!this.generalForm.valid) {
      this.showErrorMessage('Por favor, completa todos los campos requeridos');
    }
  }

  saveAppearanceSettings(): void {
    if (this.appearanceForm.valid && !this.isSavingAppearance) {
      this.isSavingAppearance = true;
      const settings: AppearanceSettings = this.appearanceForm.value;

      this.applyThemeChanges(settings.theme);

      this.configurationService.saveAppearanceSettings(settings).subscribe({
        next: () => {
          this.showSuccessMessage('Configuración de apariencia guardada correctamente');
          this.loadAppearanceSettings();
          this.isSavingAppearance = false;
        },
        error: (error) => {
          console.error('Error guardando configuración de apariencia:', error);
          this.showErrorMessage('Error al guardar la configuración de apariencia', error.message);
          this.isSavingAppearance = false;
        }
      });
    } else if (!this.appearanceForm.valid) {
      this.showErrorMessage('Por favor, completa todos los campos requeridos');
    }
  }

  saveNotificationSettings(): void {
    if (this.notificationsForm.valid && !this.isSavingNotifications) {
      this.isSavingNotifications = true;
      const settings: NotificationSettings = this.notificationsForm.value;

      this.configurationService.saveNotificationSettings(settings).subscribe({
        next: () => {
          this.showSuccessMessage('Configuración de notificaciones guardada correctamente');
          this.loadNotificationSettings();
          this.isSavingNotifications = false;
        },
        error: (error) => {
          console.error('Error guardando configuración de notificaciones:', error);
          this.showErrorMessage('Error al guardar la configuración de notificaciones', error.message);
          this.isSavingNotifications = false;
        }
      });
    }
  }

  saveSecuritySettings(): void {
    if (this.securityForm.valid && !this.isSavingSecurity) {
      this.isSavingSecurity = true;
      const settings: SecuritySettings = this.securityForm.value;

      if (settings.sessionTimeout < 5 || settings.sessionTimeout > 120) {
        this.showErrorMessage('El tiempo de sesión debe estar entre 5 y 120 minutos');
        this.isSavingSecurity = false;
        return;
      }

      if (settings.passwordExpiry < 30 || settings.passwordExpiry > 365) {
        this.showErrorMessage('La caducidad de contraseña debe estar entre 30 y 365 días');
        this.isSavingSecurity = false;
        return;
      }

      if (settings.loginAttempts < 3 || settings.loginAttempts > 10) {
        this.showErrorMessage('Los intentos de login deben estar entre 3 y 10');
        this.isSavingSecurity = false;
        return;
      }

      this.configurationService.saveSecuritySettings(settings).subscribe({
        next: () => {
          this.showSuccessMessage('Configuración de seguridad guardada correctamente');
          this.loadSecuritySettings();
          this.isSavingSecurity = false;
        },
        error: (error) => {
          console.error('Error guardando configuración de seguridad:', error);
          this.showErrorMessage('Error al guardar la configuración de seguridad', error.message);
          this.isSavingSecurity = false;
        }
      });
    } else if (!this.securityForm.valid) {
      this.showErrorMessage('Por favor, verifica que todos los valores estén dentro de los rangos permitidos');
    }
  }

  resetSettings(): void {
    if (confirm('¿Estás seguro de que quieres restablecer todas las configuraciones a sus valores predeterminados?')) {
      // Restablecer formularios a valores por defecto
      this.generalForm.reset({
        companyName: 'KARMALITE Motors',
        email: 'info@karmalite.com',
        phone: '+1 (555) 123-4567',
        address: '123 Automotive Ave, Detroit, MI',
        currency: 'USD',
        timezone: 'America/New_York'
      });

      this.appearanceForm.reset({
        theme: 'dark',
        primaryColor: '#ff7700',
        secondaryColor: '#ffd700',
        font: 'Roboto',
        logo: ''
      });

      this.notificationsForm.reset({
        emailNotifications: true,
        salesNotifications: true,
        inventoryNotifications: true,
        marketingNotifications: true,
        securityNotifications: true
      });

      this.securityForm.reset({
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordExpiry: 90,
        loginAttempts: 5
      });

      this.previewUrl = null;
      this.selectedFile = null;

      // Aplicar tema por defecto
      this.applyThemeChanges('dark');

      this.showSuccessMessage('Configuraciones restablecidas a valores por defecto');
    }
  }
}

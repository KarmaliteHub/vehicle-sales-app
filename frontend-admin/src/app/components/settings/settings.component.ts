import { Component, OnInit, Renderer2 } from '@angular/core';
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
  currentLogoUrl: string | null = null;

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
  isUploadingLogo = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private apiService: ApiService,
    private configurationService: ConfigurationService,
    private renderer: Renderer2
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
      font: ['Roboto', Validators.required]
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
    this.loadCurrentLogo();
    this.subscribeToThemeChanges();
    this.applyColorStyles();
  }

  loadCurrentLogo(): void {
    this.configurationService.loadLogo();
    this.configurationService.logoUrl$.subscribe(url => {
      this.currentLogoUrl = url;
    });
  }

  subscribeToThemeChanges(): void {
    this.appearanceForm.get('primaryColor')?.valueChanges.subscribe(() => {
      this.applyColorStyles();
    });
    this.appearanceForm.get('secondaryColor')?.valueChanges.subscribe(() => {
      this.applyColorStyles();
    });
  }

  applyColorStyles(): void {
    const primaryColor = this.appearanceForm.get('primaryColor')?.value || '#ff7700';
    const secondaryColor = this.appearanceForm.get('secondaryColor')?.value || '#ffd700';

    // Crear o obtener el elemento style
    const styleId = 'dynamic-theme-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement | null;

    if (!styleElement) {
      styleElement = this.renderer.createElement('style') as HTMLStyleElement;
      styleElement.id = styleId;
      this.renderer.appendChild(document.head, styleElement);
    }

    // Ahora styleElement definitivamente no es null porque lo hemos creado si no existía
    // Generar CSS dinámico
    const css = `
      /* Variables CSS globales */
      :root {
        --primary-color: ${primaryColor};
        --primary-color-rgb: ${this.hexToRgb(primaryColor)};
        --secondary-color: ${secondaryColor};
        --secondary-color-rgb: ${this.hexToRgb(secondaryColor)};
      }

      /* Botones principales */
      .mat-mdc-raised-button.mat-primary {
        background: linear-gradient(45deg, var(--primary-color), ${this.adjustColor(primaryColor, -20)}) !important;
      }

      .mat-mdc-raised-button.mat-primary:hover {
        background: linear-gradient(45deg, ${this.adjustColor(primaryColor, 20)}, var(--primary-color)) !important;
      }

      /* Texto con color primario */
      .mat-mdc-header-cell {
        color: var(--primary-color) !important;
      }

      /* Bordes y acentos */
      .mat-mdc-tab .mdc-tab-indicator__content--underline {
        border-color: var(--primary-color) !important;
      }

      .mat-mdc-tab-header-pagination-chevron {
        border-color: var(--primary-color);
      }

      /* Iconos y elementos interactivos */
      .mat-icon, .mat-mdc-icon-button {
        color: var(--primary-color);
      }

      /* Links y elementos destacados */
      a, .link-text {
        color: var(--primary-color);
      }

      a:hover, .link-text:hover {
        color: ${this.adjustColor(primaryColor, 20)};
      }

      /* Botones de acción */
      .add-button, .save-button {
        background: linear-gradient(45deg, var(--primary-color), ${this.adjustColor(primaryColor, -20)}) !important;
      }

      .add-button:hover, .save-button:hover {
        background: linear-gradient(45deg, ${this.adjustColor(primaryColor, 20)}, var(--primary-color)) !important;
      }

      /* Elementos destacados en tarjetas */
      .stat-card::before {
        background: linear-gradient(45deg, var(--primary-color), var(--secondary-color), var(--primary-color));
      }

      .stat-icon {
        border-color: var(--primary-color);
        box-shadow: 0 0 15px rgba(var(--primary-color-rgb), 0.3);
      }

      .stat-card:hover .stat-icon {
        box-shadow: 0 0 20px rgba(var(--primary-color-rgb), 0.5);
      }

      /* Spinners y elementos de carga */
      .mat-mdc-progress-spinner circle, .mat-mdc-spinner circle {
        stroke: var(--primary-color) !important;
      }

      /* Sliders y toggles */
      .mat-mdc-slide-toggle.mat-primary .mdc-switch__track::after {
        background-color: var(--primary-color) !important;
      }

      .mat-mdc-slide-toggle.mat-primary .mdc-switch__handle::after {
        background-color: var(--primary-color) !important;
      }

      /* Checkboxes */
      .mat-mdc-checkbox.mat-primary .mdc-checkbox__background {
        border-color: var(--primary-color) !important;
      }

      .mat-mdc-checkbox.mat-primary .mdc-checkbox__checkmark {
        color: var(--primary-color) !important;
      }

      /* Tablas */
      .mat-mdc-row:hover {
        background: rgba(var(--primary-color-rgb), 0.05) !important;
      }

      /* Barras de progreso */
      .mat-mdc-progress-bar .mdc-linear-progress__bar-inner {
        background-color: var(--primary-color) !important;
      }

      /* Scrollbar personalizado */
      ::-webkit-scrollbar-thumb {
        background: var(--primary-color);
      }

      ::-webkit-scrollbar-thumb:hover {
        background: ${this.adjustColor(primaryColor, 20)};
      }

      /* Borde inferior de títulos */
      .dashboard-container h1::after,
      .cars-container h1::after,
      .settings-container h1::after {
        background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
      }

      /* Menú lateral activo */
      .mat-list-item.active {
        border-left: 4px solid var(--primary-color);
      }

      .mat-list-item.active .mat-icon {
        color: var(--primary-color) !important;
      }

      /* Toolbar */
      .mat-toolbar.mat-primary {
        background: linear-gradient(90deg, #1a1a1a, var(--primary-color)) !important;
      }
    `;

    styleElement.textContent = css;

    // Aplicar fuente
    const font = this.appearanceForm.get('font')?.value || 'Roboto';
    document.body.style.fontFamily = `${font}, sans-serif`;
  }

  private hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
    }
    return '255, 119, 0';
  }

  private adjustColor(hex: string, percent: number): string {
    let r: number, g: number, b: number;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      r = parseInt(result[1], 16);
      g = parseInt(result[2], 16);
      b = parseInt(result[3], 16);

      r = Math.min(255, Math.max(0, r + (r * percent / 100)));
      g = Math.min(255, Math.max(0, g + (g * percent / 100)));
      b = Math.min(255, Math.max(0, b + (b * percent / 100)));

      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
    return hex;
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
        this.applyColorStyles();
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
    const body = document.body;
    body.classList.remove('light-theme', 'dark-theme');

    if (theme === 'auto') {
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
    if (file && this.isValidImageFile(file)) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.showErrorMessage('Archivo inválido', 'Solo se permiten imágenes JPG, PNG o SVG de hasta 2MB');
    }
  }

  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      return false;
    }

    if (file.size > maxSize) {
      return false;
    }

    return true;
  }

  uploadLogo(): void {
    if (this.selectedFile && !this.isUploadingLogo) {
      this.isUploadingLogo = true;

      this.apiService.uploadLogo(this.selectedFile).subscribe({
        next: (response) => {
          this.showSuccessMessage('Logo actualizado correctamente');
          this.configurationService.loadLogo();
          this.selectedFile = null;
          this.previewUrl = null;
          this.isUploadingLogo = false;
        },
        error: (error) => {
          console.error('Error uploading logo:', error);
          this.showErrorMessage('Error al subir el logo', error.message);
          this.isUploadingLogo = false;
        }
      });
    }
  }

  saveGeneralSettings(): void {
    if (this.generalForm.valid && !this.isSavingGeneral) {
      this.isSavingGeneral = true;
      const settings: GeneralSettings = this.generalForm.value;

      this.configurationService.saveGeneralSettings(settings).subscribe({
        next: () => {
          this.showSuccessMessage('Configuración general guardada correctamente');
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
      this.applyColorStyles();

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

  sendTestNotification(): void {
    this.apiService.sendTestNotification().subscribe({
      next: () => {
        this.showSuccessMessage('Notificación de prueba enviada correctamente');
      },
      error: (error) => {
        console.error('Error sending test notification:', error);
        this.showErrorMessage('Error al enviar notificación de prueba', error.error?.error);
      }
    });
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
        font: 'Roboto'
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

      this.applyThemeChanges('dark');
      this.applyColorStyles();

      this.showSuccessMessage('Configuraciones restablecidas a valores por defecto');
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    CommonModule
  ]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('🚀 [LoginComponent] Inicializado');
    console.log('🔍 [LoginComponent] Verificando si ya hay sesión activa');

    // Verificar si ya hay una sesión activa
    if (this.authService.isLoggedIn()) {
      console.log('✅ [LoginComponent] Ya hay sesión activa, redirigiendo a dashboard');
      this.router.navigate(['/dashboard']);
    } else {
      console.log('❌ [LoginComponent] No hay sesión activa');
    }
  }

  onSubmit(): void {
    console.log('📤 [LoginComponent] onSubmit llamado');
    console.log('📋 [LoginComponent] Formulario válido?', this.loginForm.valid);

    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { username, password } = this.loginForm.value;
      console.log('👤 [LoginComponent] Intentando login con usuario:', username);

      this.authService.login(username, password).subscribe({
        next: (response) => {
          console.log('✅ [LoginComponent] Login exitoso en el servicio');
          console.log('✅ [LoginComponent] Response completo:', response);

          this.isLoading = false;

          // Verificar que el token se guardó correctamente
          const token = this.authService.getToken();
          console.log('🔑 [LoginComponent] Token después de login:', token ? 'Presente' : 'No presente');

          if (token) {
            console.log('✅ [LoginComponent] Token guardado correctamente, redirigiendo...');

            // Pequeño delay para asegurar que el estado se actualice
            setTimeout(() => {
              console.log('🚀 [LoginComponent] Navegando a /dashboard');
              this.router.navigate(['/dashboard']).then(
                (success) => {
                  console.log('✅ [LoginComponent] Navegación exitosa:', success);
                  if (!success) {
                    console.error('❌ [LoginComponent] Falló la navegación a dashboard');
                    this.snackBar.open('Error al redirigir al dashboard', 'Cerrar', { duration: 3000 });
                  }
                },
                (error) => {
                  console.error('❌ [LoginComponent] Error en navegación:', error);
                }
              );
            }, 100);
          } else {
            console.error('❌ [LoginComponent] No se pudo obtener el token después del login');
            this.errorMessage = 'Error al guardar la sesión. Intente nuevamente.';
            this.snackBar.open('Error al guardar la sesión', 'Cerrar', { duration: 3000 });
          }
        },
        error: (error) => {
          console.error('❌ [LoginComponent] Error en login:');
          console.error('❌ Status:', error.status);
          console.error('❌ Error completo:', error);

          this.isLoading = false;

          // Mostrar mensaje de error más específico
          if (error.status === 401) {
            this.errorMessage = 'Usuario o contraseña incorrectos. Por favor, intente nuevamente.';
          } else if (error.status === 0) {
            this.errorMessage = 'Error de conexión. Verifique su conexión a internet.';
          } else {
            this.errorMessage = error.error?.message || error.error?.detail || 'Error al iniciar sesión. Por favor, intente nuevamente.';
          }

          this.snackBar.open(this.errorMessage, 'Cerrar', { duration: 5000 });
        }
      });
    } else {
      console.warn('⚠️ [LoginComponent] Formulario inválido');
      this.errorMessage = 'Por favor complete todos los campos.';

      // Mostrar qué campos son inválidos
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        if (control?.invalid) {
          console.warn(`⚠️ Campo inválido: ${key}`, control.errors);
        }
      });
    }
  }

  goToRegister(): void {
    console.log('📝 [LoginComponent] Navegando a registro');
    this.router.navigate(['/register']);
  }
}

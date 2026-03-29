import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend-admin';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    console.log('🚀 [App] Aplicación iniciada');
    console.log('🔑 [App] Token al inicio:', this.authService.getToken() ? 'PRESENTE' : 'AUSENTE');
    console.log('🔐 [App] Usuario autenticado:', this.authService.isLoggedIn());
  }
}

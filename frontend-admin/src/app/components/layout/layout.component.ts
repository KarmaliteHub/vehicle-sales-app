import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ConfigurationService } from '../../services/configuration.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatMenuModule
  ]
})
export class LayoutComponent implements OnInit {
  isSidenavOpen = true;
  marketingMenuOpen = false;
  companyName = 'KARMALITE';
  logoUrl: string | null = null;

  menuItems = [
    { name: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { name: 'Autos', icon: 'directions_car', route: '/cars' },
    { name: 'Motos', icon: 'two_wheeler', route: '/motorcycles' },
    { name: 'Clientes', icon: 'people', route: '/clients' },
    {
      name: 'Marketing',
      icon: 'campaign',
      children: [
        { name: 'Destacados', route: '/marketing/featured' },
        { name: 'Descuentos', route: '/marketing/discounts' }
      ]
    },
    { name: 'Configuraciones', icon: 'settings', route: '/settings' }
  ];

  constructor(
    private authService: AuthService,
    private configurationService: ConfigurationService
  ) {}

  ngOnInit(): void {
    this.loadCompanyName();
    this.loadLogo();
  }

  loadCompanyName(): void {
    this.configurationService.getGeneralSettings().subscribe({
      next: (settings) => {
        this.companyName = settings.companyName || 'KARMALITE';
      },
      error: (error) => {
        console.error('Error loading company name:', error);
      }
    });
  }

  loadLogo(): void {
    this.configurationService.logoUrl$.subscribe(url => {
      this.logoUrl = url;
    });
    this.configurationService.loadLogo();
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  toggleMarketingMenu(): void {
    this.marketingMenuOpen = !this.marketingMenuOpen;
  }

  logout(): void {
    this.authService.logout();
  }
}

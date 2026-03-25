import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ErrorMessageService } from '../../services/error-message.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-featured',
  templateUrl: './featured.component.html',
  styleUrls: ['./featured.component.css'],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    ImageUrlPipe // NUEVO
  ]
})
export class FeaturedComponent implements OnInit {
  featuredItems: any[] = [];
  cars: any[] = [];
  motorcycles: any[] = [];
  showSelectionPanel = false;
  isLoading = true;

  displayedColumns: string[] = ['image', 'title', 'type', 'price', 'actions'];

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private errorMessageService: ErrorMessageService
  ) {}

  ngOnInit(): void {
    this.loadFeaturedItems();
  }

  loadFeaturedItems(): void {
    this.isLoading = true;
    this.apiService.getFeaturedItems().subscribe({
      next: (response: any) => {
        console.log('⭐ FEATURED ITEMS DATA:', response);
        this.featuredItems = response;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading featured items:', error);
        this.errorMessageService.handleConnectionError(error);
        this.isLoading = false;
      }
    });
  }

  loadAvailableVehicles(): void {
    this.apiService.getAvailableCars().subscribe({
      next: (response: any) => {
        this.cars = response;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading available cars:', error);
        this.errorMessageService.handleConnectionError(error);
      }
    });

    this.apiService.getAvailableMotorcycles().subscribe({
      next: (response: any) => {
        this.motorcycles = response;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading available motorcycles:', error);
        this.errorMessageService.handleConnectionError(error);
      }
    });
  }

  openSelectionPanel(): void {
    this.loadAvailableVehicles();
    this.showSelectionPanel = true;
  }

  closeSelectionPanel(): void {
    this.showSelectionPanel = false;
  }

  addCarToFeatured(car: any): void {
    const featuredItem = {
      car: car.id,
      vehicle_type: 'car',
      title: `${car.brand} ${car.model} (${car.year})`,
      price: car.price,
      image_url: car.image_url
    };

    this.apiService.createFeaturedItem(featuredItem).subscribe({
      next: (response: any) => {
        this.errorMessageService.showSuccess('Auto agregado a destacados');
        this.loadFeaturedItems();
        this.closeSelectionPanel();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error adding car to featured:', error);
        this.errorMessageService.handleFeaturedItemError(error);
      }
    });
  }

  addMotorcycleToFeatured(motorcycle: any): void {
    const featuredItem = {
      motorcycle: motorcycle.id,
      vehicle_type: 'motorcycle',
      title: `${motorcycle.brand} ${motorcycle.model} (${motorcycle.year})`,
      price: motorcycle.price,
      image_url: motorcycle.image_url
    };

    this.apiService.createFeaturedItem(featuredItem).subscribe({
      next: (response: any) => {
        this.errorMessageService.showSuccess('Moto agregada a destacados');
        this.loadFeaturedItems();
        this.closeSelectionPanel();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error adding motorcycle to featured:', error);
        this.errorMessageService.handleFeaturedItemError(error);
      }
    });
  }

  removeFeaturedItem(item: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Eliminación',
        message: `¿Estás seguro de que quieres eliminar "${item.title}" de destacados?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.deleteFeaturedItem(item.id).subscribe({
          next: () => {
            this.errorMessageService.showSuccess('Elemento eliminado de destacados');
            this.loadFeaturedItems();
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error removing featured item:', error);
            this.errorMessageService.showError(error);
          }
        });
      }
    });
  }

  // Método para manejar errores de imagen
  onImageError(event: any): void {
    console.error('❌ Image failed to load:', event.target.src);
    event.target.src = 'assets/images/no-image.jpg';
    event.target.alt = 'Imagen no disponible';
  }
}

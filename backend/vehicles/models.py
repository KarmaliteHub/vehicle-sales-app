from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Car(models.Model):
    TRANSMISSION_CHOICES = [
        ('manual', 'Mecánico'),
        ('automatic', 'Automático'),
        ('electric', 'Eléctrico'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    color = models.CharField(max_length=50)
    engine = models.CharField(max_length=100)
    transmission = models.CharField(max_length=10, choices=TRANSMISSION_CHOICES)
    mileage = models.IntegerField()
    fuel_type = models.CharField(max_length=50)
    image = models.ImageField(upload_to='cars/')
    created_at = models.DateTimeField(default=timezone.now)
    is_sold = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.brand} {self.model} ({self.year})"
    
    def get_image_url(self):
        """Método para obtener la URL completa de la imagen"""
        if self.image:
            url = self.image.url
            # Si la URL no tiene protocolo, asegurar que tenga https://
            if url.startswith('//'):
                return f"https:{url}"
            # Si falta una barra después del dominio
            if 'res.cloudinary.com' in url and '://' in url:
                # Asegurar que la URL está bien formada
                parts = url.split('://')
                if len(parts) == 2:
                    domain_part = parts[1]
                    # Verificar si hay doble barra
                    if '//' in domain_part:
                        domain_part = domain_part.replace('//', '/')
                        return f"{parts[0]}://{domain_part}"
            return url
        return None

class Motorcycle(models.Model):
    CATEGORY_CHOICES = [
        ('combustion', 'Combustión'),
        ('electric', 'Eléctrico'),
        ('automatic', 'Automática'),
        ('semi_automatic', 'Semiautomática'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    color = models.CharField(max_length=50)
    engine = models.CharField(max_length=100)
    category = models.CharField(max_length=15, choices=CATEGORY_CHOICES)
    mileage = models.IntegerField()
    fuel_type = models.CharField(max_length=50)
    image = models.ImageField(upload_to='motorcycles/')
    created_at = models.DateTimeField(default=timezone.now)
    is_sold = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.brand} {self.model} ({self.year})"
    
    def get_image_url(self):
        """Método para obtener la URL completa de la imagen"""
        if self.image:
            url = self.image.url
            # Si la URL no tiene protocolo, asegurar que tenga https://
            if url.startswith('//'):
                return f"https:{url}"
            # Si falta una barra después del dominio
            if 'res.cloudinary.com' in url and '://' in url:
                # Asegurar que la URL está bien formada
                parts = url.split('://')
                if len(parts) == 2:
                    domain_part = parts[1]
                    # Verificar si hay doble barra
                    if '//' in domain_part:
                        domain_part = domain_part.replace('//', '/')
                        return f"{parts[0]}://{domain_part}"
            return url
        return None

class FeaturedItem(models.Model):
    VEHICLE_TYPE_CHOICES = [
        ('car', 'Auto'),
        ('motorcycle', 'Moto'),
    ]
    
    car = models.ForeignKey(Car, on_delete=models.CASCADE, null=True, blank=True)
    motorcycle = models.ForeignKey(Motorcycle, on_delete=models.CASCADE, null=True, blank=True)
    vehicle_type = models.CharField(max_length=10, choices=VEHICLE_TYPE_CHOICES)
    
    # Campos para almacenar los datos directamente
    title = models.CharField(max_length=200, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    image_url = models.CharField(max_length=500, blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                check=models.Q(car__isnull=False) | models.Q(motorcycle__isnull=False),
                name='featured_item_has_vehicle'
            ),
            models.CheckConstraint(
                check=~(models.Q(car__isnull=False) & models.Q(motorcycle__isnull=False)),
                name='featured_item_single_vehicle'
            ),
            models.UniqueConstraint(
                fields=['car'],
                condition=models.Q(car__isnull=False),
                name='unique_featured_car'
            ),
            models.UniqueConstraint(
                fields=['motorcycle'],
                condition=models.Q(motorcycle__isnull=False),
                name='unique_featured_motorcycle'
            ),
        ]
    
    def save(self, *args, **kwargs):
        # Llenar automáticamente los campos title, price e image_url al guardar
        if self.vehicle_type == 'car' and self.car:
            self.title = f"{self.car.brand} {self.car.model} ({self.car.year})"
            self.price = self.car.price
            if self.car.image:
                # Obtener la URL completa usando el método auxiliar
                self.image_url = self.car.get_image_url() or self.car.image.name
        elif self.vehicle_type == 'motorcycle' and self.motorcycle:
            self.title = f"{self.motorcycle.brand} {self.motorcycle.model} ({self.motorcycle.year})"
            self.price = self.motorcycle.price
            if self.motorcycle.image:
                # Obtener la URL completa usando el método auxiliar
                self.image_url = self.motorcycle.get_image_url() or self.motorcycle.image.name
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        if self.title:
            return f"Destacado: {self.title}"
        return "Destacado sin vehículo"

class Discount(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, null=True, blank=True)
    motorcycle = models.ForeignKey(Motorcycle, on_delete=models.CASCADE, null=True, blank=True)
    vehicle_type = models.CharField(max_length=10, choices=FeaturedItem.VEHICLE_TYPE_CHOICES)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    # Campos para almacenar los datos directamente
    title = models.CharField(max_length=200, blank=True)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    image_url = models.CharField(max_length=500, blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        # Llenar automáticamente los campos title, original_price e image_url al guardar
        if self.vehicle_type == 'car' and self.car:
            self.title = f"{self.car.brand} {self.car.model} ({self.car.year})"
            self.original_price = self.car.price
            if self.car.image:
                # Obtener la URL completa usando el método auxiliar
                self.image_url = self.car.get_image_url() or self.car.image.name
        elif self.vehicle_type == 'motorcycle' and self.motorcycle:
            self.title = f"{self.motorcycle.brand} {self.motorcycle.model} ({self.motorcycle.year})"
            self.original_price = self.motorcycle.price
            if self.motorcycle.image:
                # Obtener la URL completa usando el método auxiliar
                self.image_url = self.motorcycle.get_image_url() or self.motorcycle.image.name
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        vehicle_name = ""
        if self.vehicle_type == 'car' and self.car:
            vehicle_name = self.car.title
        elif self.vehicle_type == 'motorcycle' and self.motorcycle:
            vehicle_name = self.motorcycle.title
        
        return f"Descuento {self.discount_percentage}% - {vehicle_name}"

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    message = models.TextField()
    date = models.DateTimeField(default=timezone.now)
    is_read = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Mensaje de {self.name} - {self.date.strftime('%Y-%m-%d')}"

class Subscriber(models.Model):
    email = models.EmailField(unique=True)
    subscription_date = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.email

class SystemConfiguration(models.Model):
    CATEGORY_CHOICES = [
        ('general', 'General'),
        ('appearance', 'Apariencia'),
        ('notifications', 'Notificaciones'),
        ('security', 'Seguridad'),
    ]
    
    key = models.CharField(max_length=100, unique=True)
    value = models.JSONField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    class Meta:
        ordering = ['category', 'key']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['key']),
        ]
        
    def __str__(self):
        return f"{self.category}.{self.key}"

class SystemLog(models.Model):
    LOG_LEVELS = [
        ('DEBUG', 'Debug'),
        ('INFO', 'Info'),
        ('WARNING', 'Warning'),
        ('ERROR', 'Error'),
        ('CRITICAL', 'Critical'),
    ]
    
    level = models.CharField(max_length=10, choices=LOG_LEVELS)
    message = models.TextField()
    module = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    extra_data = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['level', 'timestamp']),
            models.Index(fields=['module', 'timestamp']),
        ]
        
    def __str__(self):
        return f"{self.level} - {self.module} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"

class SiteLogo(models.Model):
    """Modelo para almacenar el logo del sitio"""
    logo = models.ImageField(upload_to='logos/', null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Logo del Sitio'
        verbose_name_plural = 'Logos del Sitio'
    
    def __str__(self):
        return f"Logo {self.uploaded_at.strftime('%Y-%m-%d %H:%M')}"
    
    def get_logo_url(self):
        """Método para obtener la URL completa del logo"""
        if self.logo:
            url = self.logo.url
            if url.startswith('//'):
                return f"https:{url}"
            if 'res.cloudinary.com' in url and '://' in url:
                parts = url.split('://')
                if len(parts) == 2:
                    domain_part = parts[1]
                    if '//' in domain_part:
                        domain_part = domain_part.replace('//', '/')
                        return f"{parts[0]}://{domain_part}"
            return url
        return None
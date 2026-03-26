from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, permission_classes, action
from django.contrib.auth.models import User
from django.db.models import Q
from .models import Car, Motorcycle, ContactMessage, Subscriber, FeaturedItem, Discount, SystemConfiguration, SystemLog, SiteLogo
from .serializers import (
    CarSerializer, 
    MotorcycleSerializer, 
    UserSerializer, 
    ContactMessageSerializer,
    SubscriberSerializer,
    FeaturedItemSerializer,
    DiscountSerializer,
    SystemConfigurationSerializer,
    SystemLogSerializer,
    SiteLogoSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken
import csv
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_subscribers(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="suscriptores.csv"'
    
    subscribers = Subscriber.objects.all().order_by('-subscription_date')
    
    writer = csv.writer(response)
    writer.writerow(['Email', 'Fecha de Suscripción', 'Estado'])
    
    for subscriber in subscribers:
        writer.writerow([
            subscriber.email,
            subscriber.subscription_date.strftime('%Y-%m-%d %H:%M'),
            'Activo' if subscriber.is_active else 'Inactivo'
        ])
    
    return response

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            password=request.data.get('password')
        )
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': serializer.data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class CarListCreateView(generics.ListCreateAPIView):
    queryset = Car.objects.all().order_by('-created_at')
    serializer_class = CarSerializer
    parser_classes = [MultiPartParser, FormParser]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class CarDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Guardar estado anterior
        was_sold = instance.is_sold
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Si el estado cambió a vendido, enviar notificación
        if not was_sold and instance.is_sold:
            send_vehicle_sold_notification(instance, 'car', request.user)
        
        return Response(serializer.data)

class MotorcycleListCreateView(generics.ListCreateAPIView):
    queryset = Motorcycle.objects.all().order_by('-created_at')
    serializer_class = MotorcycleSerializer
    parser_classes = [MultiPartParser, FormParser]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class MotorcycleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Motorcycle.objects.all()
    serializer_class = MotorcycleSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Guardar estado anterior
        was_sold = instance.is_sold
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Si el estado cambió a vendido, enviar notificación
        if not was_sold and instance.is_sold:
            send_vehicle_sold_notification(instance, 'motorcycle', request.user)
        
        return Response(serializer.data)

class SearchView(generics.ListAPIView):
    serializer_class = CarSerializer
    
    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        vehicle_type = self.request.query_params.get('type', 'all')
        
        if vehicle_type == 'cars' or vehicle_type == 'all':
            cars = Car.objects.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(brand__icontains=query) |
                Q(model__icontains=query)
            )
        
        if vehicle_type == 'motorcycles' or vehicle_type == 'all':
            motorcycles = Motorcycle.objects.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(brand__icontains=query) |
                Q(model__icontains=query)
            )
        
        if vehicle_type == 'all':
            return cars
        elif vehicle_type == 'cars':
            return cars
        elif vehicle_type == 'motorcycles':
            return motorcycles
        
        return Car.objects.none()

class ContactMessageListCreateView(generics.ListCreateAPIView):
    queryset = ContactMessage.objects.all().order_by('-date')
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class ContactMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        """Actualizar mensaje de contacto (especialmente para marcar como leído)"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Crear un diccionario con los datos a actualizar
        update_data = {}
        
        # Si viene 'is_read' en los datos, actualizarlo
        if 'is_read' in request.data:
            update_data['is_read'] = request.data['is_read']
        
        # Si viene 'message' en los datos, actualizarlo también
        if 'message' in request.data:
            update_data['message'] = request.data['message']
        
        # Actualizar solo los campos proporcionados
        serializer = self.get_serializer(instance, data=update_data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)

class SubscriberListCreateView(generics.ListCreateAPIView):
    queryset = Subscriber.objects.all().order_by('-subscription_date')
    serializer_class = SubscriberSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class SubscriberDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subscriber.objects.all()
    serializer_class = SubscriberSerializer

class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer

# Featured Items Views
class FeaturedItemListCreateView(generics.ListCreateAPIView):
    serializer_class = FeaturedItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        # Optimizar queries con select_related y prefetch_related
        return FeaturedItem.objects.select_related(
            'created_by', 'car', 'motorcycle'
        ).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class FeaturedItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FeaturedItem.objects.all()
    serializer_class = FeaturedItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class AvailableCarsListView(generics.ListAPIView):
    serializer_class = CarSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        # Excluir autos que ya están destacados con optimización de queries
        featured_car_ids = FeaturedItem.objects.filter(
            vehicle_type='car'
        ).exclude(car__isnull=True).values_list('car_id', flat=True)
        
        return Car.objects.select_related('created_by').exclude(
            id__in=featured_car_ids
        ).order_by('-created_at')

class AvailableMotorcyclesListView(generics.ListAPIView):
    serializer_class = MotorcycleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        # Excluir motos que ya están destacadas con optimización de queries
        featured_motorcycle_ids = FeaturedItem.objects.filter(
            vehicle_type='motorcycle'
        ).exclude(motorcycle__isnull=True).values_list('motorcycle_id', flat=True)
        
        return Motorcycle.objects.select_related('created_by').exclude(
            id__in=featured_motorcycle_ids
        ).order_by('-created_at')

# Discount Views
class DiscountListCreateView(generics.ListCreateAPIView):
    queryset = Discount.objects.all().order_by('-created_at')
    serializer_class = DiscountSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class DiscountDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Discount.objects.all()
    serializer_class = DiscountSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class AvailableCarsForDiscountListView(generics.ListAPIView):
    serializer_class = CarSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        # Excluir autos que ya tienen descuento activo
        discounted_car_ids = Discount.objects.filter(
            vehicle_type='car',
            is_active=True
        ).exclude(car__isnull=True).values_list('car_id', flat=True)
        
        return Car.objects.exclude(id__in=discounted_car_ids).order_by('-created_at')

class AvailableMotorcyclesForDiscountListView(generics.ListAPIView):
    serializer_class = MotorcycleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        # Excluir motos que ya tienen descuento activo
        discounted_motorcycle_ids = Discount.objects.filter(
            vehicle_type='motorcycle',
            is_active=True
        ).exclude(motorcycle__isnull=True).values_list('motorcycle_id', flat=True)
        
        return Motorcycle.objects.exclude(id__in=discounted_motorcycle_ids).order_by('-created_at')

# Configuration Views
class SystemConfigurationViewSet(viewsets.ModelViewSet):
    queryset = SystemConfiguration.objects.all()
    serializer_class = SystemConfigurationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get configurations by category"""
        category = request.query_params.get('category')
        if category:
            configurations = self.queryset.filter(category=category, is_active=True)
            serializer = self.get_serializer(configurations, many=True)
            return Response(serializer.data)
        return Response({'error': 'Category parameter is required'}, status=400)
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Update multiple configurations at once"""
        configurations_data = request.data.get('configurations', [])
        updated_configs = []
        
        for config_data in configurations_data:
            config_key = config_data.get('key')
            if config_key:
                # Buscar por key, no por id
                config = SystemConfiguration.objects.filter(key=config_key).first()
                if config:
                    config.value = config_data.get('value', config.value)
                    config.category = config_data.get('category', config.category)
                    config.description = config_data.get('description', config.description)
                    config.updated_by = request.user
                    config.save()
                    updated_configs.append(config)
                else:
                    # Si no existe, crearlo
                    config = SystemConfiguration.objects.create(
                        key=config_key,
                        value=config_data.get('value', {}),
                        category=config_data.get('category', 'general'),
                        description=config_data.get('description', ''),
                        updated_by=request.user
                    )
                    updated_configs.append(config)
        
        serializer = self.get_serializer(updated_configs, many=True)
        return Response(serializer.data)

class SystemLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SystemLog.objects.all()
    serializer_class = SystemLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        level = self.request.query_params.get('level')
        module = self.request.query_params.get('module')
        
        if level:
            queryset = queryset.filter(level=level)
        if module:
            queryset = queryset.filter(module=module)
            
        return queryset.order_by('-timestamp')


class SiteLogoViewSet(viewsets.ModelViewSet):
    queryset = SiteLogo.objects.filter(is_active=True)
    serializer_class = SiteLogoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SiteLogo.objects.filter(is_active=True).order_by('-uploaded_at')
    
    def perform_create(self, serializer):
        # Desactivar logos anteriores
        SiteLogo.objects.filter(is_active=True).update(is_active=False)
        serializer.save(uploaded_by=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(uploaded_by=self.request.user)

# Agregar función para enviar notificaciones
def send_vehicle_sold_notification(vehicle, vehicle_type, user=None):
    """Envía notificaciones cuando un vehículo es marcado como vendido"""
    try:
        # Obtener configuraciones
        email_notifications = SystemConfiguration.objects.filter(
            key='email_notifications', 
            is_active=True
        ).first()
        
        sales_notifications = SystemConfiguration.objects.filter(
            key='sales_notifications',
            is_active=True
        ).first()
        
        if not email_notifications or not email_notifications.value.get('enabled', False):
            return
        
        if not sales_notifications or not sales_notifications.value.get('enabled', False):
            return
        
        # Obtener email de contacto
        contact_email_config = SystemConfiguration.objects.filter(
            key='contact_email',
            is_active=True
        ).first()
        
        to_email = contact_email_config.value.get('email') if contact_email_config else settings.DEFAULT_FROM_EMAIL
        
        # Preparar asunto y mensaje
        subject = f'Vehículo Vendido: {vehicle.title}'
        
        context = {
            'vehicle': vehicle,
            'vehicle_type': vehicle_type,
            'user': user,
            'title': vehicle.title,
            'price': vehicle.price,
            'brand': vehicle.brand,
            'model': vehicle.model,
            'year': vehicle.year,
            'date': timezone.now()
        }
        
        html_message = render_to_string('emails/vehicle_sold.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [to_email],
            html_message=html_message,
            fail_silently=False
        )
        
        # Registrar en logs
        SystemLog.objects.create(
            level='INFO',
            message=f'Notificación de venta enviada para {vehicle.title}',
            module='vehicles.views',
            user=user,
            extra_data={'vehicle_id': vehicle.id, 'vehicle_type': vehicle_type}
        )
        
    except Exception as e:
        SystemLog.objects.create(
            level='ERROR',
            message=f'Error al enviar notificación de venta: {str(e)}',
            module='vehicles.views',
            user=user,
            extra_data={'vehicle_id': vehicle.id, 'vehicle_type': vehicle_type}
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_test_notification(request):
    """Endpoint para probar notificaciones"""
    try:
        # Obtener configuraciones
        email_notifications = SystemConfiguration.objects.filter(
            key='email_notifications', 
            is_active=True
        ).first()
        
        sales_notifications = SystemConfiguration.objects.filter(
            key='sales_notifications',
            is_active=True
        ).first()
        
        if not email_notifications or not email_notifications.value.get('enabled', False):
            return Response({
                'error': 'Notificaciones por email desactivadas'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not sales_notifications or not sales_notifications.value.get('enabled', False):
            return Response({
                'error': 'Notificaciones de ventas desactivadas'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Obtener email de contacto
        contact_email_config = SystemConfiguration.objects.filter(
            key='contact_email',
            is_active=True
        ).first()
        
        to_email = contact_email_config.value.get('email') if contact_email_config else settings.DEFAULT_FROM_EMAIL
        
        send_mail(
            'Prueba de Notificación - KARMALITE',
            'Esta es una notificación de prueba para verificar que el sistema de correos funciona correctamente.',
            settings.DEFAULT_FROM_EMAIL,
            [to_email],
            fail_silently=False
        )
        
        return Response({'message': 'Notificación de prueba enviada correctamente'})
        
    except Exception as e:
        return Response({
            'error': f'Error al enviar notificación: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Car, Motorcycle, ContactMessage, Subscriber, FeaturedItem, Discount, SystemConfiguration, SystemLog, SiteLogo

def clean_cloudinary_url(url):
    """Limpia URLs de Cloudinary"""
    if not url:
        return None
    
    # Corregir https:///res.cloudinary.com -> https://res.cloudinary.com
    if 'https:///' in url and 'cloudinary.com' in url:
        url = url.replace('https:///', 'https://')
    
    # Corregir res.cloudinary.com// -> res.cloudinary.com/
    if 'cloudinary.com//' in url:
        url = url.replace('cloudinary.com//', 'cloudinary.com/')
    
    return url

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined']
        read_only_fields = ['date_joined']

class SystemConfigurationSerializer(serializers.ModelSerializer):
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = SystemConfiguration
        fields = ['id', 'key', 'value', 'category', 'description', 'is_active', 
                 'created_at', 'updated_at', 'updated_by']
        read_only_fields = ['created_at', 'updated_at', 'updated_by']

class SystemLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = SystemLog
        fields = ['id', 'level', 'message', 'module', 'user', 'ip_address', 
                 'timestamp', 'extra_data']
        read_only_fields = ['timestamp']

class CarSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Car
        fields = '__all__'
        extra_kwargs = {
            'image': {'required': False},
            'is_sold': {'required': False}
        }
    
    def get_image_url(self, obj):
        url = obj.get_image_url()
        return clean_cloudinary_url(url)
    
    def update(self, instance, validated_data):
        image = validated_data.pop('image', None)
        if image:
            instance.image = image
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class MotorcycleSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Motorcycle
        fields = '__all__'
        extra_kwargs = {
            'image': {'required': False},
            'is_sold': {'required': False}
        }
    
    def get_image_url(self, obj):
        if obj.image:
            url = obj.image.url
            
            # Corregir URLs malformadas
            if url.startswith('https:/') and 'res.cloudinary.com' in url:
                # Reemplazar 'https:/' con 'https://'
                url = url.replace('https:/', 'https://', 1)
            
            # Si la URL tiene doble barra después del dominio
            if 'res.cloudinary.com' in url and '://' in url:
                parts = url.split('://')
                if len(parts) == 2:
                    domain_part = parts[1]
                    if '//' in domain_part:
                        domain_part = domain_part.replace('//', '/')
                        url = f"{parts[0]}://{domain_part}"
            
            # Si ya es una URL absoluta (http:// o https://), devolverla directamente
            if url.startswith('http://') or url.startswith('https://'):
                return url
            
            # Si es una URL relativa, construir la URL absoluta
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(url)
            return url
        return None
    
    def update(self, instance, validated_data):
        # Manejar actualización de imagen
        image = validated_data.pop('image', None)
        if image:
            instance.image = image
        # Actualizar otros campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class FeaturedItemSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = FeaturedItem
        fields = ['id', 'car', 'motorcycle', 'vehicle_type', 'created_at', 'title', 'image_url', 'price', 'type']
    
    def get_type(self, obj):
        return 'Auto' if obj.vehicle_type == 'car' else 'Moto'
    
    def get_image_url(self, obj):
        if obj.image_url:
            url = obj.image_url
            
            # Corregir URLs malformadas
            if url.startswith('https:/') and 'res.cloudinary.com' in url:
                url = url.replace('https:/', 'https://', 1)
            
            # Verificar si ya es una URL completa de Cloudinary
            if url.startswith('http://') or url.startswith('https://'):
                # Si tiene doble barra después del dominio, corregir
                if 'res.cloudinary.com' in url and '://' in url:
                    parts = url.split('://')
                    if len(parts) == 2:
                        domain_part = parts[1]
                        if '//' in domain_part:
                            domain_part = domain_part.replace('//', '/')
                            url = f"{parts[0]}://{domain_part}"
                return url
            
            # Construir URL absoluta para rutas relativas
            request = self.context.get('request')
            if request:
                # Limpiar la ruta para evitar duplicados
                clean_path = url
                if clean_path.startswith('/media/'):
                    clean_path = clean_path[6:]
                elif clean_path.startswith('media/'):
                    clean_path = clean_path[6:]
                return request.build_absolute_uri(f'/media/{clean_path}')
            return f'/media/{url}'
        return None


class DiscountSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    new_price = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Discount
        fields = ['id', 'car', 'motorcycle', 'vehicle_type', 'discount_percentage', 
                 'start_date', 'end_date', 'created_at', 'is_active', 'title', 
                 'image_url', 'original_price', 'new_price', 'type']
    
    def get_type(self, obj):
        return 'Auto' if obj.vehicle_type == 'car' else 'Moto'
    
    def get_new_price(self, obj):
        if obj.original_price:
            discount_decimal = float(obj.discount_percentage) / 100
            return float(obj.original_price) * (1 - discount_decimal)
        return None
    
    def get_image_url(self, obj):
        if obj.image_url:
            url = obj.image_url
            
            # Corregir URLs malformadas
            if url.startswith('https:/') and 'res.cloudinary.com' in url:
                url = url.replace('https:/', 'https://', 1)
            
            # Verificar si ya es una URL completa de Cloudinary
            if url.startswith('http://') or url.startswith('https://'):
                if 'res.cloudinary.com' in url and '://' in url:
                    parts = url.split('://')
                    if len(parts) == 2:
                        domain_part = parts[1]
                        if '//' in domain_part:
                            domain_part = domain_part.replace('//', '/')
                            url = f"{parts[0]}://{domain_part}"
                return url
            
            # Construir URL absoluta para rutas relativas
            request = self.context.get('request')
            if request:
                clean_path = url
                if clean_path.startswith('/media/'):
                    clean_path = clean_path[6:]
                elif clean_path.startswith('media/'):
                    clean_path = clean_path[6:]
                return request.build_absolute_uri(f'/media/{clean_path}')
            return f'/media/{url}'
        return None

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'
        read_only_fields = ['date']

class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = '__all__'
        read_only_fields = ['subscription_date']

class SiteLogoSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    logo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = SiteLogo
        fields = ['id', 'logo', 'logo_url', 'uploaded_at', 'uploaded_by', 'is_active']
        read_only_fields = ['uploaded_at', 'uploaded_by']
    
    def get_logo_url(self, obj):
        if obj.logo:
            url = obj.logo.url
            
            # Corregir URLs malformadas
            if url.startswith('https:/') and 'res.cloudinary.com' in url:
                url = url.replace('https:/', 'https://', 1)
            
            # Si tiene doble barra después del dominio
            if 'res.cloudinary.com' in url and '://' in url:
                parts = url.split('://')
                if len(parts) == 2:
                    domain_part = parts[1]
                    if '//' in domain_part:
                        domain_part = domain_part.replace('//', '/')
                        url = f"{parts[0]}://{domain_part}"
            
            # Si ya es una URL absoluta (http:// o https://), devolverla directamente
            if url.startswith('http://') or url.startswith('https://'):
                return url
            
            # Si es una URL relativa, construir la URL absoluta
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(url)
            return url
        return None
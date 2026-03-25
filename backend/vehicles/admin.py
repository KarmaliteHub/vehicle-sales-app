from django.contrib import admin
from .models import Car, Motorcycle, ContactMessage, Subscriber, FeaturedItem, Discount, SystemConfiguration, SystemLog

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ['title', 'brand', 'model', 'year', 'price', 'is_sold', 'created_at']
    list_filter = ['brand', 'year', 'is_sold', 'transmission', 'fuel_type']
    search_fields = ['title', 'brand', 'model', 'description']
    readonly_fields = ['created_at', 'created_by']

@admin.register(Motorcycle)
class MotorcycleAdmin(admin.ModelAdmin):
    list_display = ['title', 'brand', 'model', 'year', 'price', 'is_sold', 'created_at']
    list_filter = ['brand', 'year', 'is_sold', 'category', 'fuel_type']
    search_fields = ['title', 'brand', 'model', 'description']
    readonly_fields = ['created_at', 'created_by']

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'date', 'is_read']
    list_filter = ['is_read', 'date']
    search_fields = ['name', 'email', 'message']
    readonly_fields = ['date']

@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ['email', 'subscription_date', 'is_active']
    list_filter = ['is_active', 'subscription_date']
    search_fields = ['email']
    readonly_fields = ['subscription_date']

@admin.register(FeaturedItem)
class FeaturedItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'vehicle_type', 'price', 'created_at']
    list_filter = ['vehicle_type', 'created_at']
    search_fields = ['title']
    readonly_fields = ['created_at', 'created_by', 'title', 'price', 'image_url']

@admin.register(Discount)
class DiscountAdmin(admin.ModelAdmin):
    list_display = ['title', 'vehicle_type', 'discount_percentage', 'start_date', 'end_date', 'is_active']
    list_filter = ['vehicle_type', 'is_active', 'start_date', 'end_date']
    search_fields = ['title']
    readonly_fields = ['created_at', 'created_by', 'title', 'original_price', 'image_url']

@admin.register(SystemConfiguration)
class SystemConfigurationAdmin(admin.ModelAdmin):
    list_display = ['key', 'category', 'is_active', 'updated_at', 'updated_by']
    list_filter = ['category', 'is_active', 'updated_at']
    search_fields = ['key', 'description']
    readonly_fields = ['created_at', 'updated_at', 'updated_by']
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating new object
            obj.updated_by = request.user
        else:  # Updating existing object
            obj.updated_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):
    list_display = ['level', 'module', 'message', 'user', 'timestamp']
    list_filter = ['level', 'module', 'timestamp']
    search_fields = ['message', 'module']
    readonly_fields = ['timestamp']
    
    def has_add_permission(self, request):
        return False  # Logs should not be manually created
    
    def has_change_permission(self, request, obj=None):
        return False  # Logs should not be modified
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser  # Only superusers can delete logs

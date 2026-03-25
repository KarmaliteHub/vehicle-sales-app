from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from vehicles.models import SystemConfiguration

class Command(BaseCommand):
    help = 'Populate initial system configurations'

    def handle(self, *args, **options):
        # Get or create a superuser for the configurations
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'is_staff': True,
                'is_superuser': True
            }
        )
        
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(
                self.style.SUCCESS('Created admin user: admin/admin123')
            )

        # Initial configurations
        initial_configs = [
            # General configurations
            {
                'key': 'company_name',
                'value': {'name': 'AutoMoto Sales'},
                'category': 'general',
                'description': 'Company name displayed in the application'
            },
            {
                'key': 'contact_email',
                'value': {'email': 'contact@automoto.com'},
                'category': 'general',
                'description': 'Main contact email for customer inquiries'
            },
            {
                'key': 'contact_phone',
                'value': {'phone': '+1-555-0123'},
                'category': 'general',
                'description': 'Main contact phone number'
            },
            {
                'key': 'company_address',
                'value': {'address': '123 Auto Street, Car City, CC 12345'},
                'category': 'general',
                'description': 'Company physical address'
            },
            {
                'key': 'default_currency',
                'value': {'currency': 'USD'},
                'category': 'general',
                'description': 'Default currency for vehicle prices'
            },
            {
                'key': 'timezone',
                'value': {'timezone': 'America/New_York'},
                'category': 'general',
                'description': 'Default timezone for the application'
            },
            
            # Appearance configurations
            {
                'key': 'theme',
                'value': {'theme': 'light'},
                'category': 'appearance',
                'description': 'Default theme (light/dark)'
            },
            {
                'key': 'primary_color',
                'value': {'color': '#1976d2'},
                'category': 'appearance',
                'description': 'Primary color for the application theme'
            },
            {
                'key': 'secondary_color',
                'value': {'color': '#dc004e'},
                'category': 'appearance',
                'description': 'Secondary color for the application theme'
            },
            {
                'key': 'font_family',
                'value': {'font': 'Roboto'},
                'category': 'appearance',
                'description': 'Default font family for the application'
            },
            
            # Notification configurations
            {
                'key': 'email_notifications',
                'value': {'enabled': True},
                'category': 'notifications',
                'description': 'Enable/disable email notifications'
            },
            {
                'key': 'sales_notifications',
                'value': {'enabled': True},
                'category': 'notifications',
                'description': 'Enable/disable sales notifications'
            },
            {
                'key': 'inventory_notifications',
                'value': {'enabled': True},
                'category': 'notifications',
                'description': 'Enable/disable inventory notifications'
            },
            {
                'key': 'marketing_notifications',
                'value': {'enabled': False},
                'category': 'notifications',
                'description': 'Enable/disable marketing notifications'
            },
            
            # Security configurations
            {
                'key': 'two_factor_auth',
                'value': {'enabled': False},
                'category': 'security',
                'description': 'Enable/disable two-factor authentication'
            },
            {
                'key': 'session_timeout',
                'value': {'minutes': 60},
                'category': 'security',
                'description': 'Session timeout in minutes'
            },
            {
                'key': 'password_expiry',
                'value': {'days': 90},
                'category': 'security',
                'description': 'Password expiry in days'
            },
            {
                'key': 'max_login_attempts',
                'value': {'attempts': 5},
                'category': 'security',
                'description': 'Maximum login attempts before lockout'
            }
        ]

        created_count = 0
        updated_count = 0

        for config_data in initial_configs:
            config, created = SystemConfiguration.objects.get_or_create(
                key=config_data['key'],
                defaults={
                    'value': config_data['value'],
                    'category': config_data['category'],
                    'description': config_data['description'],
                    'updated_by': admin_user
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(f"Created configuration: {config_data['key']}")
            else:
                updated_count += 1
                self.stdout.write(f"Configuration already exists: {config_data['key']}")

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully processed {created_count} new and {updated_count} existing configurations'
            )
        )
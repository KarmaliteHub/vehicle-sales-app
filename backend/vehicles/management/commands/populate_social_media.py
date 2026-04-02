from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from vehicles.models import SocialMedia

class Command(BaseCommand):
    help = 'Populate initial social media data'

    def handle(self, *args, **options):
        # Get or create a superuser for the created_by field
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@karmalite.com',
                password='admin123'
            )

        # Create default social media entries
        social_media_data = [
            {
                'platform': 'facebook',
                'name': 'Facebook',
                'url': 'https://facebook.com/karmalitemotors',
                'icon': 'facebook',
                'order': 1
            },
            {
                'platform': 'instagram',
                'name': 'Instagram',
                'url': 'https://instagram.com/karmalitemotors',
                'icon': 'instagram',
                'order': 2
            },
            {
                'platform': 'twitter',
                'name': 'Twitter',
                'url': 'https://twitter.com/karmalitemotors',
                'icon': 'twitter',
                'order': 3
            },
            {
                'platform': 'whatsapp',
                'name': 'WhatsApp',
                'url': 'https://wa.me/15551234567',
                'icon': 'whatsapp',
                'order': 4
            }
        ]

        for data in social_media_data:
            social_media, created = SocialMedia.objects.get_or_create(
                platform=data['platform'],
                defaults={
                    'name': data['name'],
                    'url': data['url'],
                    'icon': data['icon'],
                    'order': data['order'],
                    'is_active': True,
                    'created_by': admin_user
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created social media: {social_media.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Social media already exists: {social_media.name}')
                )

        self.stdout.write(
            self.style.SUCCESS('Successfully populated social media data')
        )
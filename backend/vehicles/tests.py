from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Car, Motorcycle, SystemConfiguration, SystemLog

class SystemConfigurationTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
    def test_create_configuration(self):
        """Test creating a new configuration"""
        data = {
            'key': 'test_config',
            'value': {'test': 'value'},
            'category': 'general',
            'description': 'Test configuration'
        }
        response = self.client.post('/api/configurations/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['key'], 'test_config')
        self.assertEqual(response.data['value'], {'test': 'value'})
        
    def test_get_configurations_by_category(self):
        """Test getting configurations by category"""
        # Create test configurations
        SystemConfiguration.objects.create(
            key='test1',
            value={'value': 1},
            category='general',
            updated_by=self.user
        )
        SystemConfiguration.objects.create(
            key='test2',
            value={'value': 2},
            category='appearance',
            updated_by=self.user
        )
        
        response = self.client.get('/api/configurations/by_category/?category=general')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['key'], 'test1')
        
    def test_bulk_update_configurations(self):
        """Test bulk updating configurations"""
        data = {
            'configurations': [
                {
                    'key': 'bulk_test1',
                    'value': {'test': 'bulk1'},
                    'category': 'general'
                },
                {
                    'key': 'bulk_test2',
                    'value': {'test': 'bulk2'},
                    'category': 'appearance'
                }
            ]
        }
        response = self.client.post('/api/configurations/bulk_update/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
        # Verify configurations were created
        config1 = SystemConfiguration.objects.get(key='bulk_test1')
        config2 = SystemConfiguration.objects.get(key='bulk_test2')
        self.assertEqual(config1.value, {'test': 'bulk1'})
        self.assertEqual(config2.value, {'test': 'bulk2'})

class SystemConfigurationModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
    def test_configuration_str_method(self):
        """Test the string representation of SystemConfiguration"""
        config = SystemConfiguration.objects.create(
            key='test_key',
            value={'test': 'value'},
            category='general',
            updated_by=self.user
        )
        self.assertEqual(str(config), 'general.test_key')
        
    def test_system_log_creation(self):
        """Test creating a system log entry"""
        log = SystemLog.objects.create(
            level='INFO',
            message='Test log message',
            module='test_module',
            user=self.user,
            ip_address='127.0.0.1'
        )
        self.assertEqual(log.level, 'INFO')
        self.assertEqual(log.message, 'Test log message')
        self.assertEqual(log.user, self.user)

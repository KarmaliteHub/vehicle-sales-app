# Deployment Guide - Vehicle Sales App

Esta guía describe cómo desplegar la aplicación de venta de vehículos en diferentes plataformas.

## Arquitectura de Despliegue

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Netlify/     │───▶│   (Heroku/      │───▶│  (PostgreSQL)   │
│    Vercel)      │    │ DigitalOcean)   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Media Storage  │
                       │ (Cloudinary/S3) │
                       └─────────────────┘
```

## Preparación Previa

### 1. Variables de Entorno

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Django
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-backend-domain.com,localhost

# CORS
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com,http://localhost:4200

# Media Storage (Cloudinary)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Security
SECURE_SSL_REDIRECT=True
SECURE_PROXY_SSL_HEADER=HTTP_X_FORWARDED_PROTO,https
```

#### Frontend (environment.prod.ts)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-domain.com/api'
};
```

### 2. Configuración de Base de Datos

#### PostgreSQL Setup
```sql
-- Crear base de datos
CREATE DATABASE vehicle_sales;
CREATE USER vehicle_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE vehicle_sales TO vehicle_user;
```

## Opción 1: Heroku + Netlify

### Backend en Heroku

#### 1. Preparar archivos de Heroku
```bash
# Procfile (ya existe)
web: gunicorn backend.wsgi --log-file -

# runtime.txt (ya existe)
python-3.11.0
```

#### 2. Configurar Heroku CLI
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Crear app
heroku create your-backend-app-name

# Configurar variables de entorno
heroku config:set SECRET_KEY="your-secret-key"
heroku config:set DEBUG=False
heroku config:set ALLOWED_HOSTS="your-backend-app.herokuapp.com"
heroku config:set CORS_ALLOWED_ORIGINS="https://your-frontend.netlify.app"

# Agregar PostgreSQL
heroku addons:create heroku-postgresql:mini

# Desplegar
git subtree push --prefix=backend heroku main
```

#### 3. Ejecutar migraciones
```bash
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
heroku run python manage.py populate_initial_configs
```

### Frontend en Netlify

#### 1. Build configuration
```bash
# netlify.toml
[build]
  base = "frontend-admin/"
  command = "npm run build"
  publish = "dist/frontend-admin"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. Deploy via Git
```bash
# Conectar repositorio en Netlify dashboard
# O usar Netlify CLI
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

## Opción 2: DigitalOcean App Platform

### 1. Configurar App Spec
```yaml
# .do/app.yaml
name: vehicle-sales-app
services:
- name: backend
  source_dir: /backend
  github:
    repo: your-username/vehicle-sales-app
    branch: main
  run_command: gunicorn backend.wsgi
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: SECRET_KEY
    value: your-secret-key
  - key: DEBUG
    value: "False"
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}

- name: frontend
  source_dir: /frontend-admin
  github:
    repo: your-username/vehicle-sales-app
    branch: main
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs

databases:
- name: db
  engine: PG
  version: "13"
  size_slug: db-s-dev-database
```

### 2. Deploy
```bash
# Instalar doctl
# Crear app
doctl apps create --spec .do/app.yaml
```

## Opción 3: Vercel (Full Stack)

### 1. Configurar Vercel
```json
// vercel.json
{
  "builds": [
    {
      "src": "backend/backend/wsgi.py",
      "use": "@vercel/python"
    },
    {
      "src": "frontend-admin/package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/backend/wsgi.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend-admin/$1"
    }
  ]
}
```

### 2. Deploy
```bash
npm install -g vercel
vercel login
vercel --prod
```

## Configuración de Media Files

### Cloudinary Setup
```python
# backend/backend/settings.py
import cloudinary
import cloudinary.uploader
import cloudinary.api

cloudinary.config(
    cloud_name="your-cloud-name",
    api_key="your-api-key",
    api_secret="your-api-secret"
)

# Media files configuration
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': 'your-cloud-name',
    'API_KEY': 'your-api-key',
    'API_SECRET': 'your-api-secret',
}
```

### AWS S3 Setup (Alternativo)
```python
# settings.py
AWS_ACCESS_KEY_ID = 'your-access-key'
AWS_SECRET_ACCESS_KEY = 'your-secret-key'
AWS_STORAGE_BUCKET_NAME = 'your-bucket-name'
AWS_S3_REGION_NAME = 'us-east-1'
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
AWS_DEFAULT_ACL = 'public-read'

DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'
```

## SSL y Seguridad

### 1. Configuración HTTPS
```python
# settings.py para producción
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

### 2. CORS Configuration
```python
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
    "https://your-admin-domain.com",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False  # Solo en desarrollo
```

## Monitoreo y Logs

### 1. Logging Configuration
```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'django.log',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### 2. Health Checks
```python
# vehicles/views.py
from django.http import JsonResponse
from django.db import connection

def health_check(request):
    try:
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        return JsonResponse({
            'status': 'healthy',
            'database': 'connected',
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e)
        }, status=500)
```

## Backup y Recuperación

### 1. Database Backup
```bash
# Heroku
heroku pg:backups:capture --app your-app-name
heroku pg:backups:download --app your-app-name

# DigitalOcean
doctl databases backup list your-database-id
```

### 2. Media Files Backup
```python
# Script de backup para Cloudinary
import cloudinary.api

def backup_media_files():
    resources = cloudinary.api.resources(
        type="upload",
        max_results=500
    )
    
    for resource in resources['resources']:
        # Download and backup logic
        pass
```

## Performance Optimization

### 1. Database Optimization
```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'CONN_MAX_AGE': 600,
        'CONN_HEALTH_CHECKS': True,
        'OPTIONS': {
            'MAX_CONNS': 20,
        }
    }
}
```

### 2. Caching
```python
# Redis caching
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

### 3. CDN Configuration
```python
# Static files CDN
STATIC_URL = 'https://your-cdn-domain.com/static/'
MEDIA_URL = 'https://your-cdn-domain.com/media/'
```

## Troubleshooting

### Errores Comunes

#### 1. CORS Errors
```
Access to XMLHttpRequest at 'backend-url' from origin 'frontend-url' has been blocked by CORS policy
```
**Solución:** Verificar `CORS_ALLOWED_ORIGINS` en settings.py

#### 2. Static Files Not Loading
```
GET /static/admin/css/base.css 404 (Not Found)
```
**Solución:** Ejecutar `python manage.py collectstatic`

#### 3. Database Connection Error
```
django.db.utils.OperationalError: could not connect to server
```
**Solución:** Verificar `DATABASE_URL` y conectividad

### Comandos de Diagnóstico
```bash
# Verificar logs
heroku logs --tail --app your-app-name

# Verificar variables de entorno
heroku config --app your-app-name

# Ejecutar shell remoto
heroku run python manage.py shell --app your-app-name

# Verificar migraciones
heroku run python manage.py showmigrations --app your-app-name
```

## Checklist de Despliegue

- [ ] Variables de entorno configuradas
- [ ] Base de datos PostgreSQL creada
- [ ] Migraciones ejecutadas
- [ ] Superusuario creado
- [ ] Configuraciones iniciales cargadas
- [ ] Media storage configurado
- [ ] CORS configurado correctamente
- [ ] SSL/HTTPS habilitado
- [ ] Health checks funcionando
- [ ] Logs configurados
- [ ] Backup strategy implementada
- [ ] Dominio personalizado configurado (opcional)
- [ ] Monitoreo configurado (opcional)

## Mantenimiento

### Updates Regulares
```bash
# Actualizar dependencias
pip list --outdated
npm outdated

# Aplicar parches de seguridad
pip install --upgrade package-name
npm update package-name
```

### Monitoring
- Configurar alertas para errores 5xx
- Monitorear uso de recursos
- Revisar logs regularmente
- Verificar backups automáticos
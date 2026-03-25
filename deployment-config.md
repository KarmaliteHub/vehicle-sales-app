# Configuración de Despliegue - Vehicle Sales App

## Variables de Entorno Requeridas

### Backend (Render)

**Variables de entorno en Render:**
```
SECRET_KEY=<generar-automaticamente>
DEBUG=False
ALLOWED_HOSTS=.onrender.com
DATABASE_URL=<conectar-base-datos-render>
CORS_ALLOWED_ORIGINS=https://vehicle-sales-admin.netlify.app,https://vehicle-sales-frontend.netlify.app

# Cloudinary para archivos media
CLOUDINARY_CLOUD_NAME=<tu-cloud-name>
CLOUDINARY_API_KEY=<tu-api-key>
CLOUDINARY_API_SECRET=<tu-api-secret>
```

### Frontend (Netlify)

**Variables de entorno en Netlify:**
```
NODE_ENV=production
```

## Pasos de Despliegue

### 1. Backend en Render

1. **Crear cuenta en Render.com**
2. **Conectar repositorio GitHub**
3. **Crear Web Service:**
   - Name: `vehicle-sales-backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && python manage.py migrate && python manage.py populate_initial_configs && gunicorn backend.wsgi:application`
   - Root Directory: `/`

4. **Crear PostgreSQL Database:**
   - Name: `vehicle-sales-db`
   - Database Name: `vehicle_sales`
   - User: `vehicle_user`

5. **Configurar variables de entorno** (ver arriba)

### 2. Frontend en Netlify

1. **Crear cuenta en Netlify.com**
2. **Conectar repositorio GitHub**
3. **Configurar build:**
   - Base directory: `frontend-admin`
   - Build command: `npm run build:prod`
   - Publish directory: `dist/frontend-admin`

4. **Configurar variables de entorno** (ver arriba)

### 3. Cloudinary para Media Files

1. **Crear cuenta en Cloudinary.com**
2. **Obtener credenciales del Dashboard**
3. **Configurar variables en Render** (ver arriba)

## URLs Finales

- **Backend API**: `https://vehicle-sales-backend.onrender.com/api/`
- **Frontend Admin**: `https://vehicle-sales-admin.netlify.app/`
- **Health Check**: `https://vehicle-sales-backend.onrender.com/api/health/`

## Verificación Post-Despliegue

### Backend
```bash
curl https://vehicle-sales-backend.onrender.com/api/health/
# Debe retornar: {"status": "healthy", "service": "vehicle-sales-backend", "version": "1.0.0"}

curl https://vehicle-sales-backend.onrender.com/api/cars/
# Debe retornar lista de autos
```

### Frontend
- Acceder a `https://vehicle-sales-admin.netlify.app/`
- Verificar que carga sin errores
- Probar login y navegación
- Verificar que las llamadas API funcionan

### Media Files
- Subir una imagen de vehículo
- Verificar que se almacena en Cloudinary
- Verificar que se muestra correctamente en el frontend

## Troubleshooting

### Errores Comunes

1. **CORS Error**: Verificar CORS_ALLOWED_ORIGINS en backend
2. **Database Connection**: Verificar DATABASE_URL
3. **Media Files**: Verificar credenciales de Cloudinary
4. **Build Errors**: Verificar versiones de Node.js y Python

### Logs

- **Render**: Ver logs en dashboard de Render
- **Netlify**: Ver logs en dashboard de Netlify
- **Cloudinary**: Ver usage en dashboard de Cloudinary
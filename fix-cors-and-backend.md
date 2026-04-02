# Solución para Problemas de CORS y Backend

## Problema Identificado
- Error CORS: `Access to XMLHttpRequest at 'https://webvehicles-backend.onrender.com/api/token/' from origin 'https://adminwebvehicles.netlify.app' has been blocked by CORS policy`
- Backend no responde correctamente en ninguna de las dos URLs

## Causa Raíz
1. **Backend no está funcionando**: Ambas URLs (`vehicle-sales-backend` y `webvehicles-backend`) tienen problemas
2. **Inconsistencia en configuración**: Diferentes archivos apuntaban a diferentes URLs
3. **CORS necesita configuración adicional**: Faltaban headers y métodos específicos

## Soluciones Aplicadas

### 1. ✅ Configuración CORS Mejorada
Actualizado `backend/backend/settings.py` con:
- Más dominios de Netlify permitidos
- Headers CORS específicos
- Métodos HTTP permitidos
- Configuración de credenciales

### 2. ✅ URLs Unificadas
Todos los archivos ahora apuntan a: `https://vehicle-sales-backend.onrender.com/api`
- ✅ frontend-web/src/environments/
- ✅ frontend-admin/src/environments/  
- ✅ Netlify configurations
- ✅ render.yaml

## Pasos para Resolver Completamente

### Paso 1: Verificar Backend en Render
1. Ve a https://dashboard.render.com
2. Busca tu servicio `vehicle-sales-backend`
3. Si no existe o está fallando:
   - Crear nuevo servicio
   - Repository: https://github.com/KarmaliteHub/vehicle-sales-app
   - Root Directory: `backend`
   - Build Command: `./build.sh`
   - Start Command: `gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT`

### Paso 2: Variables de Entorno en Render
Asegúrate de tener estas variables:
```
DEBUG=False
ENVIRONMENT=production
DJANGO_SETTINGS_MODULE=backend.settings
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key  
CLOUDINARY_API_SECRET=tu_api_secret
```

### Paso 3: Verificar Conectividad
Después del despliegue, verifica:
```bash
curl https://vehicle-sales-backend.onrender.com/api/health/
```
Debe devolver: `{"status": "healthy", "service": "vehicle-sales-backend", "version": "1.0.0"}`

### Paso 4: Redesplegar Frontends
1. **Frontend Admin**: 
   - Netlify environment: `API_URL=https://vehicle-sales-backend.onrender.com/api`
   - Redesplegar

2. **Frontend Web**:
   - Netlify environment: `API_URL=https://vehicle-sales-backend.onrender.com/api`  
   - Redesplegar

### Paso 5: Poblar Datos Iniciales
Una vez que el backend funcione:
```bash
# En Render shell o localmente conectado a la DB de producción
python manage.py populate_initial_configs
python manage.py populate_social_media
```

## Verificación Final

### Test 1: Backend Health
```bash
curl https://vehicle-sales-backend.onrender.com/api/health/
```

### Test 2: Social Media API
```bash
curl https://vehicle-sales-backend.onrender.com/api/social-media/public/
```

### Test 3: CORS desde Frontend
Abrir consola en `https://adminwebvehicles.netlify.app` y ejecutar:
```javascript
fetch('https://vehicle-sales-backend.onrender.com/api/health/')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

## Configuración CORS Actualizada
El backend ahora permite estos orígenes:
- `https://adminwebvehicles.netlify.app` ✅
- `https://vehicle-sales-admin.netlify.app`
- `https://vehicle-sales-web.netlify.app`
- `https://webvehicles.netlify.app`
- Y varios más para máxima compatibilidad

## Si Persisten los Problemas

### Opción A: Verificar Logs de Render
1. Ve a tu servicio en Render
2. Revisa la pestaña "Logs"
3. Busca errores de inicio o configuración

### Opción B: Recrear Servicio
Si el servicio está corrupto:
1. Eliminar servicio actual en Render
2. Crear nuevo con la configuración correcta
3. Usar el `render.yaml` actualizado

### Opción C: Verificar Base de Datos
Asegúrate de que la base de datos esté conectada y funcionando en Render.

## Archivos Modificados
- ✅ `backend/backend/settings.py` - CORS mejorado
- ✅ `frontend-web/src/environments/*` - URLs corregidas
- ✅ `frontend-admin/src/environments/*` - URLs corregidas  
- ✅ `frontend-web/netlify.toml` - API_URL corregida
- ✅ `frontend-admin/netlify.toml` - API_URL corregida
- ✅ `backend/render.yaml` - Nombre de servicio corregido
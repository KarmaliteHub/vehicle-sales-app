# 🚀 Instrucciones de Despliegue - Vehicle Sales App (CORREGIDO)

## ❌ Problemas Identificados y Solucionados

1. **Backend devolvía 404** - Configuración de Render corregida
2. **Solo 1 frontend configurado** - Ahora ambos frontends están configurados
3. **URLs inconsistentes** - Unificado a webvehicles-backend.onrender.com
4. **CORS mal configurado** - Agregados todos los dominios necesarios

## 📋 Pasos de Despliegue Completo

### 1. Desplegar Backend en Render (CORREGIDO)

1. **Ir a [render.com](https://render.com) y crear cuenta**

2. **Buscar servicio existente o crear Web Service:**
   - Click "New" → "Web Service"
   - Conectar repositorio GitHub: `https://github.com/KarmaliteHub/vehicle-sales-app`
   - Configuración:
     ```
     Name: webvehicles-backend
     Environment: Python 3
     Build Command: pip install -r backend/requirements.txt
     Start Command: cd backend && python manage.py migrate && python manage.py populate_initial_configs && gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
     ```

3. **Crear PostgreSQL Database (si no existe):**
   - Click "New" → "PostgreSQL"
   - Name: `vehicle-sales-db`
   - Copiar la DATABASE_URL generada

4. **Configurar Variables de Entorno en Render:**
   ```
   SECRET_KEY=<generar-automaticamente>
   DEBUG=False
   DATABASE_URL=<pegar-url-de-postgresql>
   ALLOWED_HOSTS=.onrender.com,webvehicles-backend.onrender.com
   CORS_ALLOWED_ORIGINS=https://vehicle-sales-admin.netlify.app,https://vehicle-sales-web.netlify.app,https://webvehicles.netlify.app
   ```

### 2. Desplegar Frontend Admin en Netlify

1. **Ir a [netlify.com](https://netlify.com) y crear cuenta**

2. **Crear nuevo sitio:**
   - Click "Add new site" → "Import an existing project"
   - Conectar repositorio GitHub: `https://github.com/KarmaliteHub/vehicle-sales-app`
   - Configuración:
     ```
     Base directory: frontend-admin
     Build command: npm run build:prod
     Publish directory: dist/frontend-admin
     ```

3. **Configurar Site Name:**
   - Ir a "Site settings" → "General" → "Site details"
   - Cambiar nombre a: `vehicle-sales-admin`
   - URL final: `https://vehicle-sales-admin.netlify.app/`

### 3. Desplegar Frontend Web en Netlify (NUEVO)

1. **Crear SEGUNDO sitio en Netlify:**
   - Click "Add new site" → "Import an existing project"
   - Conectar MISMO repositorio GitHub: `https://github.com/KarmaliteHub/vehicle-sales-app`
   - Configuración:
     ```
     Base directory: frontend-web
     Build command: npm run build
     Publish directory: dist/frontend-web
     ```

2. **Configurar Site Name:**
   - Ir a "Site settings" → "General" → "Site details"
   - Cambiar nombre a: `vehicle-sales-web`
   - URL final: `https://vehicle-sales-web.netlify.app/`

### 4. Configurar Cloudinary (Opcional pero Recomendado)

1. **Crear cuenta en [cloudinary.com](https://cloudinary.com)**

2. **Obtener credenciales del Dashboard**

3. **Agregar a variables de entorno en Render:**
   ```
   CLOUDINARY_CLOUD_NAME=<tu-cloud-name>
   CLOUDINARY_API_KEY=<tu-api-key>
   CLOUDINARY_API_SECRET=<tu-api-secret>
   ```

## 🔍 Verificación Post-Despliegue

### Automática (RECOMENDADO)
```bash
python verify-complete-deployment.py
```

### Manual

1. **Backend Health Check:**
   ```bash
   curl https://webvehicles-backend.onrender.com/api/health/
   ```
   Debe retornar: `{"status": "healthy", "service": "vehicle-sales-backend", "version": "1.0.0"}`

2. **Frontend Admin:**
   - Abrir `https://vehicle-sales-admin.netlify.app/`
   - Verificar que carga sin errores
   - Probar login y navegación

3. **Frontend Web:**
   - Abrir `https://vehicle-sales-web.netlify.app/`
   - Verificar que carga sin errores
   - Probar navegación y funcionalidades públicas

4. **API Integration:**
   - Desde frontend admin, probar CRUD de vehículos
   - Verificar que las imágenes se cargan correctamente
   - Probar funcionalidad de elementos destacados

## 🎯 URLs Finales Funcionales

- **Backend API**: `https://webvehicles-backend.onrender.com/api/`
- **Frontend Admin**: `https://vehicle-sales-admin.netlify.app/`
- **Frontend Web**: `https://vehicle-sales-web.netlify.app/`
- **Health Check**: `https://webvehicles-backend.onrender.com/api/health/`

## 🔧 Troubleshooting

### Errores Comunes

1. **Build Error en Render:**
   - Verificar que `requirements.txt` esté en `/backend/`
   - Verificar Python version en `runtime.txt`
   - Revisar logs en Render Dashboard

2. **CORS Error:**
   - Verificar `CORS_ALLOWED_ORIGINS` en settings.py
   - Verificar que las URLs coincidan exactamente (sin trailing slash)

3. **Database Connection Error:**
   - Verificar `DATABASE_URL` en variables de entorno
   - Verificar que la base de datos esté creada y accesible

4. **Frontend Build Error:**
   - Verificar Node.js version (debe ser 18)
   - Verificar que `package.json` esté en el directorio correcto
   - Revisar build logs en Netlify

5. **404 en Backend:**
   - Verificar que el servicio esté corriendo en Render
   - Verificar que las migraciones se ejecutaron correctamente
   - Probar el health check endpoint

### Logs

- **Render**: Ver logs en dashboard → tu servicio → "Logs"
- **Netlify**: Ver logs en dashboard → tu sitio → "Deploys" → click en deploy

## 📞 Soporte

Si encuentras problemas:

1. Ejecutar `python verify-complete-deployment.py` para diagnóstico automático
2. Revisar logs de la plataforma correspondiente
3. Verificar que todas las variables de entorno estén configuradas
4. Contactar soporte si el problema persiste

---

**¡El despliegue completo está listo! 🎉**

Ahora tienes:
- ✅ Backend funcionando en Render
- ✅ Frontend Admin funcionando en Netlify  
- ✅ Frontend Web funcionando en Netlify
- ✅ CORS configurado correctamente
- ✅ Scripts de verificación automática
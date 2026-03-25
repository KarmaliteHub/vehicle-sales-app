# Vehicle Sales App - Aplicación de Venta de Vehículos

Una aplicación completa para la venta de autos y motos con backend Django REST API y frontend de administración Angular.

## 🚗 Descripción

Esta aplicación permite gestionar un inventario de vehículos (autos y motos) con funcionalidades completas de administración, incluyendo:

- **CRUD de vehículos**: Crear, leer, actualizar y eliminar autos y motos
- **Elementos destacados**: Sistema para destacar vehículos específicos
- **Descuentos**: Gestión de ofertas y descuentos
- **Configuraciones del sistema**: Panel de administración completo
- **Mensajes de contacto**: Sistema de contacto con clientes
- **Suscriptores**: Gestión de newsletter y suscripciones
- **Dashboard**: Estadísticas y métricas del negocio

## 🏗️ Arquitectura

```
vehicle-sales-app/
├── backend/                    # Django REST API
│   ├── backend/               # Configuración principal
│   ├── vehicles/              # App principal de vehículos
│   ├── media/                 # Archivos de imágenes
│   ├── requirements.txt       # Dependencias Python
│   └── manage.py             # Comando Django
├── frontend-admin/            # Frontend de administración Angular
│   ├── src/                  # Código fuente Angular
│   ├── package.json          # Dependencias Node.js
│   └── angular.json          # Configuración Angular
└── docs/                     # Documentación
```

## 🛠️ Tecnologías

### Backend
- **Django 4.x**: Framework web Python
- **Django REST Framework**: API REST
- **PostgreSQL**: Base de datos
- **JWT Authentication**: Autenticación segura
- **Pillow**: Procesamiento de imágenes

### Frontend
- **Angular 19**: Framework frontend
- **Angular Material**: Componentes UI
- **TypeScript**: Lenguaje tipado
- **RxJS**: Programación reactiva

## 🚀 Instalación y Configuración

### Prerrequisitos
- Python 3.8+
- Node.js 18+
- PostgreSQL 12+
- Git

### Backend Setup

1. **Clonar el repositorio**
```bash
git clone https://github.com/[tu-usuario]/vehicle-sales-app.git
cd vehicle-sales-app/backend
```

2. **Crear entorno virtual**
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno**
```bash
# Crear archivo .env en backend/
DATABASE_URL=postgresql://usuario:password@localhost:5432/vehicle_sales
SECRET_KEY=tu-clave-secreta-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

5. **Ejecutar migraciones**
```bash
python manage.py migrate
python manage.py createsuperuser
```

6. **Cargar datos iniciales**
```bash
python manage.py populate_initial_configs
```

7. **Ejecutar servidor**
```bash
python manage.py runserver
```

### Frontend Setup

1. **Navegar al directorio frontend**
```bash
cd ../frontend-admin
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

4. **Ejecutar aplicación**
```bash
ng serve
```

La aplicación estará disponible en:
- **Backend API**: http://localhost:8000/api/
- **Frontend Admin**: http://localhost:4200/

## 📊 Funcionalidades Principales

### Panel de Administración
- **Dashboard**: Estadísticas de vehículos, ventas y usuarios
- **Gestión de Vehículos**: CRUD completo para autos y motos
- **Elementos Destacados**: Promocionar vehículos específicos
- **Descuentos**: Crear y gestionar ofertas
- **Configuraciones**: Ajustes generales, apariencia, notificaciones y seguridad
- **Mensajes**: Ver y gestionar mensajes de contacto
- **Suscriptores**: Gestión de newsletter

### API Endpoints
```
GET    /api/cars/              # Listar autos
POST   /api/cars/              # Crear auto
GET    /api/cars/{id}/         # Obtener auto específico
PUT    /api/cars/{id}/         # Actualizar auto
DELETE /api/cars/{id}/         # Eliminar auto

GET    /api/motorcycles/       # Listar motos
POST   /api/motorcycles/       # Crear moto
GET    /api/motorcycles/{id}/  # Obtener moto específica
PUT    /api/motorcycles/{id}/  # Actualizar moto
DELETE /api/motorcycles/{id}/  # Eliminar moto

GET    /api/featured/          # Elementos destacados
POST   /api/featured/          # Destacar elemento
DELETE /api/featured/{id}/     # Quitar de destacados

GET    /api/discounts/         # Listar descuentos
POST   /api/discounts/         # Crear descuento

GET    /api/contacts/          # Mensajes de contacto
POST   /api/contacts/          # Enviar mensaje

GET    /api/subscribers/       # Listar suscriptores
POST   /api/subscribers/       # Suscribirse
GET    /api/subscribers/export/ # Exportar CSV

GET    /api/configurations/    # Configuraciones del sistema
PUT    /api/configurations/    # Actualizar configuraciones
```

## 🔧 Configuración de Producción

### Variables de Entorno Requeridas

**Backend:**
```env
DATABASE_URL=postgresql://...
SECRET_KEY=...
DEBUG=False
ALLOWED_HOSTS=tu-dominio.com
CORS_ALLOWED_ORIGINS=https://tu-frontend.com
CLOUDINARY_URL=cloudinary://...  # Para archivos media
```

**Frontend:**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-backend.com/api'
};
```

### Despliegue

La aplicación está configurada para desplegarse en:
- **Backend**: Heroku, DigitalOcean, Vercel
- **Frontend**: Netlify, Vercel, GitHub Pages
- **Base de Datos**: PostgreSQL gestionada
- **Media Files**: Cloudinary, AWS S3

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend-admin
npm test                    # Unit tests
npm run test:coverage      # Coverage report
npm run e2e               # End-to-end tests
```

## 📝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Soporte

Si tienes preguntas o necesitas ayuda:

1. Revisa la [documentación](./docs/)
2. Abre un [issue](https://github.com/[tu-usuario]/vehicle-sales-app/issues)
3. Contacta al equipo de desarrollo

## 🔄 Changelog

### v1.0.0 (2024-01-XX)
- ✅ Sistema completo de gestión de vehículos
- ✅ Panel de administración Angular
- ✅ API REST con Django
- ✅ Autenticación JWT
- ✅ Sistema de configuraciones
- ✅ Elementos destacados y descuentos
- ✅ Gestión de contactos y suscriptores

---

**Desarrollado con ❤️ para la gestión eficiente de venta de vehículos**
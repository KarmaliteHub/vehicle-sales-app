# API Documentation - Vehicle Sales App

## Base URL
```
Production: https://[tu-backend-url]/api/
Development: http://localhost:8000/api/
```

## Authentication
La API utiliza JWT (JSON Web Tokens) para autenticación.

### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Headers Requeridos
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Endpoints

### Vehículos - Autos

#### Listar Autos
```http
GET /api/cars/
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "BMW Serie 3",
    "brand": "BMW",
    "model": "Serie 3",
    "year": 2023,
    "price": "45000.00",
    "description": "Excelente estado",
    "image": "/media/cars/bmw.jpg",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "created_by": 1
  }
]
```

#### Crear Auto
```http
POST /api/cars/
Content-Type: multipart/form-data

{
  "title": "Mercedes Clase C",
  "brand": "Mercedes",
  "model": "Clase C",
  "year": 2023,
  "price": "50000.00",
  "description": "Como nuevo",
  "image": <file>
}
```

#### Obtener Auto Específico
```http
GET /api/cars/{id}/
```

#### Actualizar Auto
```http
PUT /api/cars/{id}/
Content-Type: multipart/form-data
```

#### Eliminar Auto
```http
DELETE /api/cars/{id}/
```

### Vehículos - Motos

#### Listar Motos
```http
GET /api/motorcycles/
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Yamaha R1",
    "brand": "Yamaha",
    "model": "R1",
    "year": 2023,
    "price": "15000.00",
    "description": "Deportiva",
    "image": "/media/motorcycles/yamaha.jpg",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "created_by": 1
  }
]
```

#### Crear Moto
```http
POST /api/motorcycles/
Content-Type: multipart/form-data
```

#### Obtener Moto Específica
```http
GET /api/motorcycles/{id}/
```

#### Actualizar Moto
```http
PUT /api/motorcycles/{id}/
```

#### Eliminar Moto
```http
DELETE /api/motorcycles/{id}/
```

### Elementos Destacados

#### Listar Elementos Destacados
```http
GET /api/featured/
```

**Response:**
```json
[
  {
    "id": 1,
    "vehicle_type": "car",
    "vehicle_id": 1,
    "title": "BMW Serie 3",
    "price": "45000.00",
    "image_url": "/media/cars/bmw.jpg",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

#### Destacar Vehículo
```http
POST /api/featured/
Content-Type: application/json

{
  "vehicle_type": "car",
  "vehicle_id": 1
}
```

#### Quitar de Destacados
```http
DELETE /api/featured/{id}/
```

#### Autos Disponibles para Destacar
```http
GET /api/available-cars/
```

#### Motos Disponibles para Destacar
```http
GET /api/available-motorcycles/
```

### Descuentos

#### Listar Descuentos
```http
GET /api/discounts/
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Descuento Verano",
    "description": "20% de descuento",
    "discount_percentage": "20.00",
    "original_price": "50000.00",
    "discounted_price": "40000.00",
    "image_url": "/media/discounts/summer.jpg",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

#### Crear Descuento
```http
POST /api/discounts/
Content-Type: multipart/form-data

{
  "title": "Oferta Especial",
  "description": "Descuento limitado",
  "discount_percentage": "15.00",
  "original_price": "30000.00",
  "image": <file>
}
```

### Mensajes de Contacto

#### Listar Mensajes
```http
GET /api/contacts/
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "phone": "+1234567890",
    "message": "Interesado en BMW Serie 3",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

#### Enviar Mensaje
```http
POST /api/contacts/
Content-Type: application/json

{
  "name": "María García",
  "email": "maria@email.com",
  "phone": "+0987654321",
  "message": "¿Tienen financiamiento?"
}
```

### Suscriptores

#### Listar Suscriptores
```http
GET /api/subscribers/
```

**Response:**
```json
[
  {
    "id": 1,
    "email": "subscriber@email.com",
    "subscribed_at": "2024-01-15T10:30:00Z"
  }
]
```

#### Suscribirse
```http
POST /api/subscribers/
Content-Type: application/json

{
  "email": "nuevo@email.com"
}
```

#### Exportar Suscriptores (CSV)
```http
GET /api/subscribers/export/
```

**Response:** Archivo CSV con todos los suscriptores

### Configuraciones del Sistema

#### Obtener Configuraciones
```http
GET /api/configurations/
```

**Response:**
```json
[
  {
    "id": 1,
    "key": "company_name",
    "value": "Vehicle Sales Corp",
    "category": "general",
    "description": "Nombre de la empresa",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

#### Actualizar Configuración
```http
PUT /api/configurations/{id}/
Content-Type: application/json

{
  "value": "Nuevo Valor",
  "is_active": true
}
```

#### Configuraciones por Categoría
```http
GET /api/configurations/?category=general
GET /api/configurations/?category=appearance
GET /api/configurations/?category=notifications
GET /api/configurations/?category=security
```

### Dashboard y Estadísticas

#### Estadísticas Generales
```http
GET /api/dashboard/stats/
```

**Response:**
```json
{
  "total_cars": 25,
  "total_motorcycles": 15,
  "total_featured": 8,
  "total_contacts": 45,
  "total_subscribers": 120,
  "recent_activity": [
    {
      "action": "car_created",
      "description": "Nuevo auto agregado: BMW Serie 3",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Códigos de Estado HTTP

- `200 OK` - Solicitud exitosa
- `201 Created` - Recurso creado exitosamente
- `204 No Content` - Eliminación exitosa
- `400 Bad Request` - Datos inválidos
- `401 Unauthorized` - Token inválido o faltante
- `403 Forbidden` - Sin permisos
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

## Manejo de Errores

### Formato de Error Estándar
```json
{
  "error": "Descripción del error",
  "details": {
    "field": ["Este campo es requerido"]
  },
  "code": "VALIDATION_ERROR"
}
```

### Errores Comunes

#### Token Expirado
```json
{
  "error": "Token has expired",
  "code": "TOKEN_EXPIRED"
}
```

#### Validación de Campos
```json
{
  "error": "Validation failed",
  "details": {
    "email": ["Enter a valid email address"],
    "price": ["Ensure this value is greater than 0"]
  },
  "code": "VALIDATION_ERROR"
}
```

## Rate Limiting

- **Límite**: 100 requests por minuto por IP
- **Headers de respuesta**:
  - `X-RateLimit-Limit`: Límite total
  - `X-RateLimit-Remaining`: Requests restantes
  - `X-RateLimit-Reset`: Timestamp de reset

## CORS

La API está configurada para aceptar requests desde:
- `http://localhost:4200` (desarrollo)
- `https://[tu-frontend-domain]` (producción)

## Paginación

Los endpoints que retornan listas soportan paginación:

```http
GET /api/cars/?page=2&page_size=10
```

**Response:**
```json
{
  "count": 50,
  "next": "http://api.example.com/api/cars/?page=3",
  "previous": "http://api.example.com/api/cars/?page=1",
  "results": [...]
}
```

## Filtros y Búsqueda

### Filtros por Campos
```http
GET /api/cars/?brand=BMW&year=2023
GET /api/motorcycles/?price__gte=10000&price__lte=20000
```

### Búsqueda de Texto
```http
GET /api/cars/?search=BMW Serie
GET /api/contacts/?search=juan@email.com
```

### Ordenamiento
```http
GET /api/cars/?ordering=-created_at
GET /api/cars/?ordering=price
```
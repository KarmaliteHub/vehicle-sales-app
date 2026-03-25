# Development Guide - Vehicle Sales App

Esta guía describe cómo configurar el entorno de desarrollo y las mejores prácticas para contribuir al proyecto.

## Configuración del Entorno de Desarrollo

### Prerrequisitos

- **Python 3.8+**
- **Node.js 18+**
- **PostgreSQL 12+**
- **Git**
- **VS Code** (recomendado)

### Setup Inicial

#### 1. Clonar el Repositorio
```bash
git clone https://github.com/[tu-usuario]/vehicle-sales-app.git
cd vehicle-sales-app
```

#### 2. Configurar Backend
```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo .env
cp .env.example .env
# Editar .env con tus configuraciones
```

#### 3. Configurar Base de Datos
```bash
# Crear base de datos PostgreSQL
createdb vehicle_sales_dev

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Cargar datos iniciales
python manage.py populate_initial_configs
```

#### 4. Configurar Frontend
```bash
cd ../frontend-admin

# Instalar dependencias
npm install

# Configurar environment
cp src/environments/environment.example.ts src/environments/environment.ts
# Editar environment.ts con la URL del backend local
```

### Ejecutar en Desarrollo

#### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python manage.py runserver
```

#### Terminal 2 - Frontend
```bash
cd frontend-admin
ng serve
```

**URLs de desarrollo:**
- Backend API: http://localhost:8000/api/
- Admin Django: http://localhost:8000/admin/
- Frontend Angular: http://localhost:4200/

## Estructura del Proyecto

```
vehicle-sales-app/
├── backend/                    # Django REST API
│   ├── backend/               # Configuración principal
│   │   ├── settings.py        # Configuraciones Django
│   │   ├── urls.py           # URLs principales
│   │   └── wsgi.py           # WSGI application
│   ├── vehicles/              # App principal
│   │   ├── models.py         # Modelos de datos
│   │   ├── views.py          # Vistas de API
│   │   ├── serializers.py    # Serializers DRF
│   │   ├── urls.py           # URLs de la app
│   │   ├── admin.py          # Admin interface
│   │   ├── tests.py          # Tests unitarios
│   │   └── middleware.py     # Middleware personalizado
│   ├── media/                # Archivos de media
│   ├── requirements.txt      # Dependencias Python
│   └── manage.py            # Comando Django
├── frontend-admin/            # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Componentes Angular
│   │   │   ├── services/     # Servicios
│   │   │   ├── models/       # Interfaces TypeScript
│   │   │   └── styles/       # Estilos globales
│   │   ├── environments/     # Configuraciones de entorno
│   │   └── assets/          # Assets estáticos
│   ├── package.json         # Dependencias Node.js
│   └── angular.json         # Configuración Angular
├── docs/                     # Documentación
├── .github/                  # GitHub Actions
└── README.md                # Documentación principal
```

## Arquitectura del Backend

### Modelos Principales

#### Vehicle (Abstracto)
```python
class Vehicle(models.Model):
    title = models.CharField(max_length=200)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    image = models.ImageField(upload_to='vehicles/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    class Meta:
        abstract = True
```

#### Car y Motorcycle
```python
class Car(Vehicle):
    class Meta:
        db_table = 'vehicles_car'

class Motorcycle(Vehicle):
    class Meta:
        db_table = 'vehicles_motorcycle'
```

#### FeaturedItem
```python
class FeaturedItem(models.Model):
    VEHICLE_TYPES = [
        ('car', 'Car'),
        ('motorcycle', 'Motorcycle'),
    ]
    
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPES)
    vehicle_id = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
```

### API Views

#### ViewSets con DRF
```python
class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
```

#### Custom Views
```python
class AvailableCarsListView(generics.ListAPIView):
    serializer_class = CarSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Car.objects.exclude(
            id__in=FeaturedItem.objects.filter(
                vehicle_type='car'
            ).values_list('vehicle_id', flat=True)
        )
```

## Arquitectura del Frontend

### Estructura de Componentes

```
src/app/
├── components/
│   ├── dashboard/           # Dashboard principal
│   ├── vehicles/           # Gestión de vehículos
│   │   ├── cars/          # Componentes de autos
│   │   └── motorcycles/   # Componentes de motos
│   ├── featured/          # Elementos destacados
│   ├── discounts/         # Gestión de descuentos
│   ├── contacts/          # Mensajes de contacto
│   ├── subscribers/       # Gestión de suscriptores
│   └── settings/          # Configuraciones
├── services/              # Servicios Angular
│   ├── api.service.ts     # Servicio principal de API
│   ├── auth.service.ts    # Autenticación
│   └── configuration.service.ts  # Configuraciones
├── models/               # Interfaces TypeScript
└── guards/              # Guards de rutas
```

### Servicios Principales

#### ApiService
```typescript
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}
  
  // CRUD operations
  getCars(): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.baseUrl}/cars/`);
  }
  
  createCar(car: FormData): Observable<Car> {
    return this.http.post<Car>(`${this.baseUrl}/cars/`, car);
  }
}
```

#### AuthService
```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'access_token';
  
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login/`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem(this.tokenKey, response.access);
        })
      );
  }
}
```

## Flujo de Desarrollo

### 1. Crear Nueva Feature

#### Backend
```bash
# Crear nueva migración si es necesario
python manage.py makemigrations

# Aplicar migración
python manage.py migrate

# Crear tests
# Editar vehicles/tests.py

# Ejecutar tests
python manage.py test
```

#### Frontend
```bash
# Generar componente
ng generate component components/nueva-feature

# Generar servicio
ng generate service services/nueva-feature

# Generar interface
ng generate interface models/nueva-feature

# Ejecutar tests
ng test
```

### 2. Testing

#### Backend Tests
```python
# vehicles/tests.py
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from .models import Car

class CarAPITestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
    
    def test_create_car(self):
        data = {
            'title': 'Test Car',
            'brand': 'Toyota',
            'model': 'Camry',
            'year': 2023,
            'price': '25000.00',
            'description': 'Test description'
        }
        response = self.client.post('/api/cars/', data)
        self.assertEqual(response.status_code, 201)
```

#### Frontend Tests
```typescript
// components/cars/cars.component.spec.ts
describe('CarsComponent', () => {
  let component: CarsComponent;
  let fixture: ComponentFixture<CarsComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['getCars']);
    
    TestBed.configureTestingModule({
      declarations: [CarsComponent],
      providers: [
        { provide: ApiService, useValue: spy }
      ]
    });
    
    fixture = TestBed.createComponent(CarsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should load cars on init', () => {
    const mockCars = [{ id: 1, title: 'Test Car' }];
    apiService.getCars.and.returnValue(of(mockCars));
    
    component.ngOnInit();
    
    expect(component.cars).toEqual(mockCars);
  });
});
```

### 3. Code Style

#### Python (Backend)
```python
# Seguir PEP 8
# Usar black para formateo automático
pip install black
black .

# Usar flake8 para linting
pip install flake8
flake8 .
```

#### TypeScript (Frontend)
```bash
# Usar Prettier para formateo
npm install --save-dev prettier
npx prettier --write src/

# Usar ESLint para linting
ng lint
```

### 4. Git Workflow

#### Branching Strategy
```bash
# Crear rama para nueva feature
git checkout -b feature/nueva-funcionalidad

# Hacer commits descriptivos
git commit -m "feat: agregar endpoint para configuraciones"
git commit -m "fix: corregir error de validación en formulario"
git commit -m "docs: actualizar documentación de API"

# Push y crear PR
git push origin feature/nueva-funcionalidad
```

#### Commit Messages
Seguir [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan funcionalidad)
- `refactor:` Refactoring de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

## Debugging

### Backend Debugging

#### Django Debug Toolbar
```python
# settings.py (solo desarrollo)
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    INTERNAL_IPS = ['127.0.0.1']
```

#### Logging
```python
import logging
logger = logging.getLogger(__name__)

def my_view(request):
    logger.info(f"Processing request for user: {request.user}")
    # ... rest of the view
```

### Frontend Debugging

#### Angular DevTools
```bash
# Instalar Angular DevTools (Chrome Extension)
# Usar en browser developer tools
```

#### Console Debugging
```typescript
// Usar console.log para debugging
console.log('Component data:', this.cars);

// Usar debugger statement
debugger; // Pausa ejecución en DevTools
```

## Performance

### Backend Optimization

#### Database Queries
```python
# Usar select_related para ForeignKey
cars = Car.objects.select_related('created_by').all()

# Usar prefetch_related para ManyToMany
cars = Car.objects.prefetch_related('featureditem_set').all()

# Evitar N+1 queries
# Malo:
for car in cars:
    print(car.created_by.username)  # Query por cada car

# Bueno:
cars = Car.objects.select_related('created_by')
for car in cars:
    print(car.created_by.username)  # Una sola query
```

#### Caching
```python
from django.core.cache import cache

def expensive_operation():
    result = cache.get('expensive_key')
    if result is None:
        result = perform_expensive_calculation()
        cache.set('expensive_key', result, 300)  # 5 minutos
    return result
```

### Frontend Optimization

#### OnPush Change Detection
```typescript
@Component({
  selector: 'app-cars',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarsComponent {
  // Component implementation
}
```

#### Lazy Loading
```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'cars',
    loadChildren: () => import('./cars/cars.module').then(m => m.CarsModule)
  }
];
```

#### TrackBy Functions
```typescript
// Component
trackByCarId(index: number, car: Car): number {
  return car.id;
}

// Template
<div *ngFor="let car of cars; trackBy: trackByCarId">
  {{ car.title }}
</div>
```

## Herramientas de Desarrollo

### VS Code Extensions Recomendadas

#### Backend (Python)
- Python
- Pylance
- Python Docstring Generator
- Django
- GitLens

#### Frontend (Angular)
- Angular Language Service
- Angular Snippets
- TypeScript Importer
- Prettier
- ESLint

### Configuración VS Code

#### settings.json
```json
{
  "python.defaultInterpreterPath": "./backend/venv/bin/python",
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

#### launch.json (Debugging)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Django",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/backend/manage.py",
      "args": ["runserver"],
      "django": true
    }
  ]
}
```

## Troubleshooting Común

### Backend Issues

#### CORS Errors
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
    "http://127.0.0.1:4200",
]
```

#### Migration Conflicts
```bash
# Resolver conflictos de migración
python manage.py makemigrations --merge
```

#### Static Files Issues
```bash
# Recolectar archivos estáticos
python manage.py collectstatic --noinput
```

### Frontend Issues

#### Module Not Found
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### Build Errors
```bash
# Limpiar cache de Angular
ng cache clean
```

#### CORS in Development
```typescript
// proxy.conf.json
{
  "/api/*": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}

// angular.json
"serve": {
  "builder": "@angular-devkit/build-angular:dev-server",
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

## Recursos Adicionales

### Documentación
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)

### Herramientas
- [Postman](https://www.postman.com/) - Testing de API
- [pgAdmin](https://www.pgadmin.org/) - Administración PostgreSQL
- [Redis Desktop Manager](https://rdm.dev/) - Administración Redis

### Comunidad
- [Django Discord](https://discord.gg/xcRH6mN4fa)
- [Angular Discord](https://discord.gg/angular)
- [Stack Overflow](https://stackoverflow.com/)
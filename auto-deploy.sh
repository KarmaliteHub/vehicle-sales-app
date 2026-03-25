#!/bin/bash

# 🚀 Script de Despliegue Automático - Vehicle Sales App
# Configura y despliega backend y ambos frontends

echo "🚀 INICIANDO DESPLIEGUE AUTOMÁTICO"
echo "=================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] && [ ! -d "backend" ] && [ ! -d "frontend-admin" ] && [ ! -d "frontend-web" ]; then
    print_error "No estás en el directorio raíz del proyecto"
    exit 1
fi

print_status "Verificando estructura del proyecto..."

# Verificar directorios necesarios
if [ ! -d "backend" ]; then
    print_error "Directorio 'backend' no encontrado"
    exit 1
fi

if [ ! -d "frontend-admin" ]; then
    print_error "Directorio 'frontend-admin' no encontrado"
    exit 1
fi

if [ ! -d "frontend-web" ]; then
    print_error "Directorio 'frontend-web' no encontrado"
    exit 1
fi

print_success "Estructura del proyecto verificada"

# Verificar archivos de configuración
print_status "Verificando archivos de configuración..."

# Backend
if [ ! -f "backend/requirements.txt" ]; then
    print_error "backend/requirements.txt no encontrado"
    exit 1
fi

if [ ! -f "backend/runtime.txt" ]; then
    print_warning "backend/runtime.txt no encontrado, creando..."
    echo "python-3.11.0" > backend/runtime.txt
fi

if [ ! -f "backend/Procfile" ]; then
    print_warning "backend/Procfile no encontrado, creando..."
    echo "web: cd backend && gunicorn backend.wsgi:application --bind 0.0.0.0:\$PORT" > backend/Procfile
fi

# Frontend Admin
if [ ! -f "frontend-admin/package.json" ]; then
    print_error "frontend-admin/package.json no encontrado"
    exit 1
fi

if [ ! -f "frontend-admin/netlify.toml" ]; then
    print_warning "frontend-admin/netlify.toml no encontrado, ya debería existir"
fi

# Frontend Web
if [ ! -f "frontend-web/package.json" ]; then
    print_error "frontend-web/package.json no encontrado"
    exit 1
fi

if [ ! -f "frontend-web/netlify.toml" ]; then
    print_warning "frontend-web/netlify.toml no encontrado, ya debería existir"
fi

print_success "Archivos de configuración verificados"

# Verificar dependencias
print_status "Verificando dependencias..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js encontrado: $NODE_VERSION"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

NPM_VERSION=$(npm --version)
print_success "npm encontrado: $NPM_VERSION"

# Verificar Python
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    print_error "Python no está instalado"
    exit 1
fi

if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
else
    PYTHON_VERSION=$(python --version)
fi
print_success "Python encontrado: $PYTHON_VERSION"

# Instalar dependencias del backend
print_status "Instalando dependencias del backend..."
cd backend
if command -v python3 &> /dev/null; then
    python3 -m pip install -r requirements.txt
else
    python -m pip install -r requirements.txt
fi

if [ $? -eq 0 ]; then
    print_success "Dependencias del backend instaladas"
else
    print_error "Error instalando dependencias del backend"
    exit 1
fi
cd ..

# Instalar dependencias del frontend admin
print_status "Instalando dependencias del frontend admin..."
cd frontend-admin
npm install

if [ $? -eq 0 ]; then
    print_success "Dependencias del frontend admin instaladas"
else
    print_error "Error instalando dependencias del frontend admin"
    exit 1
fi
cd ..

# Instalar dependencias del frontend web
print_status "Instalando dependencias del frontend web..."
cd frontend-web
npm install

if [ $? -eq 0 ]; then
    print_success "Dependencias del frontend web instaladas"
else
    print_error "Error instalando dependencias del frontend web"
    exit 1
fi
cd ..

# Probar builds locales
print_status "Probando build del frontend admin..."
cd frontend-admin
npm run build:prod

if [ $? -eq 0 ]; then
    print_success "Build del frontend admin exitoso"
else
    print_error "Error en build del frontend admin"
    exit 1
fi
cd ..

print_status "Probando build del frontend web..."
cd frontend-web
npm run build

if [ $? -eq 0 ]; then
    print_success "Build del frontend web exitoso"
else
    print_error "Error en build del frontend web"
    exit 1
fi
cd ..

# Verificar configuración de Git
print_status "Verificando configuración de Git..."

if ! git remote -v | grep -q "origin"; then
    print_error "No hay remote 'origin' configurado"
    print_status "Configura el remote con: git remote add origin https://github.com/KarmaliteHub/vehicle-sales-app.git"
    exit 1
fi

REMOTE_URL=$(git remote get-url origin)
print_success "Remote configurado: $REMOTE_URL"

# Verificar que los cambios estén committeados
if ! git diff --quiet || ! git diff --cached --quiet; then
    print_warning "Hay cambios sin committear"
    print_status "Committeando cambios automáticamente..."
    
    git add .
    git commit -m "Auto-deploy: Configuración completa de despliegue con ambos frontends"
    
    if [ $? -eq 0 ]; then
        print_success "Cambios committeados"
    else
        print_error "Error committeando cambios"
        exit 1
    fi
fi

# Push a GitHub
print_status "Subiendo cambios a GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    print_success "Cambios subidos a GitHub"
else
    print_error "Error subiendo cambios a GitHub"
    exit 1
fi

# Mostrar instrucciones finales
echo ""
echo "🎉 CONFIGURACIÓN AUTOMÁTICA COMPLETADA"
echo "====================================="
echo ""
print_success "Todos los archivos están configurados y subidos a GitHub"
echo ""
print_status "PRÓXIMOS PASOS MANUALES:"
echo ""
echo "1. 🔧 RENDER (Backend):"
echo "   - Ir a https://render.com"
echo "   - Crear Web Service conectado a tu repo"
echo "   - Name: webvehicles-backend"
echo "   - Build Command: pip install -r backend/requirements.txt"
echo "   - Start Command: cd backend && python manage.py migrate && python manage.py populate_initial_configs && gunicorn backend.wsgi:application --bind 0.0.0.0:\$PORT"
echo ""
echo "2. 🌐 NETLIFY (Frontend Admin):"
echo "   - Ir a https://netlify.com"
echo "   - Crear sitio conectado a tu repo"
echo "   - Base directory: frontend-admin"
echo "   - Build command: npm run build:prod"
echo "   - Publish directory: dist/frontend-admin"
echo "   - Site name: vehicle-sales-admin"
echo ""
echo "3. 🌐 NETLIFY (Frontend Web):"
echo "   - Crear SEGUNDO sitio en Netlify"
echo "   - Base directory: frontend-web"
echo "   - Build command: npm run build"
echo "   - Publish directory: dist/frontend-web"
echo "   - Site name: vehicle-sales-web"
echo ""
echo "4. ✅ VERIFICACIÓN:"
echo "   - Ejecutar: python verify-complete-deployment.py"
echo ""
print_success "¡Listo para desplegar manualmente en las plataformas!"
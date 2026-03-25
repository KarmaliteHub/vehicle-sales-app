#!/usr/bin/env python3
"""
Script de verificación post-despliegue para Vehicle Sales App
Verifica que todos los servicios estén funcionando correctamente
"""

import requests
import json
import sys
from urllib.parse import urljoin

# URLs de los servicios desplegados
BACKEND_URL = "https://vehicle-sales-backend.onrender.com"
FRONTEND_URL = "https://vehicle-sales-admin.netlify.app"

def check_backend_health():
    """Verificar que el backend esté funcionando"""
    print("🔍 Verificando backend...")
    
    try:
        # Health check
        response = requests.get(f"{BACKEND_URL}/api/health/", timeout=30)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend health check: {data}")
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
            
        # API endpoints check
        endpoints = [
            "/api/cars/",
            "/api/motorcycles/",
            "/api/featured/",
            "/api/discounts/",
            "/api/contacts/",
            "/api/subscribers/",
            "/api/configurations/"
        ]
        
        for endpoint in endpoints:
            try:
                response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=15)
                if response.status_code in [200, 401]:  # 401 es OK para endpoints protegidos
                    print(f"✅ {endpoint}: OK")
                else:
                    print(f"❌ {endpoint}: {response.status_code}")
            except Exception as e:
                print(f"❌ {endpoint}: Error - {e}")
                
        return True
        
    except Exception as e:
        print(f"❌ Backend verification failed: {e}")
        return False

def check_frontend():
    """Verificar que el frontend esté accesible"""
    print("\n🔍 Verificando frontend...")
    
    try:
        response = requests.get(FRONTEND_URL, timeout=30)
        if response.status_code == 200:
            print(f"✅ Frontend accessible: {response.status_code}")
            
            # Verificar que contiene elementos Angular
            if "ng-version" in response.text or "angular" in response.text.lower():
                print("✅ Angular app detected")
            else:
                print("⚠️  Angular app not clearly detected")
                
            return True
        else:
            print(f"❌ Frontend not accessible: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Frontend verification failed: {e}")
        return False

def check_cors():
    """Verificar configuración CORS"""
    print("\n🔍 Verificando CORS...")
    
    try:
        headers = {
            'Origin': 'https://vehicle-sales-admin.netlify.app',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
        
        response = requests.options(f"{BACKEND_URL}/api/cars/", headers=headers, timeout=15)
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        }
        
        print(f"✅ CORS Headers: {cors_headers}")
        
        if cors_headers['Access-Control-Allow-Origin']:
            print("✅ CORS configured correctly")
            return True
        else:
            print("❌ CORS not configured properly")
            return False
            
    except Exception as e:
        print(f"❌ CORS verification failed: {e}")
        return False

def check_database():
    """Verificar conexión a base de datos"""
    print("\n🔍 Verificando base de datos...")
    
    try:
        # Intentar obtener datos que requieren DB
        response = requests.get(f"{BACKEND_URL}/api/cars/", timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Database connection OK - Found {len(data)} cars")
            return True
        elif response.status_code == 401:
            print("✅ Database connection OK (authentication required)")
            return True
        else:
            print(f"❌ Database connection issue: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Database verification failed: {e}")
        return False

def main():
    """Ejecutar todas las verificaciones"""
    print("🚀 Iniciando verificación de despliegue...\n")
    
    results = []
    
    # Ejecutar verificaciones
    results.append(("Backend Health", check_backend_health()))
    results.append(("Frontend Access", check_frontend()))
    results.append(("CORS Configuration", check_cors()))
    results.append(("Database Connection", check_database()))
    
    # Resumen
    print("\n" + "="*50)
    print("📊 RESUMEN DE VERIFICACIÓN")
    print("="*50)
    
    all_passed = True
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name:20} {status}")
        if not passed:
            all_passed = False
    
    print("="*50)
    
    if all_passed:
        print("🎉 ¡Todos los tests pasaron! El despliegue está funcionando correctamente.")
        print(f"\n🔗 URLs de la aplicación:")
        print(f"   Backend API: {BACKEND_URL}/api/")
        print(f"   Frontend:    {FRONTEND_URL}")
        sys.exit(0)
    else:
        print("⚠️  Algunos tests fallaron. Revisa la configuración.")
        sys.exit(1)

if __name__ == "__main__":
    main()
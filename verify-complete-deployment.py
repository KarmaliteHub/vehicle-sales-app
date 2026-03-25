#!/usr/bin/env python3
"""
Script de Verificación Completa de Despliegue
Verifica que backend y ambos frontends estén funcionando correctamente
"""

import requests
import json
import sys
from urllib.parse import urljoin

# URLs de los servicios desplegados
BACKEND_URL = "https://webvehicles-backend.onrender.com"
FRONTEND_ADMIN_URL = "https://vehicle-sales-admin.netlify.app"
FRONTEND_WEB_URL = "https://vehicle-sales-web.netlify.app"

def test_backend_health():
    """Probar health check del backend"""
    print("🔍 Probando Backend Health Check...")
    try:
        response = requests.get(f"{BACKEND_URL}/api/health/", timeout=30)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend Health Check: {data}")
            return True
        else:
            print(f"❌ Backend Health Check falló: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error conectando al backend: {e}")
        return False

def test_backend_api_endpoints():
    """Probar endpoints principales de la API"""
    print("\n🔍 Probando Endpoints de API...")
    
    endpoints = [
        "/api/cars/",
        "/api/motorcycles/", 
        "/api/featured/",
        "/api/available-cars/",
        "/api/available-motorcycles/",
        "/api/contact-messages/",
        "/api/subscribers/"
    ]
    
    results = []
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=15)
            if response.status_code in [200, 401]:  # 401 es OK para endpoints protegidos
                print(f"✅ {endpoint}: {response.status_code}")
                results.append(True)
            else:
                print(f"❌ {endpoint}: {response.status_code}")
                results.append(False)
        except Exception as e:
            print(f"❌ {endpoint}: Error - {e}")
            results.append(False)
    
    return all(results)

def test_cors_headers():
    """Probar que los headers CORS estén configurados"""
    print("\n🔍 Probando Headers CORS...")
    try:
        response = requests.options(f"{BACKEND_URL}/api/cars/", 
                                  headers={'Origin': FRONTEND_ADMIN_URL})
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        }
        
        if any(cors_headers.values()):
            print("✅ Headers CORS configurados:")
            for header, value in cors_headers.items():
                if value:
                    print(f"   {header}: {value}")
            return True
        else:
            print("❌ Headers CORS no encontrados")
            return False
    except Exception as e:
        print(f"❌ Error probando CORS: {e}")
        return False

def test_frontend(url, name):
    """Probar que un frontend esté accesible"""
    print(f"\n🔍 Probando {name}...")
    try:
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            print(f"✅ {name} accesible: {response.status_code}")
            
            # Verificar que contiene contenido Angular
            if 'ng-version' in response.text or 'angular' in response.text.lower():
                print(f"✅ {name} contiene aplicación Angular")
                return True
            else:
                print(f"⚠️  {name} accesible pero puede no ser aplicación Angular")
                return True
        else:
            print(f"❌ {name} no accesible: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error accediendo a {name}: {e}")
        return False

def test_media_files():
    """Probar que los archivos media se sirvan correctamente"""
    print("\n🔍 Probando Servicio de Archivos Media...")
    try:
        # Probar endpoint de media files
        response = requests.get(f"{BACKEND_URL}/media/", timeout=15)
        # Cualquier respuesta que no sea error de conexión es buena
        print(f"✅ Endpoint de media responde: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ Error probando media files: {e}")
        return False

def main():
    """Ejecutar todas las pruebas"""
    print("🚀 VERIFICACIÓN COMPLETA DE DESPLIEGUE")
    print("=" * 50)
    
    tests = [
        ("Backend Health Check", test_backend_health),
        ("API Endpoints", test_backend_api_endpoints), 
        ("CORS Headers", test_cors_headers),
        ("Frontend Admin", lambda: test_frontend(FRONTEND_ADMIN_URL, "Frontend Admin")),
        ("Frontend Web", lambda: test_frontend(FRONTEND_WEB_URL, "Frontend Web")),
        ("Media Files", test_media_files)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Error en {test_name}: {e}")
            results.append((test_name, False))
    
    # Resumen final
    print("\n" + "=" * 50)
    print("📊 RESUMEN DE VERIFICACIÓN")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\n📈 Resultado: {passed}/{total} pruebas pasaron")
    
    if passed == total:
        print("🎉 ¡DESPLIEGUE COMPLETAMENTE FUNCIONAL!")
        print("\n🎯 URLs Finales:")
        print(f"   Backend API: {BACKEND_URL}/api/")
        print(f"   Frontend Admin: {FRONTEND_ADMIN_URL}/")
        print(f"   Frontend Web: {FRONTEND_WEB_URL}/")
        return 0
    else:
        print("⚠️  Algunos servicios tienen problemas. Revisar configuración.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
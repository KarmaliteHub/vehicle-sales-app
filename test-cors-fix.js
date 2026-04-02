// Script para probar la corrección de CORS
// Ejecutar en la consola del navegador en https://adminwebvehicles.netlify.app

console.log('=== PRUEBA DE CORRECCIÓN CORS ===');

const API_URL = 'https://vehicle-sales-backend.onrender.com/api';

// Test 1: Health Check
console.log('🔍 Test 1: Health Check');
fetch(`${API_URL}/health/`)
  .then(response => {
    console.log('✅ Health Check - Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Health Check - Data:', data);
  })
  .catch(error => {
    console.error('❌ Health Check - Error:', error);
  });

// Test 2: Social Media Public Endpoint
console.log('🔍 Test 2: Social Media API');
fetch(`${API_URL}/social-media/public/`)
  .then(response => {
    console.log('✅ Social Media - Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Social Media - Data:', data);
    console.log('📊 Social Media Count:', data.length);
  })
  .catch(error => {
    console.error('❌ Social Media - Error:', error);
  });

// Test 3: Token Endpoint (el que estaba fallando)
console.log('🔍 Test 3: Token Endpoint (POST)');
fetch(`${API_URL}/token/`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'test',
    password: 'test'
  })
})
.then(response => {
  console.log('✅ Token Test - Status:', response.status);
  // Esperamos 400 o 401 (credenciales incorrectas), no error CORS
  if (response.status === 400 || response.status === 401) {
    console.log('✅ CORS funcionando - Error de credenciales esperado');
  }
  return response.json();
})
.then(data => {
  console.log('✅ Token Test - Response:', data);
})
.catch(error => {
  console.error('❌ Token Test - Error:', error);
  if (error.message.includes('CORS')) {
    console.error('❌ CORS aún no está funcionando');
  }
});

// Test 4: Verificar headers CORS
console.log('🔍 Test 4: Verificar Headers CORS');
fetch(`${API_URL}/health/`, {
  method: 'OPTIONS'
})
.then(response => {
  console.log('✅ OPTIONS Request - Status:', response.status);
  console.log('✅ CORS Headers:');
  console.log('  - Access-Control-Allow-Origin:', response.headers.get('Access-Control-Allow-Origin'));
  console.log('  - Access-Control-Allow-Methods:', response.headers.get('Access-Control-Allow-Methods'));
  console.log('  - Access-Control-Allow-Headers:', response.headers.get('Access-Control-Allow-Headers'));
})
.catch(error => {
  console.error('❌ OPTIONS Request - Error:', error);
});

setTimeout(() => {
  console.log('\n=== RESUMEN ===');
  console.log('Si ves ✅ en los tests anteriores, CORS está funcionando');
  console.log('Si ves ❌ con errores CORS, el backend necesita ser redespliegado');
  console.log('\n💡 Próximos pasos si CORS funciona:');
  console.log('1. Redesplegar frontends con las URLs corregidas');
  console.log('2. Poblar datos iniciales en el backend');
  console.log('3. Probar funcionalidad completa');
}, 5000);
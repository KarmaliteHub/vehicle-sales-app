// Script para verificar cuál backend está funcionando
// Ejecutar con: node check-backend-status.js

const https = require('https');

const backends = [
    'https://vehicle-sales-backend.onrender.com',
    'https://webvehicles-backend.onrender.com'
];

function checkBackend(url) {
    return new Promise((resolve) => {
        const healthUrl = `${url}/api/health/`;
        console.log(`🔍 Verificando: ${healthUrl}`);
        
        const req = https.get(healthUrl, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    console.log(`✅ ${url} - Status: ${res.statusCode}`);
                    console.log(`   Response:`, parsed);
                    resolve({ url, status: res.statusCode, data: parsed, working: true });
                } catch (e) {
                    console.log(`⚠️  ${url} - Status: ${res.statusCode}, Invalid JSON`);
                    resolve({ url, status: res.statusCode, working: false });
                }
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ ${url} - Error: ${error.message}`);
            resolve({ url, error: error.message, working: false });
        });
        
        req.setTimeout(10000, () => {
            console.log(`⏰ ${url} - Timeout`);
            req.destroy();
            resolve({ url, error: 'Timeout', working: false });
        });
    });
}

async function checkAllBackends() {
    console.log('=== VERIFICACIÓN DE BACKENDS ===\n');
    
    const results = await Promise.all(backends.map(checkBackend));
    
    console.log('\n=== RESUMEN ===');
    const workingBackends = results.filter(r => r.working);
    
    if (workingBackends.length === 0) {
        console.log('❌ Ningún backend está funcionando');
        console.log('\n💡 SOLUCIONES:');
        console.log('1. Verificar que el servicio esté desplegado en Render');
        console.log('2. Revisar los logs del servicio en Render');
        console.log('3. Verificar las variables de entorno');
    } else {
        console.log(`✅ Backends funcionando: ${workingBackends.length}`);
        workingBackends.forEach(backend => {
            console.log(`   - ${backend.url}`);
        });
        
        console.log('\n📝 CONFIGURACIÓN RECOMENDADA:');
        const mainBackend = workingBackends[0];
        console.log(`Backend URL: ${mainBackend.url}/api`);
        console.log('\nActualizar en:');
        console.log('- frontend-admin/src/environments/environment.prod.ts');
        console.log('- frontend-web/src/environments/environment.prod.ts');
        console.log('- Netlify environment variables');
    }
}

checkAllBackends().catch(console.error);
// Script para probar la funcionalidad de redes sociales en frontend-web
// Ejecutar en la consola del navegador en la página del frontend-web

console.log('=== PRUEBA DE REDES SOCIALES FRONTEND-WEB ===');

// 1. Verificar que el componente existe
const appComponent = document.querySelector('app-root');
if (appComponent) {
    console.log('✅ Componente app-root encontrado');
} else {
    console.error('❌ Componente app-root no encontrado');
}

// 2. Verificar que el footer existe
const footer = document.querySelector('.main-footer');
if (footer) {
    console.log('✅ Footer encontrado');
} else {
    console.error('❌ Footer no encontrado');
}

// 3. Verificar que la sección de redes sociales existe
const socialLinks = document.querySelector('.social-links');
if (socialLinks) {
    console.log('✅ Sección de redes sociales encontrada');
    
    // Contar enlaces
    const links = socialLinks.querySelectorAll('a');
    console.log(`📊 Enlaces encontrados: ${links.length}`);
    
    links.forEach((link, index) => {
        const icon = link.querySelector('mat-icon');
        console.log(`Link ${index + 1}:`, {
            href: link.href,
            title: link.title,
            icon: icon ? icon.textContent : 'No icon'
        });
    });
} else {
    console.error('❌ Sección de redes sociales no encontrada');
}

// 4. Simular datos de redes sociales para probar la funcionalidad
console.log('\n=== SIMULANDO DATOS DE REDES SOCIALES ===');

// Datos de prueba
const mockSocialMedia = [
    {
        name: 'Facebook',
        url: 'https://facebook.com/karmalitemotors',
        icon: 'facebook'
    },
    {
        name: 'Instagram', 
        url: 'https://instagram.com/karmalitemotors',
        icon: 'instagram'
    },
    {
        name: 'Twitter',
        url: 'https://twitter.com/karmalitemotors', 
        icon: 'twitter'
    }
];

// Intentar acceder al componente Angular y actualizar los datos
try {
    // Buscar el componente Angular en el DOM
    const ngComponent = ng.getComponent(appComponent);
    if (ngComponent && ngComponent.socialMediaList !== undefined) {
        console.log('✅ Componente Angular encontrado');
        console.log('📊 socialMediaList actual:', ngComponent.socialMediaList);
        
        // Actualizar con datos de prueba
        ngComponent.socialMediaList = mockSocialMedia;
        
        // Forzar detección de cambios
        const cdr = ng.getInjector(appComponent).get(ng.core.ChangeDetectorRef);
        cdr.detectChanges();
        
        console.log('✅ Datos de prueba aplicados');
        
        // Verificar cambios en el DOM después de un momento
        setTimeout(() => {
            const updatedLinks = document.querySelectorAll('.social-links a');
            console.log(`📊 Enlaces después de la actualización: ${updatedLinks.length}`);
            
            updatedLinks.forEach((link, index) => {
                const icon = link.querySelector('mat-icon');
                console.log(`Link actualizado ${index + 1}:`, {
                    href: link.href,
                    title: link.title,
                    icon: icon ? icon.textContent : 'No icon'
                });
            });
        }, 1000);
        
    } else {
        console.warn('⚠️ No se pudo acceder al componente Angular o socialMediaList');
    }
} catch (error) {
    console.error('❌ Error al acceder al componente Angular:', error);
}

// 5. Verificar la configuración del API
console.log('\n=== VERIFICANDO CONFIGURACIÓN DEL API ===');
try {
    // Intentar hacer una petición al API
    fetch('https://webvehicles-backend.onrender.com/api/social-media/public/')
        .then(response => {
            console.log('📡 Respuesta del API:', response.status, response.statusText);
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        })
        .then(data => {
            console.log('✅ Datos del API:', data);
        })
        .catch(error => {
            console.error('❌ Error del API:', error);
            console.log('💡 Sugerencia: Verificar que el backend esté funcionando');
        });
} catch (error) {
    console.error('❌ Error al hacer petición al API:', error);
}

console.log('\n=== FIN DE LA PRUEBA ===');
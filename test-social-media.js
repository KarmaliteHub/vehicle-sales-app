// Script de prueba para verificar que las redes sociales se cargan correctamente
// Ejecutar en la consola del navegador en http://localhost:4201

console.log('=== PRUEBA DE REDES SOCIALES ===');

// Verificar que el API endpoint funciona
fetch('http://localhost:8000/api/social-media/public/')
  .then(response => {
    console.log('Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Social media data from API:', data);
    
    // Verificar que los datos se muestran en el DOM
    setTimeout(() => {
      const socialLinks = document.querySelectorAll('.social-links a');
      console.log('Social links found in DOM:', socialLinks.length);
      
      socialLinks.forEach((link, index) => {
        console.log(`Link ${index + 1}:`, {
          href: link.href,
          title: link.title,
          icon: link.querySelector('mat-icon')?.textContent
        });
      });
      
      if (socialLinks.length === 0) {
        console.warn('⚠️ No se encontraron enlaces de redes sociales en el DOM');
        
        // Verificar si hay fallback
        const fallbackLinks = document.querySelectorAll('.social-links a[href="#"]');
        if (fallbackLinks.length > 0) {
          console.log('Se encontraron enlaces de fallback:', fallbackLinks.length);
        }
      } else {
        console.log('✅ Redes sociales cargadas correctamente');
      }
    }, 2000);
  })
  .catch(error => {
    console.error('❌ Error al cargar redes sociales:', error);
  });
// Service Worker Registration Fix
// This ensures proper service worker registration with correct MIME type

if ('serviceWorker' in navigator) {
  // Get the current origin to ensure we're using the right port
  const currentOrigin = window.location.origin;
  const swPath = `${currentOrigin}/sw.js`;
  
  console.log('Attempting to register service worker from:', swPath);
  
  navigator.serviceWorker.register(swPath, {
    scope: '/',
    type: 'classic'
  })
  .then(function(registration) {
    console.log('✅ Service Worker registered successfully:', registration.scope);
    console.log('Service Worker active:', registration.active);
    
    // Check for updates
    registration.addEventListener('updatefound', function() {
      console.log('🔄 Service Worker update found');
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', function() {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('🔄 New service worker installed, reloading...');
          window.location.reload();
        }
      });
    });
  })
  .catch(function(error) {
    console.error('❌ Service Worker registration failed:', error);
    
    // Try alternative registration methods
    console.log('Trying alternative registration...');
    
    // Method 1: Try with different scope
    navigator.serviceWorker.register('/sw.js', { scope: './' })
      .then(function(registration) {
        console.log('✅ Alternative registration successful:', registration.scope);
      })
      .catch(function(error2) {
        console.error('❌ Alternative registration also failed:', error2);
        
        // Method 2: Try registering from dev-dist
        navigator.serviceWorker.register('/dev-dist/sw.js', { scope: '/' })
          .then(function(registration) {
            console.log('✅ Dev-dist registration successful:', registration.scope);
          })
          .catch(function(error3) {
            console.error('❌ All registration methods failed:', error3);
            console.log('Service worker disabled for this session');
          });
      });
  });
} else {
  console.log('Service workers not supported in this browser');
}

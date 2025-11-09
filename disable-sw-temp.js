// Temporary service worker disable
// Add this to your main.tsx temporarily to disable service worker

if ('serviceWorker' in navigator) {
  // Unregister all existing service workers
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
  
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    });
  }
  
  console.log('Service worker disabled and caches cleared');
}

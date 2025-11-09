// Service Worker Unregister Script
// Run this in your browser's console to unregister the service worker

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    console.log('Found', registrations.length, 'service worker registrations');
    
    for(let registration of registrations) {
      console.log('Unregistering service worker:', registration.scope);
      registration.unregister().then(function(boolean) {
        console.log('Service worker unregistered:', boolean);
      });
    }
    
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(function(cacheNames) {
        console.log('Found', cacheNames.length, 'caches');
        return Promise.all(
          cacheNames.map(function(cacheName) {
            console.log('Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(function() {
        console.log('All caches cleared');
        console.log('Please refresh the page now');
      });
    }
  });
} else {
  console.log('Service workers not supported');
}

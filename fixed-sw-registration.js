// Fixed Service Worker Registration
// This handles the MIME type and scope issues properly

if ('serviceWorker' in navigator) {
  console.log('🔧 Attempting to register service worker...');
  
  // Method 1: Try registering from dev-dist with proper scope
  navigator.serviceWorker.register('/dev-dist/sw.js', {
    scope: '/dev-dist/'
  })
  .then(function(registration) {
    console.log('✅ Service Worker registered successfully from dev-dist:', registration.scope);
    
    // Update the scope to root if possible
    if (registration.scope !== '/') {
      console.log('⚠️ Service worker scope limited to:', registration.scope);
      console.log('This is normal for development mode');
    }
  })
  .catch(function(error) {
    console.error('❌ Dev-dist registration failed:', error);
    
    // Method 2: Try registering from root with different approach
    navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })
    .then(function(registration) {
      console.log('✅ Service Worker registered successfully from root:', registration.scope);
    })
    .catch(function(error2) {
      console.error('❌ Root registration also failed:', error2);
      
      // Method 3: Try with explicit MIME type handling
      fetch('/sw.js')
        .then(response => {
          if (response.headers.get('content-type')?.includes('text/html')) {
            console.error('❌ Server is serving sw.js as HTML instead of JavaScript');
            console.log('This is a server configuration issue');
            return;
          }
          
          // If MIME type is correct, try registration again
          return navigator.serviceWorker.register('/sw.js', { scope: '/' });
        })
        .then(function(registration) {
          if (registration) {
            console.log('✅ Service Worker registered after MIME type check:', registration.scope);
          }
        })
        .catch(function(error3) {
          console.error('❌ All registration methods failed:', error3);
          console.log('💡 Service worker disabled for this session');
          console.log('💡 This is normal in development mode with some configurations');
        });
    });
  });
} else {
  console.log('❌ Service workers not supported in this browser');
}

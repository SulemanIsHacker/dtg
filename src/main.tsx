
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom';

if (import.meta.env.DEV) {
  console.log('main.tsx starting to load');
  console.log('Environment:', import.meta.env.MODE);
}
if (import.meta.env.DEV) {
  console.log('Base URL:', import.meta.env.BASE_URL);
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Root element not found!');
  // Create a fallback message directly in the body
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Loading Error</h1><p>Root element not found. Please refresh the page.</p></div>';
  throw new Error('Root element not found');
}

if (import.meta.env.DEV) {
  console.log('Root element found, creating React root');
}

try {
  createRoot(rootElement).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  if (import.meta.env.DEV) {
    console.log('React app rendered successfully');
  }
} catch (error) {
  console.error('Error rendering React app:', error);
  // Show a user-friendly error message
  rootElement.innerHTML = '<div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;"><h1 style="color: #ef4444;">Application Error</h1><p>There was an error loading the application. Please try refreshing the page.</p><button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Refresh Page</button></div>';
}

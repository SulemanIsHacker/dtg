import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';

// Simplified Vite config for better Netlify compatibility
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'dtg.jpeg', 'offline.html'],
      manifest: {
        name: 'DAILYTECH TOOLS SOLUTIONS - Premium Tools at Unbeatable Prices',
        short_name: 'DAILYTECH TOOLS SOLUTIONS',
        description: 'Get access to premium AI tools, SEO software, design tools, and more at affordable shared prices.',
        theme_color: '#d9b650',
        background_color: '#000000',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'dtg.jpeg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'dtg.jpeg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/offline.html'
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          motion: ['framer-motion'],
          charts: ['chart.js', 'react-chartjs-2', 'recharts'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      '@supabase/supabase-js',
      'lucide-react',
    ],
  },
}));

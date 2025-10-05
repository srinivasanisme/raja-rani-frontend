// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // PWA support

export default defineConfig({
  plugins: [
    react(), // React support
    VitePWA({
      registerType: 'autoUpdate', // auto-update service worker
      manifest: {
        name: 'Raja Rani Multiplayer',
        short_name: 'RajaRani',
        start_url: '/',             // app entry
        display: 'standalone',      // makes it installable
        background_color: '#ffffff',
        theme_color: '#ff5722',
        icons: [
          {
            src: 'icon-192x192.png', // place these in public/
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173, // dev server port
    open: true  // auto-open browser
  },
  resolve: {
    alias: {
      '@': '/src' // optional: use @ to reference src folder
    }
  }
});

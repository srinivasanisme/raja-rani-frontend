// vite.config.js
import { defineConfig } from 'vite';          // Vite config helper
import react from '@vitejs/plugin-react';    // React plugin for Vite (handles JSX, fast refresh)

// Export Vite configuration
export default defineConfig({
  plugins: [react()],                        // Include React plugin
  server: {
    port: 5173,                              // Optional: set dev server port
    open: true                               // Optional: auto open in browser on `npm run dev`
  },
  resolve: {
    alias: {
      '@': '/src'                            // Optional: use @ to reference src folder
    }
  }
});

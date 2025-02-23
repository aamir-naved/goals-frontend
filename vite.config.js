import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],  // Ensure important files are cached
      },
      manifest: {
        name: "Accountability App",
        short_name: "Accountability",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          {
            src: "/reach.png",
            sizes: "192x192",
            type: "image/png"
          }
        ]
      },
      devOptions: {
        enabled: true, // Enables PWA support in development mode
        type: "module",
      }
    })
  ]
});

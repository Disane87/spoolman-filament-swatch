import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/spoolman-filament-swatch/' : '/',
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/spoolman": {
        target: "https://spoolman.disane.dev",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/spoolman/, ""),
      },
    },
  },
});

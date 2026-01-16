import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
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

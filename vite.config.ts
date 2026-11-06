import path from "node:path";
import { defineConfig, type PluginOption } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

const hostedMode = process.env.VITE_HOSTED_MODE === "1";

const hostedIndexPlugin: PluginOption = {
  name: "hosted-index-shell",
  transformIndexHtml(html) {
    if (!hostedMode) {
      return html;
    }

    return html
      .replace(/\s*<link rel="manifest"[^>]*>\n?/g, "")
      .replace(/\s*<link rel="search"[^>]*>\n?/g, "")
      .replace(/\s*<link rel="canonical"[^>]*>\n?/g, "");
  },
};

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [vue(), tailwindcss(), hostedIndexPlugin],
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

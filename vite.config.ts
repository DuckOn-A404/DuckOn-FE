import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis'
  },
  server: {
  proxy: {
    '/ws': {
      target: 'http://localhost:8080',
      ws: true, // 꼭 필요!
    }
  }
}
});

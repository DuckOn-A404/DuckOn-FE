import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	define: {
		global: "globalThis",
	},
	server: {
		proxy: {
			// ✅ WebSocket용 프록시 설정 (로컬 개발 환경에서만 유효)
			"/ws-chat": {
				target: "http://localhost:8080",
				ws: true, // 반드시 true 설정!
				changeOrigin: true,
				secure: false,
			},
			"/api": {
				target: "http://localhost:8080",
				changeOrigin: true,
				rewrite: (p) => p.replace(/^\/api/, ""),
			},
			"/oauth2": {
				target: "http://localhost:8080",
				changeOrigin: true,
			},
			"/login/oauth2": {
				target: "http://localhost:8080",
				changeOrigin: true,
			},
		},
	},
});

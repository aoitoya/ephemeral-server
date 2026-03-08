// vite.config.ts

import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";
import viteCompression from "vite-plugin-compression";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, import.meta.dirname, "");

	return {
		plugins: [
			tanstackRouter({
				target: "react",
			}),
			react(),
			viteCompression({
				algorithm: "gzip",
				ext: ".gz",
			}),
		],
		resolve: {
			alias: {
				"@": resolve(__dirname, "src"),
			},
		},
		server: {
			proxy: {
				"/api": {
					target: env.VITE_API_URL,
					changeOrigin: true,
					secure: true,
				},
				"/socket.io": {
					target: env.VITE_API_URL,
					changeOrigin: true,
					secure: true,
					ws: true,
				},
			},
		},
	};
});

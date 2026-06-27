import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
// dev 模式下 /api 代理到后端 8080；生产由后端同源提供
export default defineConfig({
    plugins: [vue()],
    resolve: { alias: { "@": resolve(__dirname, "src") } },
    server: {
        port: 6002,
        open: false,
        proxy: {
            "/api": { target: "http://localhost:8080", changeOrigin: true }
        }
    }
});

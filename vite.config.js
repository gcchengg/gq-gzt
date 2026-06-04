import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    server: {
        port: 5173,
    },
    plugins: [
        react(),
        tailwindcss(),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules/react") ||
                        id.includes("node_modules/react-dom") ||
                        id.includes("node_modules/react-router-dom")) {
                        return "react-vendor";
                    }
                },
            },
        },
    },
    optimizeDeps: {
        include: ["react/jsx-runtime"],
    },
});

import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    // Ensure Vite resolves .jsx files when no extension is specified in imports
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    server: {
        hmr: true,
        watch: {
            ignored: [
                "**/routes/**",
                "**/app/**",
                "**/database/**",
                "**/resources/views/**",
            ],
        },
    },
    plugins: [
        laravel({
            input: [
                "resources/css/app.css",
                "resources/sass/app.scss",
                "resources/js/app.jsx",
            ],
            refresh: true,
        }),
        tailwindcss(),
        react(),
    ],
});

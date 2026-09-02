import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const PORT = 3000;

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    reportCompressedSize: false, // Skip reporting compressed sizes to speed up build output
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          mui: ["@mui/material", "@emotion/react", "@emotion/styled"],
        },
      },
    },
  },
  server: {
    port: PORT,
    open: true,
    historyApiFallback: true,
  },
});

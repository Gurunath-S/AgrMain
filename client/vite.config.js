
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const PORT = 3000;

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          mui: ["@mui/material", "@emotion/react", "@emotion/styled"],
          muiIcons: ["@mui/icons-material"],
          muiPickers: ["@mui/x-date-pickers"],
          reactIcons: ["react-icons"],
          pdf: ["jspdf"],
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

console.log(`Vite server is running on http://localhost:${PORT}`);

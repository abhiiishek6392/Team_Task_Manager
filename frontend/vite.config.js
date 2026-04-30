import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true // Helpful for Railway deployments
  },
  preview: {
    allowedHosts: true // This tells Vite to allow the Railway domain
  }
});
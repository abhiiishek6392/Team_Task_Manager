import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Listen on all local IPs
  },
  preview: {
    port: 5173,
    host: true,
    allowedHosts: true // Using a boolean true often bypasses the array requirement in newer Vite versions
  }
});
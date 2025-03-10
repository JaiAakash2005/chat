import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: true, // Ensure this is enabled for HMR to work correctly
  },
});

import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://api:3006"
    }
  }
});
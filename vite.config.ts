/// <reference types="vitest/config" />
import { defineConfig } from "vite";

// https://vite.dev/config/
/// <reference types="vitest/config" />
export default defineConfig({
  server: {
    port: 5173,
    open: true,
    host: true,
  },
test: {
    globals: true,
    browser: {
      enabled: true,
      name: "firefox", // or "firefox", "safari" depending on what you have installed
      headless: false, // 👈 keep browser window open
    },
    include: ["tests/**/*.test.ts"]
  },
});

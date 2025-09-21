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
      provider: "playwright",
      enabled: true,
      instances: [
        {
          browser: "firefox", // must be "browser", not "name"
          headless: true, // headless in CI
        },
        // you can add more instances if needed
        // { browser: "chromium", headless: true }
      ],
    },
    include: ["tests/**/*.test.ts"],
  },
});

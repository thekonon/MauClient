/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@mnauConfig": path.resolve(__dirname, "mnau.config.ts"),
    },
  },
  server: {
    port: 5173,
    open: true,
    host: true,
  },
  test: {
    globals: true,
    // environment: "jsdom",
    browser: {
      enabled: true,
      provider: "playwright",
      instances: [
        {
          browser: "firefox", // Supported browsers: firefox, webkit, chromium.
          headless: true, // headless in CI
        },
      ],
    },
    setupFiles: ["./setupTests.ts"],
    include: ["tests/**/*.test.ts"],
    coverage: {
      "provider": "istanbul"
    }
  },
});

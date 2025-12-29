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
    // environment: "jsdom",
    browser: {
      enabled: true,
      provider: "playwright",
      instances: [
        {
          browser: "firefox", // must be "browser", not "name"
          headless: true, // headless in CI
        },
      ],
    },
    // setupFiles: ["./setupTests.ts"],
    include: ["tests/**/*.test.ts"],
  },
});

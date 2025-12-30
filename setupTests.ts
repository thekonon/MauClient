import { beforeEach, afterEach, vi } from "vitest";
import { Application } from "pixi.js";
import { GameSettings } from "./src/gameSettings";

// Mock console methods to avoid noise in tests
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

export let app: Application;

beforeEach(async () => {
  console.error = vi.fn();
  console.warn = vi.fn();
  console.log = vi.fn();

  const canvasWidth = 414;
  const canvasHeight = 896;

  GameSettings.setScreenDimensions(canvasHeight, canvasWidth);

  app = new Application();
  await app.init({
    background: "#1099bb",
    width: canvasWidth,
    height: canvasHeight,
  });

  document.body.appendChild(app.canvas);
});

afterEach(() => {
  console.error = originalError;
  console.warn = originalWarn;
  console.log = originalLog;
});

// Mock window.alert
Object.defineProperty(window, 'alert', {
  writable: true,
  value: vi.fn(),
});

// Global test utilities can be added here
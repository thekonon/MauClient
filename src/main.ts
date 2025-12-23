import { Application } from "pixi.js";
import { GameSettings } from "./gameSettings.ts";
import { Game } from "./game/game.ts";
import { LoadingScreen } from "./loadingScreen/loadingScreen.ts";
import { WebSocketHandle } from "./websocketHandle.ts";
import { EndScreen } from "./endScreen/endScreen.ts";
import { CardManager } from "./loadingScreen/CardManage.ts";

(async () => {
  const loading_screen = new LoadingScreen();
  loading_screen.show();

  // Create a game instance
  const app = new Application();
  await app.init({ background: "#1099bb", resizeTo: window });

  document.getElementById("pixi-container")!.appendChild(app.canvas);
  const cardManager = new CardManager(app);
  await cardManager.loadCardTextures();
  cardManager.createFallingCards(50);

  GameSettings.setScreenDimensions(window.innerHeight, window.innerWidth);
  
  new WebSocketHandle();
  new Game(app);
  new EndScreen(app);
  
})();

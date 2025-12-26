import { Application } from "pixi.js";
import { GameSettings } from "./gameSettings.ts";
import { Game } from "./game/game.ts";
import { LoadingScreen } from "./loadingScreen/loadingScreen.ts";
import { WebSocketHandle } from "./websocketHandle.ts";
import { EndScreen } from "./endScreen/endScreen.ts";
import { CardManager } from "./loadingScreen/CardManage.ts";
import { eventBus } from "./eventBus.ts";

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
  const ends  = new EndScreen(app);
  // eventBus.emit('Action:START_GAME', undefined);
  // ends.setWinners(["k", "m"])
  // await new Promise((res) => setTimeout(res, 1000));
  // eventBus.emit('Action:END_GAME', undefined);
  // await new Promise((res) => setTimeout(res, 1000));
  // eventBus.emit('Action:START_GAME', undefined);

  // implement ready state
  // show lobby/game id + (name)
  // DESTROY = disable playagain
  // remaining time na sekundy
  // on disqualified - reload page
  // show player rank in the middle of game 
  // disable connect buttons after connecting
  // add disconnect
  // freeze form when connected
  // try to reconnect try
  // cglobal card skin selection
  // card stacking
})();

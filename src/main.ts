import { Application } from "pixi.js";
import { GameSettings } from "./gameSettings.ts";
import { Game } from "./game/game.ts";
import { LoadingScreen } from "./loadingScreen/loadingScreen.ts";
import { WebSocketHandle } from "./websocketHandle.ts";
import { EndScreen } from "./endScreen/endScreen.ts";
import { CardManager } from "./loadingScreen/CardManage.ts";
import { eventBus } from "./EventBus.ts";

async function dummy() {
  console.log("works");

  eventBus.emit("Command:REGISTER_PLAYER", {
    "playerName": "konon1",
    "ip": "localhost",
    "lobbyName": "",
    "port": "8080",
    "newLobby": false,
    "privateLobby": false
  })
  await new Promise((res) => setTimeout(res, 100));
  eventBus.emit("Action:ADD_PLAYER", {
    "playerName": "konon1"
  })
  await new Promise((res) => setTimeout(res, 100));
  eventBus.emit("Helper:SET_IDS", {
    "lobbyID": "2a6a5757-bd9c-4795-8bc7-2c9fe5dc416b",
    "playerID": "01KDMVS89ESVAJ7MVXKTZ3P4EB"
  })
  await new Promise((res) => setTimeout(res, 100));
  eventBus.emit("Action:PLAYERS", {
    "playerNames": [
      "konon1"
    ]
  })
  await new Promise((res) => setTimeout(res, 100));
  eventBus.emit("Action:ADD_PLAYER", {
    "playerName": "konon2"
  })
  await new Promise((res) => setTimeout(res, 100));
  eventBus.emit("ServerMessage:PLAYER_READY", {
    "ready": true,
    "playerName": "konon2"
  })
  await new Promise((res) => setTimeout(res, 100));
  eventBus.emit("Command:PLAYER_READY", {
    "playerReady": true
  })
  await new Promise((res) => setTimeout(res, 100));
  eventBus.emit("ServerMessage:PLAYER_READY", {
    "ready": true,
    "playerName": "konon1"
  })
  await new Promise((res) => setTimeout(res, 100));
  eventBus.emit("Helper:SET_MAIN_PLAYER", {
    "playerName": "konon1"
  })
  await new Promise((res) => setTimeout(res, 100));
  eventBus.emit("Helper:REGISTER_PLAYERS", {
    "playerNames": [
      "konon2"
    ]
  })
  await new Promise((res) => setTimeout(res, 100));
  eventBus.emit("Action:START_GAME", undefined)
  await new Promise((res) => setTimeout(res, 100));
  eventBus.emit("Action:HIDDEN_DRAW", {
    "playerName": "konon1",
    "cardCount": 4
  })

};

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

  // dummy()

  // TODO:
  // player rank + ready state
  // add disconnect from lobby
  // freeze form when connected
  // cglobal card skin selection
  // card stacking
  // show player rank in the middle of game
  // fix card count after reseting

  // Done:
  // try to reconnect try
  // show lobby/game id + (name)
  // implement ready state
  // DESTROY = disable playagain
  // remaining pagetime na sekundy
  // on disqualified - reload
  // disable connect buttons after connecting
})();

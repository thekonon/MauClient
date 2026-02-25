import { Application } from "pixi.js";
import { GameSettings } from "./gameSettings.ts";
import { Game } from "./game/game.ts";
import { LoadingScreen } from "./loadingScreen/loadingScreen.ts";
import { WebSocketHandle } from "./websocketHandle.ts";
import { EndScreen } from "./endScreen/endScreen.ts";
import { CardManager } from "./loadingScreen/CardManage.ts";
import { MessagesMenu } from "./msgMenu.ts";
import { RestManager } from "./loadingScreen/restManager.ts";

(async () => {
  const loading_screen = new LoadingScreen();
  // loading_screen.show();

  // Create a game instance
  // const app = new Application();
  // await app.init({ background: "#1099bb", resizeTo: window });

  // document.getElementById("pixi-container")!.appendChild(app.canvas);
  // const cardManager = new CardManager(app);
  // await cardManager.loadCardTextures();
  // cardManager.createFallingCards(50);

  GameSettings.basicInit();

  // new WebSocketHandle();
  // new Game(app);
  // new EndScreen(app);
  new MessagesMenu();
  const restManager = new RestManager();

  const registerBtn = document.getElementById("registerBtn") as HTMLButtonElement
  const loginBtn = document.getElementById("loginBtn") as HTMLButtonElement
  const refreshBtn = document.getElementById("refreshBtn") as HTMLButtonElement
  const logoutBtn = document.getElementById("logoutBtn") as HTMLButtonElement
  const whoamiBtn = document.getElementById("whoamiBtn") as HTMLButtonElement
  const timeleftBtn = document.getElementById("timeLeftBtn") as HTMLButtonElement

  registerBtn.addEventListener("click", () => {restManager.register("string", "string", "string", "string")});
  loginBtn.addEventListener("click", () => {restManager.login("string", "string")});
  refreshBtn.addEventListener("click", () => {restManager.refresh()});
  logoutBtn.addEventListener("click", () => {restManager.logout()});
  whoamiBtn.addEventListener("click", () => {restManager.whoami()});
  timeleftBtn.addEventListener("click", () => {restManager.timeleft()});

  // dummy()

  // TODO:
  // page open = send /userInfo
  //    code: 200 - ackt like user is already logged in
  //    code: 401 - do nothing
  //    code: 40x - session expired - send another request /refresh - get 200 again /userInfo
  // set input to display for player name which is registered
  // Register
  // add disconnect from lobby
  // cglobal card skin selection
  // card stacking
  // problikonout pass p5i pass
  // player rank onlz for player rank
  // use onlz score for display score
  // display next color until new card is played -rework 
  // sounds
  // remove on endScreen
  // remove pass / stop on pile
  // statusDisplay

  // Done:
  // freeze form when connected
  // Remove IP/port move it to config / vibe code it
  // Reconnect
  // endscreen ready state
  // player remove after end
  // fix unready second games
  // fix card count after reseting
  // show player rank in the middle of game
  // player rank + ready state
  // try to reconnect try
  // show lobby/game id + (name)
  // implement ready state
  // DESTROY = disable playagain
  // remaining pagetime na sekundy
  // on disqualified - reload
  // disable connect buttons after connecting
})();

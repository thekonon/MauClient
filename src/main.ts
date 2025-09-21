import { Application } from "pixi.js";
import { GameSettings } from "./gameSettings.ts";
import { Game } from "./game/game.ts";
import { LoadingScreen } from "./loading_screen/loadingScreen.ts";
import { WebSocketHandle } from "./websocketHandle.ts";
import { EndScreen } from "./endScreen/endScreen.ts";
import { CardManager } from "./loading_screen/CardManage.ts";


async function testing(
  web_socket: WebSocketHandle,
  loading_screen: LoadingScreen,
) {
  loading_screen.on_register_player?.("aa", "localhost", "8080");
  loading_screen.mainPlayer.name = "aa";

  const initMsgs = [
    '{"messageType":"ACTION","action":{"type":"REGISTER_PLAYER","playerDto":{"playerId":"01K2VK4H3V09M6VKM1K68D955H","username":"aa","active":true}}}',
    '{"messageType":"ACTION","action":{"type":"PLAYERS","players":["aa"]}}',
    '{"messageType":"ACTION","action":{"type":"REGISTER_PLAYER","playerDto":{"username":"bb","active":true}}}',
    '{"messageType":"ACTION","action":{"type":"REGISTER_PLAYER","playerDto":{"username":"cc","active":true}}}',
    '{"messageType":"ACTION","action":{"type":"REGISTER_PLAYER","playerDto":{"username":"dd","active":true}}}',
    '{"messageType":"ACTION","action":{"type":"REGISTER_PLAYER","playerDto":{"username":"ee","active":true}}}',
  ];
  const expireTimeMs = Date.now() + 60000;
  const startGameMsgs = [
    '{"messageType":"ACTION","action":{"type":"START_GAME","gameId":"2c28f719-9cb8-4ce6-adb9-319913ec0150"}}',
    '{"messageType":"ACTION","action":{"type":"START_PILE","card":{"type":"SEVEN","color":"HEARTS"}}}',
    `{"messageType":"ACTION","action":{"type":"PLAYER_SHIFT","playerDto":{"username":"aa","active":true},"expireAtMs":${expireTimeMs}}}`,
  ];
  const midMsgs = [
    '{"messageType":"ACTION","action":{"type":"DRAW","cards":[{"type":"EIGHT","color":"HEARTS"},{"type":"SEVEN","color":"DIAMONDS"},{"type":"QUEEN","color":"CLUBS"},{"type":"EIGHT","color":"CLUBS"}]}}',
    '{"messageType":"ACTION","action":{"type":"PLAYER_SHIFT","playerDto":{"username":"bb","active":true},"expireAtMs":1756045736534}}',
    '{"messageType":"ACTION","action":{"type":"HIDDEN_DRAW","playerDto":{"username":"bb","active":true},"count":4}}',
    '{"messageType":"ACTION","action":{"type":"PLAYER_SHIFT","playerDto":{"username":"cc","active":true},"expireAtMs":1756045736534}}',
    '{"messageType":"ACTION","action":{"type":"HIDDEN_DRAW","playerDto":{"username":"cc","active":true},"count":4}}',
    '{"messageType":"ACTION","action":{"type":"PLAYER_SHIFT","playerDto":{"username":"dd","active":true},"expireAtMs":1756045736534}}',
    '{"messageType":"ACTION","action":{"type":"HIDDEN_DRAW","playerDto":{"username":"dd","active":true},"count":4}}',
    '{"messageType":"ACTION","action":{"type":"PLAYER_SHIFT","playerDto":{"username":"ee","active":true},"expireAtMs":1756045736534}}',
    '{"messageType":"ACTION","action":{"type":"HIDDEN_DRAW","playerDto":{"username":"ee","active":true},"count":4}}',
    '{"messageType":"ACTION","action":{"type":"PLAY_CARD","playerDto":{"username":"aa","active":true},"card":{"type":"SEVEN","color":"DIAMONDS"}}}',
  ];
  const endMsgs = [
    '{"messageType":"ACTION","action":{"type":"WIN","playerDto":{"username":"a","active":false}}}',
    '{"messageType":"ACTION","action":{"type":"END_GAME","playerRank":["aa","bb", "cc", "dd", "Ee"]}}',
  ];

  await new Promise((res) => setTimeout(res, 3000));
  for (const msgStr of initMsgs) {
    web_socket.onMessage(msgStr);
    await new Promise((res) => setTimeout(res, 50));
  }
  for (const msgStr of startGameMsgs) {
    web_socket.onMessage(msgStr);
    await new Promise((res) => setTimeout(res, 200));
  }
  for (const msgStr of midMsgs) {
    web_socket.onMessage(msgStr);
    await new Promise((res) => setTimeout(res, 200));
  }
  for (const msgStr of endMsgs) {
    web_socket.onMessage(msgStr);
    await new Promise((res) => setTimeout(res, 500));
  }
  return;
}

(async () => {
  let game!: Game;
  let endScreen!: EndScreen;
  const loading_screen = new LoadingScreen();
  loading_screen.show();
  const web_socket = new WebSocketHandle();

  // Create a game instance
  const app = new Application();
  await app.init({ background: "#1099bb", resizeTo: window });

  document.getElementById("pixi-container")!.appendChild(app.canvas);
  const cardManager = new CardManager(app);
  await cardManager.loadCardTextures();
  cardManager.createFallingCards(50);

  game = new Game(app);

  // web_socket.start_game = async () => {
    // When game stats, hide loading screen
    // loading_screen.hide();
    // cardManager.removeFallingCards()
    
    // web_socket.start_pile = game.startPileAction.bind(game);
    // web_socket.drawCardAction = game.drawCardAction.bind(game);
    // web_socket.playCardAction = game.playCard.bind(game);
    // web_socket.shiftPlayerAction = game.shiftPlayerAction.bind(game);
    // web_socket.hiddenDrawAction = game.hiddenDrawAction.bind(game);

    // endScreen = new EndScreen(app);

    // web_socket.gameEndAction = async () => {
    //   await new Promise((res) => setTimeout(res, 1000));
    //   game.hide();
    //   endScreen.show();
    // };

    // web_socket.rankPlayerAction = endScreen.setWinners.bind(endScreen);

    // game.mainPlayer = loading_screen.getMainPlayer();
    // game.register_players(loading_screen.get_players_list());

    // game.startGame();
  // };
  // Bypapass for testing
  // testing(web_socket, loading_screen);
})();

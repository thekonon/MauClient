import { Application } from "pixi.js";
import { GameSettings } from "./gameSettings.ts";
import { Game } from "./game/game.ts";
import { LoadingScreen } from "./loading_screen/loadingScreen.ts";
import { WebSocketHandle } from "./websocket_handle.ts";
import { EndScreen } from "./endScreen/endScreen.ts";

async function testing(
  web_socket: WebSocketHandle,
  loading_screen: LoadingScreen,
) {
  loading_screen.on_register_player?.("aa", "localhost", "8080");
  loading_screen.mainPlayer = "aa";

  const initMsgs = [
    '{"messageType":"ACTION","action":{"type":"REGISTER_PLAYER","playerDto":{"playerId":"01K2VK4H3V09M6VKM1K68D955H","username":"aa","active":true}}}',
    '{"messageType":"ACTION","action":{"type":"PLAYERS","players":["aa"]}}',
    '{"messageType":"ACTION","action":{"type":"REGISTER_PLAYER","playerDto":{"username":"bb","active":true}}}',
    '{"messageType":"ACTION","action":{"type":"REGISTER_PLAYER","playerDto":{"username":"asdasasdasdasdasdasdasdasdasddasdasdcc","active":true}}}',
    '{"messageType":"ACTION","action":{"type":"REGISTER_PLAYER","playerDto":{"username":"dd","active":true}}}',
    '{"messageType":"ACTION","action":{"type":"REGISTER_PLAYER","playerDto":{"username":"ee","active":true}}}',
  ];
  const startGameMsgs = [
    '{"messageType":"ACTION","action":{"type":"START_GAME","gameId":"2c28f719-9cb8-4ce6-adb9-319913ec0150"}}',
    '{"messageType":"ACTION","action":{"type":"START_PILE","card":{"type":"SEVEN","color":"HEARTS"}}}',
    '{"messageType":"ACTION","action":{"type":"PLAYER_SHIFT","playerDto":{"username":"bb","active":true}}}',
  ];
  const midMsgs = [
    '{"messageType":"ACTION","action":{"type":"DRAW","cards":[{"type":"EIGHT","color":"HEARTS"},{"type":"SEVEN","color":"DIAMONDS"},{"type":"QUEEN","color":"CLUBS"},{"type":"EIGHT","color":"CLUBS"}]}}',
    '{"messageType":"ACTION","action":{"type":"HIDDEN_DRAW","playerDto":{"username":"bb","active":true},"count":4}}',
    '{"messageType":"ACTION","action":{"type":"HIDDEN_DRAW","playerDto":{"username":"cc","active":true},"count":4}}',
    '{"messageType":"ACTION","action":{"type":"HIDDEN_DRAW","playerDto":{"username":"dd","active":true},"count":4}}',
    '{"messageType":"ACTION","action":{"type":"HIDDEN_DRAW","playerDto":{"username":"ee","active":true},"count":4}}',
    '{"messageType":"ACTION","action":{"type":"PLAY_CARD","playerDto":{"username":"aa","active":true},"card":{"type":"SEVEN","color":"DIAMONDS"}}}',
  ];
  const endMsgs = [
    '{"messageType":"ACTION","action":{"type":"WIN","playerDto":{"username":"a","active":false}}}',
    '{"messageType":"ACTION","action":{"type":"END_GAME"}}',
    '{"messageType":"ACTION","action":{"type":"PLAYER_RANK","players":["player 1","Pepa","Lol"]}}',
  ];

  for (const msgStr of initMsgs) {
    web_socket.onMessage(msgStr);
    await new Promise((res) => setTimeout(res, 100));
  }
  return;
  for (const msgStr of startGameMsgs) {
    web_socket.onMessage(msgStr);
  }
  for (const msgStr of midMsgs) {
    web_socket.onMessage(msgStr);
    await new Promise((res) => setTimeout(res, 500));
  }
  for (const msgStr of endMsgs) {
    web_socket.onMessage(msgStr);
    await new Promise((res) => setTimeout(res, 500));
  }
}

(async () => {
  // Create a new application
  const app = new Application();

  // Add CSS
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = "style.css";

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // Create file with all  the graphics settings
  GameSettings.setScreenDimensions(app.screen.height, app.screen.width);

  // Create loading screen - user is set here
  const loading_screen = new LoadingScreen(app);
  loading_screen.show();

  // Websocket with
  const web_socket = new WebSocketHandle();

  // Create websocket connection after providing a name under which is user connected to WS
  loading_screen.on_register_player = (
    playerName: string,
    ip: string,
    port: string,
  ) => {
    web_socket.setUser(playerName);
    web_socket.setIPPort(ip, port);
    web_socket.createConnection();
  };

  loading_screen.reconnectCommand = (ip: string, port: string) => {
    web_socket.setIPPort(ip, port);
    web_socket.reconnect();
  };

  /* These are messages that goes from server */
  /* Loading screen callbacks - server sends */
  web_socket.update_player_list =
    loading_screen.updatePlayerList.bind(loading_screen);
  web_socket.add_player = loading_screen.addPlayerToList.bind(loading_screen);

  /* Game callbacks - server sends */

  // Create a game instance
  const game = new Game(app);

  // Create a endScreen instance
  const endScreen = new EndScreen(app);

  // Bind callbacks
  web_socket.start_pile = game.startPileAction.bind(game);
  web_socket.drawCardAction = game.drawCardAction.bind(game);
  web_socket.playCardAction = game.playCard.bind(game);
  web_socket.shiftPlayerAction = game.shiftPlayerAction.bind(game);
  web_socket.hiddenDrawAction = game.hiddenDrawAction.bind(game);

  web_socket.start_game = async () => {
    // When game stats, hide loading screen
    loading_screen.hide();

    game.mainPlayer = loading_screen.getMainPlayer();
    game.register_players(loading_screen.get_players_list());

    // Start game
    game.startGame();
  };

  web_socket.gameEndAction = async () => {
    await new Promise((res) => setTimeout(res, 1000));
    game.hide();
    endScreen.show();
  };

  web_socket.rankPlayerAction = endScreen.setWinners.bind(endScreen);

  /* User callbacks - user want to send */
  game.drawCardCommand = web_socket.drawCardCommand.bind(web_socket);
  game.passCommand = web_socket.playPassCommand.bind(web_socket);

  // Bypapass for testing
  // testing(web_socket, loading_screen)
})();

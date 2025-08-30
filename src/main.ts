import { Application, Container, Graphics, localUniformMSDFBit, Point } from "pixi.js";
import { GameSettings } from "./gameSettings.ts";
import { Game } from "./game/game.ts";
import { LoadingScreen } from "./loading_screen/loadingScreen.ts";
import { WebSocketHandle } from "./websocket_handle.ts";
import { EndScreen } from "./endScreen/endScreen.ts";
import { Card } from "./game/card.ts";
import { CardManager } from "./loading_screen/CardManage.ts";

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
    '{"messageType":"ACTION","action":{"type":"REGISTER_PLAYER","playerDto":{"username":"cc","active":true}}}',
    '{"messageType":"ACTION","action":{"type":"REGISTER_PLAYER","playerDto":{"username":"dd","active":true}}}',
    '{"messageType":"ACTION","action":{"type":"REGISTER_PLAYER","playerDto":{"username":"ee","active":true}}}',
  ];
  const expireTimeMs = (Date.now() + 60000)
  const startGameMsgs = [
    '{"messageType":"ACTION","action":{"type":"START_GAME","gameId":"2c28f719-9cb8-4ce6-adb9-319913ec0150"}}',
    '{"messageType":"ACTION","action":{"type":"START_PILE","card":{"type":"SEVEN","color":"HEARTS"}}}',
    `{"messageType":"ACTION","action":{"type":"PLAYER_SHIFT","playerDto":{"username":"aa","active":true},"expireAtMs":${expireTimeMs}}}`
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

  for (const msgStr of initMsgs) {
    web_socket.onMessage(msgStr);
    await new Promise((res) => setTimeout(res, 50));
  }
  // return;
  for (const msgStr of startGameMsgs) {
    web_socket.onMessage(msgStr);
  }
  for (const msgStr of midMsgs) {
    web_socket.onMessage(msgStr);
    await new Promise((res) => setTimeout(res, 50));
  }
  for (const msgStr of endMsgs) {
    continue
    web_socket.onMessage(msgStr);
    await new Promise((res) => setTimeout(res, 500));
  }
}

async function cardTest(app: Application) {
  GameSettings.setScreenDimensions(window.innerHeight, window.innerWidth);

  const grid = new Graphics()
  const delta = 50;
  const xGridCount = 30;
  const yGridCount = 50;
  grid.setStrokeStyle({ width: 2, color: 0x0 })
  for (let i = 0; i <= xGridCount; i++) {
    grid.moveTo(i*delta, 0)
    grid.lineTo(i*delta, 800)
    grid.stroke()
  }
  for (let i = 0; i <= yGridCount; i++) {
    grid.moveTo(0, i*delta)
    grid.lineTo(1800, i*delta)
    grid.stroke()
  }

  app.stage.addChild(grid)

  // const redDot = new Graphics().rect(0,0,5,5).fill(0xff0000)

  // const testContainer1 = new Container()
  // testContainer1.x = 500
  // testContainer1.y = 300
  // testContainer1.addChild(redDot)

  // app.stage.addChild(testContainer1)

  const testCard = await Card.create("", "back");
  testCard.x = 1
  console.log(testCard.width)
  console.log(testCard.card_sprite.width)
  console.log(testCard.x)
  console.log(testCard.card_sprite.x)
  // testCard.y = 100
  // testCard.end_animation_point_x = 200
  // testCard.end_animation_point_y = 100


  app.stage.addChild(testCard)

  await new Promise((res) => setTimeout(res, 500));
  // testCard.changeContainer(testContainer1)

  testCard.setGlobalEndOfAnimation(0, 0, -0*Math.PI/16)
  // testCard.play()

  await new Promise((res) => setTimeout(res, 1100));
  testCard.setGlobalEndOfAnimation(250, 100, 0)
  // testCard.play()
}

(async () => {

  const loading_screen = new LoadingScreen();
  loading_screen.show()

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
  web_socket.removePlayerAction =
    loading_screen.removePlayerFromList.bind(loading_screen);

  /* Game callbacks - server sends */

  // Create a game instance
  const app = new Application();
  await app.init({ background: "#1099bb", resizeTo: window });

  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // loading_screen.hide()
  // cardTest(app)

  // loading_screen.toggleReadyButtonReady()

  const cardManager = new CardManager(app)
  // await new Promise((res) => setTimeout(res, 1050));
  await cardManager.loadCardTextures()
  cardManager.createFallingCards(50);

  let game!: Game;

  // Create a endScreen instance
  let endScreen!: EndScreen;



  web_socket.start_game = async () => {
    // When game stats, hide loading screen
    loading_screen.hide();
    cardManager.removeFallingCards()
    GameSettings.setScreenDimensions(window.innerHeight, window.innerWidth);

    game = new Game(app);

    web_socket.start_pile = game.startPileAction.bind(game);
    web_socket.drawCardAction = game.drawCardAction.bind(game);
    web_socket.playCardAction = game.playCard.bind(game);
    web_socket.shiftPlayerAction = game.shiftPlayerAction.bind(game);
    web_socket.hiddenDrawAction = game.hiddenDrawAction.bind(game);

    /* User callbacks - user want to send */
    game.drawCardCommand = web_socket.drawCardCommand.bind(web_socket);
    game.passCommand = web_socket.playPassCommand.bind(web_socket);

    endScreen = new EndScreen(app);

    web_socket.gameEndAction = async () => {
      await new Promise((res) => setTimeout(res, 1000));
      game.hide();
      endScreen.show();
    };

    web_socket.rankPlayerAction = endScreen.setWinners.bind(endScreen);

    game.mainPlayer = loading_screen.getMainPlayer();
    game.register_players(loading_screen.get_players_list());

    // Start game
    game.startGame();
  };

  // Bypapass for testing
  // testing(web_socket, loading_screen)
})();

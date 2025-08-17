import { Application } from "pixi.js";
import { GameSettings } from "./gameSettings.ts";
import { Game } from "./game/game.ts";
import { LoadingScreen } from "./loading_screen/loadingScreen.ts";
import { WebSocketHandle } from "./websocket_handle.ts";

async function testing(
  web_socket: WebSocketHandle,
  loading_screen: LoadingScreen,
) {
  loading_screen.on_register_player?.("thekonon", "localhost", "8080");
  loading_screen.mainPlayer = "thekonon";

  await new Promise((res) => setTimeout(res, 100));
  let message = JSON.parse(
    '{"type":"REGISTER_PLAYER","playerDto":{"playerId":"01K1XMN8YMM4TG3NB068EPHZVZ","username":"pep"}}',
  );
  web_socket.register_player_action(message);
  await new Promise((res) => setTimeout(res, 50));
  message = JSON.parse(
    '{"type":"REGISTER_PLAYER","playerDto":{"playerId":"01K1XMN8YMM4TG3NB068EPHZVZ","username":"pep2"}}',
  );
  web_socket.register_player_action(message);
  await new Promise((res) => setTimeout(res, 50));
  message = JSON.parse(
    '{"type":"REGISTER_PLAYER","playerDto":{"playerId":"01K1XMN8YMM4TG3NB068EPHZVZ","username":"pep3"}}',
  );
  web_socket.register_player_action(message);
  await new Promise((res) => setTimeout(res, 100));
  web_socket.start_game_action();
  await new Promise((res) => setTimeout(res, 100));
  message = JSON.parse(
    '{"type":"START_PILE","card":{"type":"JACK","color":"DIAMONDS"}}',
  );
  web_socket.start_pile_action(message);
  await new Promise((res) => setTimeout(res, 50));
  message = JSON.parse(
    '{"type":"DRAW","cards":[{"type":"QUEEN","color":"DIAMONDS"},{"type":"NINE","color":"DIAMONDS"},{"type":"KING","color":"SPADES"},{"type":"NINE","color":"CLUBS"}]}',
  );
  web_socket.drawCard(message);
  return;
  await new Promise((res) => setTimeout(res, 1000));
  message = JSON.parse(
    '{"type":"PLAY_CARD","playerDto":{"username":"thekonon","active":true},"card":{"type":"QUEEN","color":"DIAMONDS"},"nextColor":"DIAMONDS"}',
  );
  web_socket.playCard(message);
  await new Promise((res) => setTimeout(res, 50));
  message = JSON.parse(
    '{"type":"PLAY_CARD","playerDto":{"username":"thekonon","active":true},"card":{"type":"NINE","color":"DIAMONDS"}}',
  );
  web_socket.playCard(message);
  await new Promise((res) => setTimeout(res, 50));
  message = JSON.parse(
    '{"type":"PLAY_CARD","playerDto":{"username":"thekonon","active":true},"card":{"type":"KING","color":"SPADES"}}',
  );
  web_socket.playCard(message);
  await new Promise((res) => setTimeout(res, 50));
  message = JSON.parse(
    '{"type":"PLAY_CARD","playerDto":{"username":"pep","active":true},"card":{"type":"KING","color":"SPADES"}}',
  );
  web_socket.playCard(message);
  await new Promise((res) => setTimeout(res, 50));
  message = JSON.parse(
    '{"type":"PLAY_CARD","playerDto":{"username":"pep2","active":true},"card":{"type":"KING","color":"SPADES"}}',
  );
  web_socket.playCard(message);
  await new Promise((res) => setTimeout(res, 50));
  message = JSON.parse(
    '{"type":"PLAY_CARD","playerDto":{"username":"pep3","active":true},"card":{"type":"KING","color":"SPADES"}}',
  );
  web_socket.playCard(message);
  await new Promise((res) => setTimeout(res, 50));
  message = JSON.parse(
    '{"type":"PLAY_CARD","playerDto":{"username":"pep","active":true},"card":{"type":"KING","color":"SPADES"}}',
  );
  web_socket.playCard(message);
  await new Promise((res) => setTimeout(res, 50));
  message = JSON.parse(
    '{"type":"PLAY_CARD","playerDto":{"username":"pep2","active":true},"card":{"type":"KING","color":"SPADES"}}',
  );
  web_socket.playCard(message);
  await new Promise((res) => setTimeout(res, 50));
  message = JSON.parse(
    '{"type":"PLAY_CARD","playerDto":{"username":"pep3","active":true},"card":{"type":"KING","color":"SPADES"}}',
  );
  web_socket.playCard(message);
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

  /* These are messages that goes from server */
  /* Loading screen callbacks - server sends */
  web_socket.update_player_list =
    loading_screen.updatePlayerList.bind(loading_screen);
  web_socket.add_player =
    loading_screen.addPlayerToList.bind(loading_screen);

  /* Game callbacks - server sends */

  // Create a game instance
  const game = new Game(app);
  web_socket.start_pile = game.start_pile_action.bind(game);
  web_socket.drawCardAction = game.draw_card_action.bind(game);
  web_socket.playCardAction = game.play_card.bind(game);
  web_socket.shiftPlayerAction = game.shiftPlayerAction.bind(game);
  web_socket.hiddenDrawAction = game.hiddenDrawAction.bind(game);

  web_socket.start_game = async () => {
    // When game stats, hide loading screen
    loading_screen.hide();

    game.mainPlayer = loading_screen.getMainPlayer();
    game.register_players(loading_screen.get_players_list());

    // Start game
    await game.start_game();
  };

  /* User callbacks - user want to send */
  game.draw_card_command = web_socket.drawCardCommand.bind(web_socket);
  game.pass_command = web_socket.playPassCommand.bind(web_socket);

  // Bypapass for testing
  // testing(web_socket, loading_screen)

  // await new Promise(res => setTimeout(res, 1000));
  // game.otherPlayers[0].setCardCount(1);
  // game.otherPlayers[1].setCardCount(22);
  // game.otherPlayers[2].setCardCount(33);
  // // game.otherPlayers[3].setCardCount(99);
})();

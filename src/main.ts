import { Application } from "pixi.js";
import { GameSettings } from "./game_settings.ts";
import { Game } from "./game/game.ts";
import { LoadingScreen } from "./loading_screen/loading_screen.ts";
import { WebSocketHandle } from "./websocket_handle.ts";

async function testing(web_socket: WebSocketHandle, loading_screen: LoadingScreen){
  web_socket.game_started = true;
  loading_screen.on_register_player?.("thekonon", "localhost", "8080");
  loading_screen.add_player_to_list("Pep")
  loading_screen.add_player_to_list("Pep2")
  loading_screen.add_player_to_list("Pep3")
  loading_screen.add_player_to_list("Pep4")
  web_socket.start_game_action();
  var message = JSON.parse('{"type":"START_PILE","card":{"type":"JACK","color":"DIAMONDS"}}');
  web_socket.start_pile_action(message);
  message = JSON.parse('{"type":"DRAW","cards":[{"type":"QUEEN","color":"DIAMONDS"},{"type":"NINE","color":"DIAMONDS"},{"type":"KING","color":"SPADES"},{"type":"NINE","color":"CLUBS"}]}');
  web_socket.draw_card_action(message)
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

  // Create a game instance in advance
  const game = new Game(app);
  // Websocket with 
  const web_socket = new WebSocketHandle();
  
  // Create websocket connection after providing a name under which is user connected to WS
  loading_screen.on_register_player = (playerName: string, ip: string, port: string) => {
    web_socket.set_user(playerName);
    web_socket.set_ip_port(ip, port);
    web_socket.create_connection()
  };
  
  /* These are messages that goes from server */
  /* Loading screen callbacks - server sends */
  web_socket.update_player_list = loading_screen.update_player_list.bind(loading_screen);
  web_socket.add_player = loading_screen.add_player_to_list.bind(loading_screen);

  /* Game callbacks - server sends */
  web_socket.start_pile = game.start_pile_action.bind(game);
  web_socket.draw_a_card = game.draw_card_action.bind(game);
  web_socket.play_card = game.play_card.bind(game);
  web_socket.shiftPlayerAction = game.shiftPlayerAction.bind(game);
  web_socket.hiddenDrawAction = game.hiddenDrawAction.bind(game)

  web_socket.start_game = async () => {
    // When game stats, hide loading screen
    loading_screen.hide();

    game.mainPlayer = loading_screen.getMainPlayer();
    game.register_players(loading_screen.get_players_list());
    
    // Start game
    await game.start_game();
  }

  /* User callbacks - user want to send */
  game.draw_card_command = web_socket.draw_card_request.bind(web_socket);
  game.pass_command = web_socket.play_pass_command.bind(web_socket);

  // Bypapass for testing
  // testing(web_socket, loading_screen)

  // await new Promise(res => setTimeout(res, 1000));
  // game.otherPlayers[0].setCardCount(1);
  // game.otherPlayers[1].setCardCount(22);
  // game.otherPlayers[2].setCardCount(33);
  // game.otherPlayers[3].setCardCount(99);
})();
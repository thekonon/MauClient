import { Application } from "pixi.js";
import { GameSettings } from "./game_settings.ts";
import { Game } from "./game/game.ts";
import { LoadingScreen } from "./loading_screen/loading_screen.ts";
import { WebSocketHandle } from "./websocket_handle.ts";

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
  const game_settings = new GameSettings(app.screen.height, app.screen.width);

  // Create loading screen - user is set here
  const loading_screen = new LoadingScreen(app, game_settings);

  // Create a game instance in advance
  const game = new Game(app, game_settings);

  // Websocket with 
  const web_socket = new WebSocketHandle();

  // Create websocket connedtion after providing a name under which is user connected to WS
  loading_screen.on_register_player = (playerName: string, ip: string, port: string) => {
    web_socket.set_user(playerName);
    web_socket.set_ip_port(ip, port);
    web_socket.create_connection()
  };

  web_socket.update_player_list = loading_screen.update_player_list.bind(loading_screen);
  web_socket.add_player = loading_screen.add_player_to_list.bind(loading_screen);

  web_socket.start_game = () => {
    loading_screen.end_loading_screen();

    game.draw_card_command_to_server = web_socket.draw_card_request.bind(web_socket);    //yea ... naming sux
    game.draw_card_command_from_server = web_socket.draw_a_card;

    game.start_game();
  }



  // loading_screen.end_loading_screen();
  // game.start_game();
})();
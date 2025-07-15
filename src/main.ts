import { Application, Graphics } from "pixi.js";

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

  const game_settings = new GameSettings(app.screen.height, app.screen.width);

  const loading_screen = new LoadingScreen(app, game_settings);
  const game = new Game(app, game_settings);

  const web_socket = new WebSocketHandle('ws://localhost:8080/game?user=thekonon');
  web_socket.update_player_list = loading_screen.update_player_list.bind(loading_screen);
  web_socket.add_player = loading_screen.add_player_to_list.bind(loading_screen);

  loading_screen.on_start_game = (playerName: string) => {
    const web_socket = new WebSocketHandle(`ws://localhost:8080/game?user=${encodeURIComponent(playerName)}`);
    web_socket.update_player_list = loading_screen.update_player_list.bind(loading_screen);

    loading_screen.end_loading_screen();
    game.start_game();
};

  // loading_screen.end_loading_screen();
  // game.start_game();
})();
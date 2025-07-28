import { Application } from "pixi.js";
import { GameSettings } from "./game_settings.ts";
import { Game } from "./game/game.ts";
import { LoadingScreen } from "./loading_screen/loading_screen.ts";
import { WebSocketHandle } from "./websocket_handle.ts";

async function testing(web_socket: WebSocketHandle, loading_screen: LoadingScreen){
  web_socket.game_started = true;
  loading_screen.on_register_player?.("thekonon", "localhost", "8080");
  web_socket.start_game_action();
  var message = JSON.parse('{"type":"START_PILE","card":{"type":"JACK","color":"DIAMONDS"}}');
  web_socket.start_pile_action(message);
  message = JSON.parse('{"type":"DRAW","cards":[{"type":"QUEEN","color":"DIAMONDS"},{"type":"NINE","color":"DIAMONDS"},{"type":"KING","color":"SPADES"},{"type":"NINE","color":"CLUBS"}]}');
  web_socket.draw_card_action(message)

  // // Wait for 1 second
  // await new Promise(resolve => setTimeout(resolve, 1000));
  // message = JSON.parse('{"type":"PLAY_CARD","card":{"type":"KING","color":"SPADES"}}');
  // web_socket.play_card_action(message);

  // // Play the card after delay
  // await new Promise(resolve => setTimeout(resolve, 1000));
  // message = JSON.parse('{"type":"PLAY_CARD","card":{"type":"QUEEN","color":"DIAMONDS"}}');
  // web_socket.play_card_action(message);

  // // Play the card after delay
  // await new Promise(resolve => setTimeout(resolve, 1000));
  // message = JSON.parse('{"type":"DRAW","cards":[{"type":"SEVEN","color":"DIAMONDS"},{"type":"SEVEN","color":"CLUBS"},{"type":"SEVEN","color":"SPADES"},{"type":"SEVEN","color":"HEARTS"}]}');
  // web_socket.draw_card_action(message)

  // const colors: string[] = ["CLUBS","DIAMONDS", "HEARTS", "SPADES"];

  // await new Promise(resolve => setTimeout(resolve, 1000));

  // for (let i = 0; i < 4; i++) {
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //     const message = {
  //       type: "PLAY_CARD",
  //       card: {
  //           type: "SEVEN",
  //           color: colors[i]
  //       }
  //   };
  //   web_socket.play_card_action(message);
  // }
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
  
  loading_screen.show();
  
  /* These are messages that goes from server */
  /* Loading screen callbacks - server sends */
  web_socket.update_player_list = loading_screen.update_player_list.bind(loading_screen);
  web_socket.add_player = loading_screen.add_player_to_list.bind(loading_screen);

  /* Game callbacks - server sends */
  web_socket.start_pile = game.start_pile_action.bind(game);
  web_socket.draw_a_card = game.draw_card_action.bind(game);
  web_socket.play_card = game.play_card.bind(game);
  
  web_socket.select_queen_color = game.show_queen_dialog.bind(game);

  web_socket.start_game = async () => {
    // When game stats, hide loading screen
    loading_screen.hide();
    
    // Start game
    await game.start_game();
  }

  /* User callbacks - user want to send */
  game.draw_card_command = web_socket.draw_card_request.bind(web_socket);
  game.pass_command = web_socket.play_pass_command.bind(web_socket);

  // Bypapass for testing
  // testing(web_socket, loading_screen)
})();
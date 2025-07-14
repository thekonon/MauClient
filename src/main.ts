import { Application, Graphics } from "pixi.js";

import { PlayerHand } from "./player_hand.ts";
import { GameSettings } from "./game_settings.ts";
import { Card } from "./card.ts";
import { WebSocketHandle } from "./websocket_handle.ts";
import { Deck } from "./deck.ts";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const game_settings = new GameSettings(app.screen.height, app.screen.width);

  const player_hand = new PlayerHand(game_settings);
  app.stage.addChild(player_hand);

  const deck = await Deck.create(game_settings);
  app.stage.addChild(deck);

  // WebSocket
  const web_socket = new WebSocketHandle();

  deck.deck_clicked_action = web_socket.send.bind(web_socket);
  web_socket.draw_a_card = player_hand.draw_card.bind(player_hand);


  // Testing
  const card = await Card.create("C", "K", game_settings.card_height);
  card.sprite.x = 300;
  card.sprite.y = 100;

  player_hand.draw_card(card);
})();

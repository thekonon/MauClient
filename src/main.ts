import { Application, Assets, Sprite } from "pixi.js";

import { Card } from "./card.ts";
import { PlayerHand } from "./player_hand.ts";
import { MyButton } from "./button.ts";
import { WebSocketHandle } from "./websocket_handle.ts";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const card = await Card.create("C", "J");

  card.get_sprite().position.set(app.screen.width / 2, app.screen.height / 2)

  const player_hand = new PlayerHand(app.stage);
  const button = new MyButton(app.stage)
  const ws = new WebSocketHandle("ws://192.168.50.231:8765");
  button.set_action(player_hand.draw_card.bind(player_hand))
  // button.button.onPress.connect(() => {
  //   ws.send("Čudl máčknut")
  // });

  player_hand.draw_card(card);


  ws.onOpen = () => {
    ws.send("Test");
  };
})();

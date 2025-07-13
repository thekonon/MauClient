import { Application, Assets, Sprite } from "pixi.js";

import { Card } from "./card.ts";
import { PlayerHand } from "./player_hand.ts";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // Load the bunny texture
  const texture = await Assets.load("/assets/bunny.png");

  // Create a bunny Sprite
  const bunny = new Sprite(texture);
  
  // Center the sprite's anchor point
  bunny.anchor.set(3);

  // Move the sprite to the center of the screen
  bunny.position.set(app.screen.width / 2, app.screen.height / 2);

  // Add the bunny to the stage
  app.stage.addChild(bunny);
  const card = await Card.create("C", "J");
  // app.stage.addChild(card.get_sprite())

  const player_hand = new PlayerHand(app.stage);

  player_hand.draw_card(card);

  

  // Listen for animate update
  app.ticker.add((time) => {
    // Just for fun, let's rotate mr rabbit a little.
    // * Delta is 1 if running at 100% performance *
    // * Creates frame-independent transformation *
    bunny.rotation += 0.1 * time.deltaTime;
    // bunny.position.y += 1;
  });
})();

import { Application, Container, Graphics, Filter } from "pixi.js";
import { GameSettings } from "./game_settings.ts";
import { Game } from "./game/game.ts";
import { LoadingScreen } from "./loading_screen/loading_screen.ts";
import { WebSocketHandle } from "./websocket_handle.ts";
import { gsap } from "gsap";
import { GlowFilter, DropShadowFilter } from "pixi-filters";

(async () => {
  const app = new Application();
  await app.init({ background: "#1099bb", resizeTo: window });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // Container so we can scale from center
  const card = new Container();
  app.stage.addChild(card);

  // Rounded rectangle
  const g = new Graphics()
    .roundRect(0, 0, 220, 120, 24)
    .fill(0x1f2430);
  card.addChild(g);

  // Center pivot
  const bounds = g.getLocalBounds();
  card.pivot.set(bounds.width / 2, bounds.height / 2);
  card.position.set(app.renderer.width / 2, app.renderer.height / 2);

  // Glow + shadow filters
  const glow = new GlowFilter({
    distance: 50,
    outerStrength: 2.5,
    innerStrength: 0,
    color: 0xffd1ff,
    quality: 0.75,
  });

  const shadow = new DropShadowFilter({
    rotation: 45,
    blur: 8,
    alpha: 0.45,
    color: 0x00ff00,
    quality: 0.5,
  });

  // Assign filters — explicit type for TS
  card.filters = [shadow as Filter, glow as Filter];

  // Interactivity
  card.eventMode = "static";
  card.cursor = "pointer";

  const hoverIn = () => {
    gsap.to(card.scale, { x: 1.58, y: 1.58, duration: 0.25, ease: "power2.out" });
    gsap.to(glow, { outerStrength: 10.5, duration: 0.1, ease: "power2.out" });
    gsap.to(shadow, { distance: 160, blur: 14, alpha: 0.6, duration: 0.25, ease: "power2.out" });
  };

  const hoverOut = () => {
    gsap.to(card.scale, { x: 1, y: 1, duration: 0.3, ease: "power2.out" });
    gsap.to(glow, { outerStrength: 1.5, duration: 0.3, ease: "power2.out" });
    gsap.to(shadow, { distance: 8, blur: 8, alpha: 0.45, duration: 0.3, ease: "power2.out" });
  };

  card.on("pointerover", hoverIn);
  card.on("pointerout", hoverOut);
})();

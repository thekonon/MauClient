import { Assets, Container, Sprite } from "pixi.js";
import { GameSettings } from "../gameSettings";
import { eventBus } from "../EventBus";

export class Deck extends Container {
  sprite!: Sprite;

  private constructor() {
    super();
  }

  static async create(): Promise<Deck> {
    const path = `assets/default/back.png`;
    const texture = await Assets.load(path);

    const deck = new Deck();
    deck.sprite = new Sprite(texture);

    deck.sprite.height = GameSettings.card_height;
    deck.sprite.width = GameSettings.card_width;
    deck.sprite.x = GameSettings.get_deck_top_x();
    deck.sprite.y = GameSettings.get_deck_top_y();
    deck.sprite.interactive = true;
    deck.sprite.on("pointerdown", () => {
      deck.deck_clicked();
    });
    deck.addChild(deck.sprite);
    return deck;
  }

  private deck_clicked() {
    eventBus.emit("Command:DRAW", undefined);
  }

  public deck_clicked_action() {
    console.warn("deck_clicked_action not yet defined");
  }
}

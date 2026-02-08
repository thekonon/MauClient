import { Container, TextStyle, Text, Point, Sprite, Assets } from "pixi.js";
import { GameSettings } from "../gameSettings";
import { Card } from "./card";
import { eventBus } from "../EventBus";

export class Pile extends Container {
  private card_queue: Card[] = [];
  private last_finished_card: Card | null = null;
  private previousText: Container | null = null;
  constructor() {
    super();
    this.displayNextColor("NotSelected");
    this.addEventListeners();
  }

  public playCard(card: Card) {
    // Add card to queue
    this.card_queue.push(card);

    const point = this.getPileTopLeftPoint();

    card.setLocalEndOfAnimation(point.x, point.y, -Math.PI / 2);
    this.addChild(card);
    card.play(undefined, undefined, () => {
      // Remove the previously finished card (if any)
      if (this.last_finished_card && this.last_finished_card !== card) {
        this.last_finished_card.parent?.removeChild(this.last_finished_card);
      }

      // Mark this card as the last finished one
      this.last_finished_card = card;

      // Remove from queue
      const index = this.card_queue.indexOf(card);
      if (index !== -1) {
        this.card_queue.splice(index, 1);
      }
    });
  }

  public async displayNextColor(suit: string) {
    const suits: [string, string][] = [
      ["D", "assets/symbols/diamond.png"],
      ["H", "assets/symbols/heart.png"],
      ["C", "assets/symbols/club.png"],
      ["S", "assets/symbols/spade.png"],
    ];

    const style = new TextStyle({
      fontFamily: "Impact",
      fontSize: GameSettings.fontSize,
      fill: "#000000",
    });

    const cont = new Container();

    const text = new Text({
      text: "Next Color:",
      style,
    });

    const point = this.getPileTopLeftPoint();
    point.x -= GameSettings.card_height + GameSettings.fontSize * 1;
    point.y -= 0;

    if (this.previousText != null) {
      this.removeChild(this.previousText);
    }
    this.previousText = cont;

    cont.position.copyFrom(point);
    cont.addChild(text);
    this.addChild(cont);
    const symbolPath = suits.find(([name]) => name === suit)?.[1];
    if (symbolPath) {
      const sprite = new Sprite(await Assets.load(symbolPath));
      sprite.scale.set(50 / sprite.width);
      sprite.x = text.width + 10;
      sprite.y = (text.height - sprite.height) / 2 + 5;
      cont.addChild(sprite);
    }
  }

  private addEventListeners(): void {
    eventBus.on("Action:START_PILE", (card) => {
      this.playCard(card);
    });
  }

  private getPileTopLeftPoint(): Point {
    return new Point(
      GameSettings.get_deck_top_x() - GameSettings.card_height * 1.1,
      GameSettings.get_deck_top_y() +
        (GameSettings.card_height + GameSettings.card_width) / 2,
    );
  }
}

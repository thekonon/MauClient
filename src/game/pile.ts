import { Container, TextStyle, Text, Point } from "pixi.js";
import { GameSettings } from "../gameSettings";
import { Card } from "./card";

export class Pile extends Container {
  private card_queue: Card[] = [];
  private last_finished_card: Card | null = null;
  private previousText: Text | null = null;
  constructor() {
    super();
    this.displayNextColor("NotSelected");
  }

  public playCard(card: Card) {
    // Add card to queue
    this.card_queue.push(card);

    const point = this.getPileTopLeftPoint();

    card.setLocalEndOfAnimation(point.x, point.y, Math.PI * 4 - Math.PI / 2);
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

  public displayNextColor(suit: string) {
    const suits: [string, string][] = [
      ["D", "♦"],
      ["H", "♥"],
      ["C", "♣"],
      ["S", "♠"],
    ];

    const symbol = suits.find(([name]) => name === suit)?.[1] ?? suit;

    const style = new TextStyle({
      fontFamily: "Impact",
      fontSize: 30,
      fill: "#000000",
    });

    const text = new Text({
      text: `NextColor: ${symbol}`,
      style,
    });

    const point = this.getPileTopLeftPoint();
    point.x -= 300;
    point.y -= 75;

    if (this.previousText != null) {
      this.removeChild(this.previousText);
    }
    this.previousText = text;

    text.position.copyFrom(point);
    this.addChild(text);
  }

  private getPileTopLeftPoint(): Point {
    return new Point(
      GameSettings.get_deck_top_x() - GameSettings.card_height * 1.1,
      GameSettings.get_deck_top_y() +
        (GameSettings.card_height + GameSettings.card_width) / 2,
    );
  }
}

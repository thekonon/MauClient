import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { GameSettings } from "../gameSettings";
import { Card } from "./card";
import { eventBus } from "../EventBus";

export class PlayerHand extends Container {
  cards_list: Card[];

  card_size: number;
  delta: number;

  background!: Graphics;

  remainingTime!: Text;

  public constructor() {
    super();
    this.cards_list = []; // List of cards in player hand

    this.draw_hand();

    this.card_size = 100; // Size of card
    this.delta = 10; // gap between two cards

    this.x = GameSettings.get_player_hand_top_x();
    this.y = GameSettings.get_player_hand_top_y();
    this.addEventListeners();
  }

  public draw_hand(backgroundColor = 0xde3249): void {
    this.background = new Graphics();
    // place for card

    this.background
      .roundRect(
        0,
        0,
        GameSettings.get_player_hand_width(),
        GameSettings.get_player_hand_height(),
        GameSettings.player_hand_padding * 2,
      )
      .fill(backgroundColor);

    // button for pass action
    const passButton = this.createButton("PASS (ACE / 7)");
    passButton.x =
      GameSettings.get_player_hand_width() - GameSettings.playerHandButtonWidth;
    passButton.y = -GameSettings.playerHandButtonHeight * 1.05;
    passButton.on("pointerdown", () => {
      eventBus.emit("Command:PASS", undefined);
    });

    // button for pass action
    const reorderCardsButton = this.createButton("REORDER\n  CARDS");
    reorderCardsButton.x =
      GameSettings.get_player_hand_width() - GameSettings.playerHandButtonWidth;
    reorderCardsButton.y = -GameSettings.playerHandButtonHeight * 2.1;
    reorderCardsButton.on("pointerdown", () => {
      console.log("Reordering cards");
      this.reorder_cards();
    });

    const style = new TextStyle({
      fontFamily: "Impact",
      fontSize: GameSettings.fontSize,
      fill: "#000000",
    });

    this.remainingTime = new Text({
      text: `Remaining time: `,
      style,
    });

    this.remainingTime.x = 0;
    this.remainingTime.y = -GameSettings.fontSize * 1.2;

    this.addChild(this.background);
    this.addChild(passButton);
    this.addChild(reorderCardsButton);
    this.addChild(this.remainingTime);
  }

  public updateBackgroundColor(newColor: number = 0xde3249) {
    if (!this.background) return;
    this.background.clear(); // Clear previous drawing
    this.background
      .roundRect(
        0,
        0,
        GameSettings.get_player_hand_width(),
        GameSettings.get_player_hand_height(),
        GameSettings.player_hand_padding,
      )
      .fill(newColor);
  }

  public updateRemainingTime(remainingTime: string) {
    this.remainingTime.text = `Remaining time: ${remainingTime}`;
  }

  public draw_card(card: Card) {
    card.x =
      GameSettings.get_deck_top_x() - GameSettings.get_player_hand_top_x();
    card.y =
      GameSettings.get_deck_top_y() - GameSettings.get_player_hand_top_y();
    card.height = GameSettings.card_height;
    card.width = GameSettings.card_width;

    [card.end_animation_point_x, card.end_animation_point_y] =
      this.get_new_card_location();

    this.cards_list.push(card);
    this.addChild(card);
    card.play();
  }

  public playCard(type: string, value: string): Card | null {
    for (let i = 0; i < this.cards_list.length; i++) {
      const card = this.cards_list[i];
      if (card.type === type && card.value === value) {
        this.cards_list.splice(i, 1); // Properly remove from array
        return card;
      }
    }

    console.error("No such card found type:", type, "value:", value);
    return null;
  }

  private addEventListeners(): void {
    eventBus.on("Action:DRAW", (card) => {
      this.draw_card(card);
    });
  }

  private reorder_cards() {
    for (let i = 0; i < this.cards_list.length; i++) {
      const card = this.cards_list[i];
      const new_location = this.get_new_card_location(i);
      card.setLocalEndOfAnimation(new_location[0], new_location[1], 0);
      card.play(0.1, 0);
    }
  }

  private get_new_card_location(n?: number): [number, number] {
    if (n === undefined) {
      n = this.cards_length();
    }
    const x =
      GameSettings.player_hand_padding +
      (GameSettings.card_width + GameSettings.player_hand_card_delta) * n;
    const y = GameSettings.player_hand_padding;
    return [x, y];
  }

  private cards_length(): number {
    return this.cards_list.length;
  }

  private createButton(displayed_text: string = "Empty"): Container {
    const buttonContainer = new Container();

    const width = GameSettings.playerHandButtonWidth;
    const height = GameSettings.playerHandButtonHeight;
    const edge_radius = GameSettings.playerHandButtonRadius;

    const button = new Graphics();
    const drawButton = (color: number) => {
      button.clear();
      button.roundRect(0, 0, width, height, edge_radius).fill(color);
    };

    const color = 0xff0000;
    const hover_color = 0x550000;
    drawButton(color);

    // Make sure the container receives interaction events
    buttonContainer.eventMode = "static";
    buttonContainer.cursor = "pointer";

    // Hover effects
    buttonContainer.on("pointerover", () => {
      drawButton(hover_color);
    });
    buttonContainer.on("pointerout", () => {
      drawButton(color);
    });

    // Create and center text
    const style = new TextStyle({
      fontFamily: "Impact",
      fontSize: GameSettings.fontSize,
      fill: "#ffffff",
    });

    const text = new Text({
      text: displayed_text,
      style,
    });

    text.x = width / 2 - text.width / 2;
    text.y = height / 2 - text.height / 2;

    // Add children in order
    buttonContainer.addChild(button);
    buttonContainer.addChild(text);

    return buttonContainer;
  }
}

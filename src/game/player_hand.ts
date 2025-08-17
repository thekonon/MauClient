import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { GameSettings } from "../game_settings";
import { Card } from "./card";

export class PlayerHand extends Container {
  cards_list: Card[];

  card_size: number;
  delta: number;

  background!: Graphics;

  public pass_command!: () => void;

  public constructor() {
    super();
    this.cards_list = []; // List of cards in player hand

    this.draw_hand();

    this.card_size = 100; // Size of card
    this.delta = 10; // gap between two cards

    this.x = GameSettings.get_player_hand_top_x();
    this.y = GameSettings.get_player_hand_top_y();

    this.pass_command = () => {
      console.log("Pass command not defined yet");
    };
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
        GameSettings.player_hand_padding,
      )
      .fill(backgroundColor);

    // button for pass action
    const drawButton = this.createButton("PASS (ACE / 7)");
    drawButton.x =
      GameSettings.get_player_hand_top_x() +
      GameSettings.get_player_hand_width() * 0.6;
    drawButton.y = -100;
    drawButton.on("pointerdown", () => {
      console.log("Playing pass");
      this.pass_command();
    });

    // button for pass action
    const reorderCardsButton = this.createButton("REORDER CARDS");
    reorderCardsButton.x =
      GameSettings.get_player_hand_top_x() +
      GameSettings.get_player_hand_width() * 0.4;
    reorderCardsButton.y = -100;
    reorderCardsButton.on("pointerdown", () => {
      console.log("Reordering cards");
      this.reorder_cards();
    });

    this.addChild(this.background);
    this.addChild(drawButton);
    this.addChild(reorderCardsButton);
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

  public play_card(type: string, value: string): Card | null {
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

    const width = 300 - GameSettings.dialog_window_padding * 2;
    const height = 80;
    const edge_radius = 10;

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
      fontFamily: "Arial",
      fontSize: 24,
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

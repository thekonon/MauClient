import { Container } from "pixi.js";
import { GameSettings } from "../game_settings";
import { Card } from "./card";

export class Pile extends Container {
    current_card: Card | null;
    previous_card: Card | null;
    constructor() {
        super();
        this.current_card = null;
        this.previous_card = null;
    }

    public play_card(card: Card) {
        if (this.previous_card != null) {
            // Remove card that is no longer valid
            this.removeChild(this.previous_card);
        } 
        this.previous_card = this.current_card;
        if (this.previous_card === null) {
            // First card start from deck
            console.log("Setting card position to deck")
            card.x = GameSettings.get_deck_top_x();
            card.y = GameSettings.get_deck_top_y();
        }
        this.current_card = card;
        this.scale_card(this.current_card);

        this.current_card.set_end_of_animation(
            GameSettings.get_deck_top_x() - GameSettings.card_height * 1.1,
            GameSettings.get_deck_top_y() + (GameSettings.card_height + GameSettings.card_width) / 2,
            Math.PI*4-Math.PI/2);
        this.addChild(this.current_card);
        this.current_card.play();
    }

    private scale_card(card: Card) {
        card.height = GameSettings.card_height;
        card.width = GameSettings.card_width;
    }
}
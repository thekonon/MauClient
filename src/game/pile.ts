import { Container } from "pixi.js";
import { GameSettings } from "../game_settings";
import { Card } from "./card";

export class Pile extends Container {
    game_settings: GameSettings;
    current_card: Card | null;
    previous_card: Card | null;
    constructor(game_settings: GameSettings) {
        super();
        this.game_settings = game_settings;
        this.current_card = null;
        this.previous_card = null;
    }

    public play_card(card: Card) {
        if (this.previous_card != null) {
            // Remove card that is no longer valid
            this.removeChild(this.previous_card.sprite);
        } else {
            // First card start from deck
            card.x = this.game_settings.get_deck_top_x();
            card.y = this.game_settings.get_deck_top_y();
        }
        this.previous_card = this.current_card;
        this.current_card = card;
        this.scale_card(this.current_card);

        this.current_card.set_end_of_animation(
            this.game_settings.get_deck_top_x() - this.game_settings.card_height * 1.1,
            this.game_settings.get_deck_top_y() + (this.game_settings.card_height + this.game_settings.card_width) / 2,
            - Math.PI / 2);
        this.addChild(this.current_card);
        this.current_card.play();
    }

    private scale_card(card: Card) {
        card.height = this.game_settings.card_height;
        card.width = this.game_settings.card_width;
    }
}
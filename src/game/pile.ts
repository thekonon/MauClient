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
            card.x = GameSettings.get_deck_top_x();
            card.y = GameSettings.get_deck_top_y();
        }
        this.current_card = card;

        this.current_card.setLocalEndOfAnimation(
            GameSettings.get_deck_top_x() - GameSettings.card_height * 1.1,
            GameSettings.get_deck_top_y() + (GameSettings.card_height + GameSettings.card_width) / 2,
            Math.PI*4-Math.PI/2);
        this.addChild(this.current_card);
        this.current_card.play();
    }

    public displayNextColor(color: string){
        // TODO: add text that is displayed next to pile signaling which color is selected with queen
    }
}
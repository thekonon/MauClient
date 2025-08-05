import { Container } from "pixi.js";
import { GameSettings } from "../game_settings";
import { Card } from "./card";

export class Pile extends Container {
    private card_queue: Card[] = [];
    private last_finished_card: Card | null = null;
    current_card: Card | null = null;
    previous_card: Card | null = null;
    constructor() {
        super();
    }

    public play_card(card: Card) {
        this.current_card = card;

        // Add card to queue
        this.card_queue.push(card);

        this.current_card.setLocalEndOfAnimation(
            GameSettings.get_deck_top_x() - GameSettings.card_height * 1.1,
            GameSettings.get_deck_top_y() + (GameSettings.card_height + GameSettings.card_width) / 2,
            Math.PI * 4 - Math.PI / 2);
        this.addChild(this.current_card);
        this.current_card.play(undefined, undefined, () => {
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

            console.log("Card animation finished. Remaining in queue:", this.card_queue.length);
        });
    }

    public displayNextColor(color: string) {
        // TODO: add text that is displayed next to pile signaling which color is selected with queen
    }
}
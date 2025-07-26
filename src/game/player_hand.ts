import { Container, Graphics } from "pixi.js";
import { GameSettings } from "../game_settings";
import { Card } from "./card";

export class PlayerHand extends Container {
    cards_list: Card[];

    card_size: number;
    delta: number;

    public constructor() {
        super();
        this.cards_list = [];                   // List of cards in player hand

        this.draw_hand()

        this.card_size = 100;                   // Size of card
        this.delta = 10;                        // gap between two cards
    }

    public draw_hand(): void {
        const graphics = new Graphics();

        graphics.roundRect(
            GameSettings.get_player_hand_top_x(),
            GameSettings.get_player_hand_top_y(),
            GameSettings.get_player_hand_width(),
            GameSettings.get_player_hand_height(),
            GameSettings.player_hand_padding)
            .fill(0xde3249);
        this.addChild(graphics);
    }

    public draw_card(card: Card) {
        card.x = GameSettings.get_deck_top_x();
        card.y = GameSettings.get_deck_top_y();
        card.height = GameSettings.card_height;
        card.width = GameSettings.card_width;

        [card.end_animation_point_x, card.end_animation_point_y] = this.get_new_card_location();

        this.cards_list.push(card);
        this.addChild(card);
        card.play();
    }

    public play_card(type: string, value: string): Card {
        for (let i = 0; i < this.cards_list.length; i++) {
            const card = this.cards_list[i];
            if (card.type === type && card.value === value) {
                this.cards_list.splice(i, 1); // Properly remove from array
                this.reorder_cards();
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
            card.set_end_of_animation(new_location[0], new_location[1], 0);
            card.play(0.1, 0);
        }
    }

    private get_new_card_location(n?: number): [number, number] {
        if (n === undefined) {
            n = this.cards_length();
        }
        const x = GameSettings.get_player_hand_top_x() + GameSettings.player_hand_padding + (GameSettings.card_width + GameSettings.player_hand_card_delta) * n;
        const y = GameSettings.get_player_hand_top_y() + GameSettings.player_hand_padding;
        return [x, y];
    }

    private cards_length(): number {
        return this.cards_list.length;
    }
}
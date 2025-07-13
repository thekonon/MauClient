import { Application} from "pixi.js";
import { Card } from "./card.ts";

export class PlayerHand {
    cards_list: Card[];
    stage: Application['stage'];

    hand_starting_position_x: number;
    hand_starting_position_y: number;
    card_size:number;
    delta: number;
    
    public constructor(stage: Application['stage']){
        this.cards_list = [];                   // List of cards in player hand
        this.stage = stage;                     // Reference to canvas

        this.hand_starting_position_x = 100;    // starting point of hand y
        this.hand_starting_position_y = 500;    // starting point of hand y

        this.card_size = 100;                   // Size of card
        this.delta = 10;                        // gap between two cards
    }

    public draw_card(card: Card){
        [card.end_animation_point_x, card.end_animation_point_y] = this.get_new_card_location()

        this.cards_list.push(card);
        this.stage.addChild(card.get_sprite());
    }

    private get_new_card_location(): [number, number]{
        var x = this.hand_starting_position_x + (this.card_size+this.delta)*this.cards_length()
        var y = this.hand_starting_position_y
        return [x, y]
    }

    private cards_length(): number{
        return this.cards_list.length;
    }
}
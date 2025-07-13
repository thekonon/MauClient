import { Application} from "pixi.js";
import { Card } from "./card.ts";

export class PlayerHand {
    cards_in_hand: number;
    cards_list: Card[];
    stage: Application['stage'];
    
    public constructor(stage: Application['stage']){
        this.cards_in_hand = 0;
        this.cards_list = [];
        this.stage = stage;
    }

    public draw_card(card: Card){
        this.cards_in_hand += 1;
        this.cards_list.push(card);
        this.stage.addChild(card.get_sprite());
    }
}
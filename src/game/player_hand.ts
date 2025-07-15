import { Container, Graphics} from "pixi.js";
import { Card } from "./game/card.ts";
import { GameSettings } from "./game_settings.ts";

export class PlayerHand extends Container {
    cards_list: Card[];
    settings: GameSettings;

    card_size:number;
    delta: number;
    
    public constructor(settings: GameSettings){
        super();
        this.cards_list = [];                   // List of cards in player hand
        this.settings = settings

        this.draw_hand()

        this.card_size = 100;                   // Size of card
        this.delta = 10;                        // gap between two cards
    }

    public draw_hand(): void{
        const graphics = new Graphics();
        
        graphics.roundRect(
            this.settings.get_player_hand_top_x(),
            this.settings.get_player_hand_top_y(),
            this.settings.get_player_hand_width(),
            this.settings.get_player_hand_height(),
            this.settings.player_hand_padding)
        .fill(0xde3249);
        this.addChild(graphics);
    }

    public draw_card(card: Card){
        card.get_sprite().x = this.settings.get_deck_top_x();
        card.get_sprite().y = this.settings.get_deck_top_y();
        card.get_sprite().height = this.settings.card_height;
        card.get_sprite().width = this.settings.card_width;

        [card.end_animation_point_x, card.end_animation_point_y] = this.get_new_card_location();

        this.cards_list.push(card);
        this.addChild(card.get_sprite());
        card.play();
    }

    public play_card(type: string, value: string){
        this.cards_list.forEach(card => {
            if ((card.type == type) && (card.value == value)){
                card.play()
            }
        });
    }

    private get_new_card_location(): [number, number]{
        var x = this.settings.get_player_hand_top_x() + this.settings.player_hand_padding + (this.settings.card_width+this.settings.player_hand_card_delta)*this.cards_length()
        var y = this.settings.get_player_hand_top_y() + this.settings.player_hand_padding
        return [x, y]
    }

    private cards_length(): number{
        return this.cards_list.length;
    }
}
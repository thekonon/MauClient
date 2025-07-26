import { Assets, Container, Sprite } from "pixi.js"
import { GameSettings } from "../game_settings";
import { Card } from "./card";

export class Deck extends Container {
    sprite!: Sprite;
    game_settings!: GameSettings;
    pile_card: Card;
    new_pile_card: Card;

    private constructor() {
        super();
        this.pile_card = new Card("C", "5");
        this.new_pile_card = new Card("A", "5");
        // Draw command to be defined there
        
    }

    static async create(game_settings: GameSettings): Promise<Deck> {
        
        const path = `assets/default/back.png`;
        const texture = await Assets.load(path);

        const deck = new Deck();
        deck.game_settings = game_settings
        deck.sprite = new Sprite(texture);
        
        deck.sprite.height = game_settings.card_height
        deck.sprite.width = game_settings.card_width
        deck.sprite.x = game_settings.get_deck_top_x();
        deck.sprite.y = game_settings.get_deck_top_y();
        deck.sprite.interactive = true;
        deck.sprite.on("pointerdown", () => {
            deck.deck_clicked();
        });
        deck.addChild(deck.sprite);
        return deck;
    }

    // public start_pile(card: Card){
    //     card.get_sprite().x = this.game_settings.get_deck_top_x();
    //     card.get_sprite().y = this.game_settings.get_deck_top_y();
    //     card.get_sprite().height = this.game_settings.card_height;
    //     card.get_sprite().width = this.game_settings.card_width;

    //     card.end_animation_point_x = card.get_sprite().position.x;
    //     card.end_animation_point_y = card.get_sprite().position.y;
    //     card.end_animation_point_x -= card.get_sprite().width * 1.1;
    //     card.end_animation_point_y += card.get_sprite().height * 0.3;

    //     card.rotation = Math.PI/2;

    //     card.play();
    //     this.addChild(card.get_sprite());
    // }

    private deck_clicked() {
        console.log("Deck clicked");
        this.deck_clicked_action()
    }

    public deck_clicked_action(){console.log("not yet defined")};
}

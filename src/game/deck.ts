import { Assets, Container, Sprite } from "pixi.js"
import { GameSettings } from "../game_settings";

export class Deck extends Container {
    sprite!: Sprite;
    game_settings!: GameSettings;

    private constructor() {
        super();
        
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

    private deck_clicked() {
        this.deck_clicked_action()
    }

    public deck_clicked_action(){console.log("not yet defined")};
}

import { Application } from "pixi.js";
import { Card } from "./card";
import { Deck } from "./deck";
import { GameSettings } from "../game_settings";
import { PlayerHand } from "./player_hand";

export class Game{
    private app: Application;
    private game_settings: GameSettings;
    public draw_card_command_to_server!: () => void;
    public draw_card_command_from_server!: (card: Card) => void;
    public play_card_command!: (card: Card) => void;
    
    constructor(app: Application, game_settings: GameSettings){
        this.app = app;
        this.game_settings = game_settings;
    }

    public async start_game(){
        const player_hand = new PlayerHand(this.game_settings);
        this.app.stage.addChild(player_hand);

        const deck = await Deck.create(this.game_settings);
        this.app.stage.addChild(deck);

        deck.deck_clicked_action = this.draw_card_command_to_server.bind(this);
        this.draw_card_command_from_server = player_hand.draw_card.bind(player_hand);

        // Testing
        // const card = await Card.create("C", "K", this.game_settings.card_height);
        // card.sprite.x = 300;
        // card.sprite.y = 100;

        // player_hand.draw_card(card);
        // card.play()
    }
}
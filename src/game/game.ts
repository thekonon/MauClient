import { Application } from "pixi.js";
import { Card } from "./card";
import { Deck } from "./deck";
import { GameSettings } from "../game_settings";
import { PlayerHand } from "./player_hand";
import { Pile } from "./pile";

export class Game{
    private app: Application;
    public draw_card_command_to_server!: () => void;
    public draw_card_command_from_server!: (card: Card) => void;
    public play_card_command!: (card: Card) => void;
    public start_pile_command!: (card: Card) => void;
    player_hand: PlayerHand;
    pile: Pile;
    deck?: Deck;
    
    constructor(app: Application){
        this.app = app;
        // Create a player hand - place where user cards are stored
        this.player_hand = new PlayerHand();
        this.draw_card_command_from_server = this.player_hand.draw_card.bind(this.player_hand);
        
        // Create a pile - place to which cards go
        this.pile = new Pile();
        this.start_pile_command = this.pile.play_card.bind(this.pile);
    }
    
    public async start_game(){
        // Create a deck - place where user can request drawing card
        this.deck = await Deck.create();
        this.deck.deck_clicked_action = this.draw_card_command_to_server.bind(this);
        this.show()
    }

    public play_card(type: string, value: string){
        // When there is request to play a card - find the right one and play it
        const played_card = this.player_hand.play_card(type, value);

        // Played card goes to pile
        this.pile.play_card(played_card);
    }

    private show(){
        // Add player hand and deck to app
        this.app.stage.addChild(this.player_hand);
        this.app.stage.addChild(this.deck!);
        this.app.stage.addChild(this.pile)
    }

    private scale_card(card: Card){
        
    }
}
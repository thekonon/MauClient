import { Application } from "pixi.js";
import { Card } from "./card";
import { Deck } from "./deck";
import { PlayerHand } from "./player_hand";
import { Pile } from "./pile";
import { QueenDialog } from "./queen_dialog";
import { AnotherPlayer } from "./another_player";

export class Game {
    private app: Application;
    public play_card_action!: (card: Card) => void;
    public start_pile_action!: (card: Card) => void;
    public draw_card_action!: (card: Card) => void;
    public draw_card_command!: () => void;
    public pass_command!: () => void;

    player_hand: PlayerHand;
    pile: Pile;
    deck?: Deck;
    otherPlayers: AnotherPlayer[];

    /* Info about players */
    mainPlayer: string;
    // otherPlayers: string[];

    constructor(app: Application) {
        this.app = app;
        // Create a player hand - place where user cards are stored
        this.player_hand = new PlayerHand();
        this.draw_card_action = this.player_hand.draw_card.bind(this.player_hand);

        // Create a pile - place to which cards go
        this.pile = new Pile();
        this.start_pile_action = this.pile.play_card.bind(this.pile);

        this.mainPlayer = "";
        this.otherPlayers = [];
    }

    public async start_game() {
        // Create a deck - place where user can request drawing card
        this.deck = await Deck.create();
        this.deck.deck_clicked_action = this.draw_card_command.bind(this);
        this.player_hand.pass_command = this.pass_command.bind(this);
        this.show()
    }

    public register_players(playerNames: string[]) {
        playerNames.forEach(playerName => {
            const newPlayer = new AnotherPlayer(playerName)
            newPlayer.drawPlayer();
            this.otherPlayers.push(newPlayer)
        });
    }

    public async play_card(player: string, type: string, value: string) {
        // When there is request to play a card - find the right one and play it
        var played_card: Card|null = null
        if(player == this.mainPlayer){
            played_card = this.player_hand.play_card(type, value);
        }
        else{
            console.log("player",player,"played card",type, value)
            played_card = await Card.create(type, value)
        }

        // Played card goes to pile
        if (played_card) {
            this.pile.play_card(played_card);
        }
    }

    private show() {
        // Add player hand and deck to app
        this.app.stage.addChild(this.player_hand);
        this.app.stage.addChild(this.deck!);
        this.app.stage.addChild(this.pile)
        this.otherPlayers.forEach(player => {
            this.app.stage.addChild(player)
        });
    }
}
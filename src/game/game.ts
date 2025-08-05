import { Application } from "pixi.js";
import { Card } from "./card";
import { Deck } from "./deck";
import { PlayerHand } from "./player_hand";
import { Pile } from "./pile";
import { AnotherPlayer } from "./another_player";
import { GameSettings } from "../game_settings";

export class Game {
    private app: Application;
    public play_card_action!: (card: Card) => void;
    public start_pile_action!: (card: Card) => void;
    public draw_card_action!: (card: Card) => void;
    public draw_card_command!: () => void;
    public pass_command!: () => void;
    //public shiftPlayerAction: (_userName: string) => void = (_) => {console.error("shiftPlayerAction not defined in game")}

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
        playerNames.forEach((playerName, index) => {
            const newPlayer = new AnotherPlayer(playerName)
            newPlayer.drawPlayer();
            newPlayer.x = GameSettings.getOtherPlayerX(index)
            newPlayer.y = GameSettings.getOtherPlayerY(index)
            this.otherPlayers.push(newPlayer)
        });
    }

    public async play_card(playerName: string, type: string, value: string) {
        // When there is request to play a card - find the right one and play it
        var played_card: Card | null = null
        if (playerName == this.mainPlayer) {
            played_card = this.player_hand.play_card(type, value);
        }
        else {
            played_card = await Card.create(type, value)
            this.otherPlayers.forEach(player => {
                if (player.playerName === playerName) {
                    player.addCardCound(-1);
                }
            });
        }

        // Played card goes to pile
        if (played_card) {
            this.pile.play_card(played_card);
        }

        // If previous card was queen, display new color
        if (value == "Q"){
            // this.pile.display
            console.log("Next color is: ",newColor)
        }
    }

    public shiftPlayerAction(playerName: string) {
        this.player_hand.updateBackgroundColor()
        if (playerName === this.mainPlayer) {
            this.player_hand.updateBackgroundColor(0x00ff00)
        }
        this.otherPlayers.forEach(player => {
            player.clearActivationAura()
            if (player.playerName === playerName){
                player.drawActivationAura()
        }
});
        
    }

    public hiddenDrawAction(playerName: string, cardCount: number) {
        console.log("Game: ", playerName, cardCount)
        this.otherPlayers.forEach(player => {
            if (player.playerName === playerName) {
                console.log("PLayer with right name found")
                player.addCardCound(cardCount)
            }
        });
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
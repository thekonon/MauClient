import { Application } from "pixi.js";
import { Card } from "./card";
import { Deck } from "./deck";
import { GameSettings } from "../game_settings";
import { PlayerHand } from "./player_hand";
import { WebSocketHandle } from "../websocket_handle";

export class Game{
    app: Application;
    game_settings: GameSettings;
    
    constructor(app: Application, game_settings: GameSettings){
        this.app = app;
        this.game_settings = game_settings;
    }

    public async start_game(){
        const player_hand = new PlayerHand(this.game_settings);
        this.app.stage.addChild(player_hand);

        const deck = await Deck.create(this.game_settings);
        this.app.stage.addChild(deck);

        // WebSocket
        const web_socket = new WebSocketHandle("ws://localhost:8080/game?user=thekonon");

        deck.deck_clicked_action = web_socket.send.bind(web_socket);
        web_socket.draw_a_card = player_hand.draw_card.bind(player_hand);

        // Testing
        const card = await Card.create("C", "K", this.game_settings.card_height);
        card.sprite.x = 300;
        card.sprite.y = 100;

        player_hand.draw_card(card);
        card.play()
    }
}
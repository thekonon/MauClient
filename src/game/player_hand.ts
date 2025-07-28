import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { GameSettings } from "../game_settings";
import { Card } from "./card";

export class PlayerHand extends Container {
    cards_list: Card[];

    card_size: number;
    delta: number;

    public pass_command!: () => void;

    public constructor() {
        super();
        this.cards_list = [];                   // List of cards in player hand

        this.draw_hand()

        this.card_size = 100;                   // Size of card
        this.delta = 10;                        // gap between two cards

        this.x = GameSettings.get_player_hand_top_x()
        this.y = GameSettings.get_player_hand_top_y()

        this.pass_command = ()=>{console.log("Pass command not defined yet")};
    }

    public draw_hand(): void {
        const graphics = new Graphics();
        // place for card
        graphics.roundRect(
            0,
            0,
            GameSettings.get_player_hand_width(),
            GameSettings.get_player_hand_height(),
            GameSettings.player_hand_padding)
            .fill(0xde3249);

        // button for pass action
        const drawButton = this.createButton("PASS");
        // drawButton.interactive = true;
        drawButton.on("pointerdown", ()=>{
            console.log("Playing pass");
            this.pass_command();
        })

        this.addChild(graphics);
        this.addChild(drawButton);
    }

    public draw_card(card: Card) {
        card.x = GameSettings.get_deck_top_x()-GameSettings.get_player_hand_top_x();
        card.y = GameSettings.get_deck_top_y()-GameSettings.get_player_hand_top_y();
        card.height = GameSettings.card_height;
        card.width = GameSettings.card_width;

        [card.end_animation_point_x, card.end_animation_point_y] = this.get_new_card_location();

        this.cards_list.push(card);
        this.addChild(card);
        card.play();
    }

    public play_card(type: string, value: string): Card | null {
        for (let i = 0; i < this.cards_list.length; i++) {
            const card = this.cards_list[i];
            if (card.type === type && card.value === value) {
                this.cards_list.splice(i, 1); // Properly remove from array
                this.reorder_cards();
                return card;
            }
        }

        console.error("No such card found type:", type, "value:", value);
        return null;
    }

    private reorder_cards() {
        for (let i = 0; i < this.cards_list.length; i++) {
            const card = this.cards_list[i];
            const new_location = this.get_new_card_location(i);
            card.set_end_of_animation(new_location[0], new_location[1], 0);
            card.play(0.1, 0);
        }
    }

    private get_new_card_location(n?: number): [number, number] {
        if (n === undefined) {
            n = this.cards_length();
        }
        const x =  GameSettings.player_hand_padding + (GameSettings.card_width + GameSettings.player_hand_card_delta) * n;
        const y = GameSettings.player_hand_padding;
        return [x, y];
    }

    private cards_length(): number {
        return this.cards_list.length;
    }

    private createButton(displayed_text: string = "Empty"): Container {
        const buttonContainer = new Container();

        const rect_x = 100
        const rect_y = -100
        const rect_width = 300
        const rect_height = 80
        const edge_radius = 10

        const y = rect_y + GameSettings.dialog_window_padding;
        const x = rect_x + GameSettings.dialog_window_padding;
        const width = rect_width - GameSettings.dialog_window_padding * 2;
        const height = rect_height;

        const button = new Graphics()
        const drawButton = (color: number) => {
            button.clear();
            button.roundRect(x, y, width, height, edge_radius)
                .fill(color);
        };
        const color = 0xff0000;
        const hover_color = 0x550000;
        drawButton(color)

        button.eventMode = 'static';
        button.cursor = 'pointer';
        

        button.on("pointerover", () => {
            drawButton(hover_color);
        });
        button.on("pointerout", () => {
            drawButton(color);
        });

        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fill: '#ffffff',
        });

        const text = new Text({
            text: displayed_text,
            style,
        });

        // Center text inside the button
        text.x = x + width / 2 - text.width / 2;
        text.y = y + height / 2 - text.height / 2;

        buttonContainer.addChild(button);
        buttonContainer.addChild(text);

        buttonContainer.interactive = true;

        return buttonContainer;
    }
}
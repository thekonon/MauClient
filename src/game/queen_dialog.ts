import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { GameSettings } from "../game_settings";

export class QueenDialog extends Container {
    rect_x: number;
    rect_y: number;
    rect_width: number;
    rect_height: number;
    edge_radius: number;
    button_height: number;

    constructor() {
        super();
        this.rect_x = GameSettings.dialog_window_pos[0];
        this.rect_y = GameSettings.dialog_window_pos[1] - 300;
        this.rect_width = GameSettings.dialog_window_dim[0];
        this.rect_height = GameSettings.dialog_window_dim[1];
        this.edge_radius = GameSettings.dialog_window_radius;

        this.button_height = (this.rect_height - GameSettings.dialog_window_padding * 5) / 4;
    }

    public show(): Promise<string> {
        return new Promise((resolve) => {
            const background = new Graphics();
            background.roundRect(
                this.rect_x,
                this.rect_y,
                this.rect_width,
                this.rect_height,
                this.edge_radius
            ).fill(GameSettings.dialog_window_color);

            this.addChild(background);

            const suits = ["Diamonds", "Hearts", "Clubs", "Spades"];

            suits.forEach((suit, index) => {
                const btn = this.create_button(suit);
                btn.x = this.rect_x + GameSettings.dialog_window_padding;
                btn.y = this.rect_y + index * (this.button_height + GameSettings.dialog_window_padding) + GameSettings.dialog_window_padding;
                btn.interactive = true;
                btn.on("pointerdown", () => {
                    resolve(suit);
                });
                this.addChild(btn);
            });
        });
    }


    private create_button(displayed_text: string = "Empty"): Container {
        const buttonContainer = new Container();

        const width = this.rect_width - GameSettings.dialog_window_padding * 2;
        const height = this.button_height;

        const button = new Graphics();
        const drawButton = (color: number) => {
            button.clear();
            button.roundRect(0, 0, width, height, this.edge_radius / 2)
                .fill(color); // Draw at (0,0) RELATIVE to container
        };

        const color = 0xff0000;
        const hover_color = 0x550000;
        drawButton(color);

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

        // Center text inside the button (which starts at 0,0 now)
        text.x = width / 2 - text.width / 2;
        text.y = height / 2 - text.height / 2;

        buttonContainer.addChild(button);
        buttonContainer.addChild(text);

        return buttonContainer;
    }
}
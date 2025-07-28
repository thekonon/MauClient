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
        this.rect_y = GameSettings.dialog_window_pos[1];
        this.rect_width = GameSettings.dialog_window_dim[0];
        this.rect_height = GameSettings.dialog_window_dim[1];
        this.edge_radius = GameSettings.dialog_window_radius;

        this.button_height = (this.rect_height - GameSettings.dialog_window_padding * 5) / 4;
    }

    public show() {
        const background = new Graphics();

        background.roundRect(
            this.rect_x,
            this.rect_y,
            this.rect_width,
            this.rect_height,
            this.edge_radius)
            .fill(GameSettings.dialog_window_color);


        const button_1 = this.create_button("Diamonds");
        const button_2 = this.create_button("Hearts");
        const button_3 = this.create_button("Clubs");
        const button_4 = this.create_button("Spades");

        button_2.y = button_1.y + this.button_height + GameSettings.dialog_window_padding;
        button_3.y = button_2.y + this.button_height + GameSettings.dialog_window_padding;
        button_4.y = button_3.y + this.button_height + GameSettings.dialog_window_padding;

        this.addChild(background);
        this.addChild(button_1);
        this.addChild(button_2);
        this.addChild(button_3);
        this.addChild(button_4);
    }

    private create_button(displayed_text: string = "Empty"): Container {
        const buttonContainer = new Container();

        const x = this.rect_x + GameSettings.dialog_window_padding;
        const y = this.rect_y + GameSettings.dialog_window_padding;
        const width = this.rect_width - GameSettings.dialog_window_padding * 2;
        const height = this.button_height;

        const button = new Graphics()
        const drawButton = (color: number) => {
            button.clear();
            button.roundRect(x, y, width, height, this.edge_radius / 2)
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

        return buttonContainer;
    }

}
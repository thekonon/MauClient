import { Graphics, Container, Text, TextStyle } from "pixi.js";
import { Button } from "@pixi/ui";
import { Card } from "./game/card.ts";

export class MyButton {
    button: Button;
    action!: (card: Card) => void;

    public constructor(stage: Container) {
        const graphic = new Graphics()
            .roundRect(0, 0, 100, 50, 15)
            .fill(0xffffff);

        this.button = new Button(graphic);
        this.button.view.x = 300;
        this.button.view.y = 300;
        this.button.onPress.connect(() => {
            this.button_pressed()
        });

        const style = new TextStyle({
            fontSize: 16,
            fill: 0x000000,
            align: 'center'
        });

        const label = new Text(); // No arguments
        label.text = "Draw a card";
        label.style = style;

        label.anchor.set(0.5);
        label.x = this.button.view.width / 2;
        label.y = this.button.view.height / 2;
        this.button.view.addChild(label);
        stage.addChild(this.button.view);
    }

    private async button_pressed() {
        console.log("Button clicked from MyButton!");
    }

    public set_action(fun: (card: Card) => void): void {
        this.action = fun;
    }
}

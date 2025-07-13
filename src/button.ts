import { Graphics, Container } from "pixi.js";
import { Button } from "@pixi/ui";
import { Card } from "./card.ts";

export class MyButton {
    button: Button;
    action!: (card: Card) => void;

    public constructor(stage: Container) {
        const graphic = new Graphics()
            .roundRect(0, 0, 100, 50, 15)
            .fill(0xffffff);

        this.button = new Button(graphic);

        this.button.onPress.connect(() => {
            this.button_pressed()
        });

        stage.addChild(this.button.view);
    }
    
    private async button_pressed(){
        console.log("Button clicked from MyButton!");
        var card = await Card.create("C", "A");
        this.action(card);
    }

    public set_action(fun: (card: Card) => void): void{
        this.action = fun;
    }
}

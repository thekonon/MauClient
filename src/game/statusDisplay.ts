import { Container, TextStyle, Text, Point } from "pixi.js";
import { GameSettings } from "../gameSettings";

export class StatusDisplay extends Container {

    private text!: Text;

    constructor() {
        super()

        this.initialize()
    }

    public initialize() {
        const size = 0.8 * Math.min(GameSettings.screen_width, GameSettings.screen_height);

        this.text = new Text({
            text: "",
            style: {
                fontFamily: "Arial",
                fontSize: size,
                fill: 0xcccccc,
                fontWeight: "bold",
                align: "center",
            },
        });

        this.text.anchor.set(0.5);
        this.text.x = GameSettings.get_mid_x();
        this.text.y = GameSettings.get_mid_y();

        this.text.alpha = 0.25;

        this.addChild(this.text);
    }

    public show() {
        this.visible = true;
    }

    public hide() {
        this.visible = false;
    }

    public displayPass() {
        this.text.text = "PASS";
        this.setBiggerSize()
        this.show();
    }

    public displaySymbol(symbol: "C" | "S" | "H" | "D") {
        const map: Record<"C" | "S" | "H" | "D", string> = {
            C: "♣",
            S: "♠",
            H: "♥",
            D: "♦",
        };
        this.setBiggerSize()
        this.text.text = map[symbol];
        this.show();
    }

    public displaySeven() {
        this.setSmallerSize()
        this.text.text = "SUFFER";

        this.show();

    }

    public displayNone() {
        this.text.text = "";
        this.show();
    }

    public setBiggerSize() {
        const size = 0.8 * Math.min(GameSettings.screen_width, GameSettings.screen_height);
        this.text.style.fontSize = size;
    }

    public setSmallerSize() {
        const size = 0.4 * Math.min(GameSettings.screen_width, GameSettings.screen_height); // smaller
        this.text.style.fontSize = size;
    }
}
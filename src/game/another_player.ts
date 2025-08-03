import { Assets, Container, Sprite } from "pixi.js";
import { GameSettings } from "../game_settings";

export class AnotherPlayer extends Container{

    playerName: string;
    sprite!: Sprite;

    constructor(playerName: string){
        super();
        this.playerName = playerName;
        console.log("Player registered:", playerName);
    }

    public async drawPlayer(){
        const path = `assets/default/back.png`
        const texture = await Assets.load(path)

        this.sprite = new Sprite(texture)
        this.sprite.height = GameSettings.card_height
        this.sprite.width = GameSettings.card_width
        this.sprite.interactive = true;
        this.sprite.on("pointerdown", () => {
            alert(`Don't disturb player ${this.playerName}`)
        })
        this.addChild(this.sprite)
    }
}
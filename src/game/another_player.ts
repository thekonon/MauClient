import { Assets, Container, Sprite, TextStyle, Text } from "pixi.js";
import { GameSettings } from "../game_settings";

export class AnotherPlayer extends Container {

    playerName: string;
    sprite!: Sprite;
    private cardCount: number;
    private cardCountText!: Text;

    constructor(playerName: string) {
        super();
        this.playerName = playerName;
        this.cardCount = 0;
        console.log("Player registered:", playerName);
    }

    public async drawPlayer() {
        const path = `assets/default/back.png`
        const texture = await Assets.load(path)

        this.sprite = new Sprite(texture)
        this.sprite.height = GameSettings.getOtherPlayerHeight()
        this.sprite.width = GameSettings.getOtherPlayerWidth()
        this.sprite.interactive = true;
        this.sprite.on("pointerdown", () => {
            alert(`Don't disturb player ${this.playerName}`)
        })
        this.addChild(this.sprite)
        this.addChild(this.createText())
    }

    public setCardCount(cardCount: number){
        this.cardCount = cardCount;
        this.cardCountText.text = this.cardCount
        
    }

    private createText(): Container {
        const textContainer = new Container();
        const style = new TextStyle({
            fontFamily: 'Impact',
            fontSize: 50,
            fill: '#0000ff',
        });

        const text = new Text({
            text: this.playerName,
            style,
        });

        const cardCountText = new Text({
            text: this.cardCount,
            style,
        });

        text.x = 10
        text.y = 10

        cardCountText.x = 10
        cardCountText.y = 80
        this.cardCountText = cardCountText

        textContainer.addChild(text)
        textContainer.addChild(cardCountText)
        return textContainer
    }
}
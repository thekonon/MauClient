import { Assets, Container, Sprite, TextStyle, Text, Graphics } from "pixi.js";
import { GameSettings } from "../game_settings";
import { Card } from "./card";

export class AnotherPlayer extends Container {

    playerName: string;
    sprite!: Sprite;
    private cardCount: number;
    private cardCountText!: Text;
    private isActive: boolean = false;
    auraContainer!: Graphics;

    constructor(playerName: string) {
        super();
        this.playerName = playerName;
        this.cardCount = 0;
        this.drawActivationAura()
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
        this.cardCountText.text = String(this.cardCount)
    }

    public addCardCound(cardCount: number){
        this.cardCount += cardCount;
        this.cardCountText.text = String(this.cardCount)
    }

    public activatePlayer(){
        this.isActive = true;
    }

    public setPlayedCard(card: Card){
        card.position = this.position
        this.addChild(card)
    }

    public drawActivationAura(color: number = 0x00ff00){
        this.auraContainer = new Graphics()
        this.auraContainer.roundRect(
            -10,
            -10,
            GameSettings.getOtherPlayerWidth()+20,
            GameSettings.getOtherPlayerHeight()+20,
            GameSettings.player_hand_padding)
            .fill(color);
        this.auraContainer.zIndex = -1;
        this.addChild(this.auraContainer)
    }

    public clearActivationAura(){
        if(!this.auraContainer){return}
        this.auraContainer.clear();
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
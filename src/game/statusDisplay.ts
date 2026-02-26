import { Container, Text, Assets, Sprite, Texture } from "pixi.js";
import { GameSettings } from "../gameSettings";

type Symbol = "C" | "S" | "H" | "D";
const symbolsMap: Record<Symbol, string> = {
  C: "assets/symbols/club.png",
  S: "assets/symbols/spade.png",
  H: "assets/symbols/heart.png",
  D: "assets/symbols/diamond.png",
};

export class StatusDisplay extends Container {
  private readonly largeMultiplier: number = 0.15;
  // private readonly smallMultiplier: number = 0.1;
  private readonly ALPHA: number = 0.5;

  constructor() {
    super({
      pivot: 0.5,
      x: GameSettings.get_mid_x(),
      y: GameSettings.get_canvas_height() * 0.2,
    });
  }

  public show() {
    this.visible = true;
  }

  public hide() {
    this.visible = false;
  }

  public displayPass() {
    this.removeChildren().forEach((ch) => ch.destroy());
    this.addChild(this.createText("PASS"));
    this.show();
  }

  public displaySymbol(symbol: Symbol): void {
    const assetPath = symbolsMap[symbol];
    Assets.load(assetPath).then((a) => {
      this.addChild(this.createSymbolSprite(a));
      this.show();
    });
  }

  public displaySeven() {
    this.removeChildren().forEach((ch) => ch.destroy());
    this.addChild(this.createText("SUFFER"));
    this.show();
  }

  public displayNone() {
    this.removeChildren().forEach((ch) => ch.destroy());
    this.show();
  }

  private createText(message: string): Text {
    const text = new Text({
      text: message,
      style: {
        fontFamily: "Arial",
        fontSize: this.getBiggerSize(),
        fill: 0xcccccc,
        fontWeight: "bold",
        align: "center",
      },
    });
    text.anchor.set(0.5);
    text.alpha = this.ALPHA;
    return text;
  }

  private createSymbolSprite(asset: Texture): Sprite {
    const sprite = new Sprite(asset);
    sprite.alpha = this.ALPHA;
    sprite.scale.set(this.getBiggerSize() / sprite.width);
    sprite.anchor.set(0.5);
    return sprite;
  }

  private getBiggerSize(): number {
    return this.largeMultiplier * Math.min(GameSettings.screen_width, GameSettings.screen_height);
  }

//   private getSmallerSize(): number {
//     return this.smallMultiplier * Math.min(GameSettings.screen_width, GameSettings.screen_height);
//   }
}

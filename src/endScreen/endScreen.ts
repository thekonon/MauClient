import {
  Application,
  Assets,
  Container,
  Sprite,
  TextStyle,
  Texture,
  Text,
} from "pixi.js";
import { GameSettings } from "../gameSettings";

export class EndScreen extends Container {
  app: Application;
  sprite!: Sprite;
  texture!: Texture;
  textureLoaded?: Promise<unknown>;

  winners: string[];

  constructor(app: Application) {
    super();
    this.draw();
    this.app = app;
    this.winners = [];
  }

  public async show() {
    await this.textureLoaded;
    console.log("adding sprite");
    this.addChild(this.sprite);
    this.app.stage.addChild(this);
  }

  public async setWinners(winners: string[]) {
    await this.textureLoaded; // This ensures sprite is ready
    this.winners = winners;
    const positions = [
      { x: -this.sprite.width * 0.075, y: -this.sprite.height * 0.58 },
      { x: -this.sprite.width * 0.3, y: -this.sprite.height * 0.25 },
      { x: this.sprite.width * 0.15, y: -this.sprite.height * 0.05 },
    ];

    // Only create texts for the number of winners
    winners.forEach((winner, index) => {
      if (index >= 3) return; // Limit to max 5
      const pos = positions[index];
      const text = createText(winner, pos.x, pos.y);
      this.addChild(text);
    });

    function createText(playerName: string, x: number, y: number) {
      const style = new TextStyle({
        fontFamily: "Impact",
        fontSize: 30,
        fill: "#000000",
      });

      const text = new Text({
        text: playerName,
        style,
      });

      text.x = x;
      text.y = y;
      text.zIndex = 1;
      return text;
    }
  }

  private async draw() {
    this.textureLoaded = new Promise((resolve, reject) => {
      (async () => {
        try {
          this.texture = await Assets.load(
            "assets/other/endScreen/winners.png",
          );
          resolve(true);
        } catch (err) {
          console.log("loading failed");
          reject(err);
        }
      })();
    });
    await this.textureLoaded;
    this.sprite = new Sprite(this.texture);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(
      (GameSettings.screen_width * 0.51) / this.sprite.width,
    );
    this.x = GameSettings.get_mid_x();
    this.y = GameSettings.get_mid_y();
    console.log(this.sprite.width / GameSettings.screen_width);
    console.log(this.sprite.height / GameSettings.screen_height);
  }
}

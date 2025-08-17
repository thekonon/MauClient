import { Application, Assets, Container, Sprite, Texture } from "pixi.js";
import { GameSettings } from "../gameSettings";

export class EndScreen extends Container {
  app: Application;
  sprite!: Sprite;
  texture!: Texture;
  textureLoaded?: Promise<unknown>;

  constructor(app: Application) {
    super();
    this.draw();
    this.app = app;
  }

  public async show() {
    console.log("Showing endScreen");
    console.log("awainting endScreen");
    await this.textureLoaded;
    console.log("awainting done endScreen");
    this.addChild(this.sprite);
    this.app.stage.addChild(this);
  }

  private async draw() {
    this.textureLoaded = new Promise((resolve, reject) => {
      (async () => {
        try {
          console.log("Trying to load texture");
          this.texture = await Assets.load(
            "assets/other/endScreen/winners.png",
          );
          console.log("Loading finished");
          resolve(true);
        } catch (err) {
          console.log("loading failed");
          reject(err);
        }
      })();
    });
    await this.textureLoaded;
    console.log("Creating sprite");
    this.sprite = new Sprite(this.texture);
  }
}

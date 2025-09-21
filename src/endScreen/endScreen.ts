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
import { eventBus } from "../EventBus";

export class EndScreen extends Container {
  app: Application;
  sprite!: Sprite;
  texture!: Texture;
  textureLoaded?: Promise<unknown>;
  playersSet?: Promise<void>

  winners: string[];

  constructor(app: Application) {
    super();
    this.draw();
    this.app = app;
    this.winners = [];
    this.addEventListeners()
  }

  public async show() {
    await this.textureLoaded;
    if (this.playersSet === undefined) {
      console.error("Report this bug to Pepa thanks");
      return;
    }
    await this.playersSet;
    this.addChild(this.sprite);
    this.app.stage.addChild(this);
  }

  public async setWinners(winners: string[]) {
    // Create a promise that will resolve after winners are processed
    this.playersSet = new Promise<void>((resolve) => {
      (async () => {
        await this.textureLoaded; // Wait until sprite is ready
        this.winners = winners;

        const positions = [
          { x: -this.sprite.width * 0.075, y: -this.sprite.height * 0.58 },
          { x: -this.sprite.width * 0.3, y: -this.sprite.height * 0.25 },
          { x: this.sprite.width * 0.15, y: -this.sprite.height * 0.05 },
        ];

        // Create text nodes for winners
        winners.forEach((winner, index) => {
          if (index >= 3) return; // Limit to max 3 winners
          const pos = positions[index];
          const text = createText(winner, pos.x, pos.y);
          this.addChild(text);
        });

        resolve(); // ✅ resolve once all players are set
      })();
    });


    function createText(playerName: string, x: number, y: number) {
      const style = new TextStyle({
        fontFamily: "Impact",
        fontSize: GameSettings.fontSize,
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

  private addEventListeners(): void {
    eventBus.on("Action:END_GAME", async () => {
      await new Promise((res) => setTimeout(res, 1000));
      this.show()
    });
    eventBus.on("Action:PLAYER_RANK", payload => {
      this.setWinners(payload.playersOrder)
    })
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
          console.error("loading failed");
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

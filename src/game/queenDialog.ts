import { Assets, Container, Graphics, Sprite } from "pixi.js";
import { GameSettings } from "../gameSettings";

export class QueenDialog extends Container {
  rect_x: number;
  rect_y: number;
  rect_width: number;
  rect_height: number;
  edge_radius: number;
  button_height: number;
  margin: number;
  exitFnc: () => void = () => {
    console.warn("Exit fun not defined");
  };
  exitButtonSizeModifier: number;

  constructor() {
    super();
    this.rect_width = GameSettings.fontSize * 3;
    this.rect_height = GameSettings.fontSize * 5;
    this.rect_x = 0;
    this.rect_y = -this.rect_height - GameSettings.fontSize * 3;
    this.edge_radius = GameSettings.fontSize / 2;
    this.margin = GameSettings.fontSize * 0.2;
    this.exitButtonSizeModifier = 0.4;

    this.button_height = (this.rect_height - this.margin * 5) / 4;
  }

  public show(): Promise<string> {
    return new Promise((resolve) => {
      const background = new Graphics();
      background
        .roundRect(
          this.rect_x,
          this.rect_y,
          this.rect_width,
          this.rect_height,
          this.edge_radius,
        )
        .fill(GameSettings.dialog_window_color);

      this.addChild(background);

      const suits: [string, string][] = [
        ["DIAMONDS", "assets/symbols/diamond.png"],
        ["HEARTS", "assets/symbols/heart.png"],
        ["CLUBS", "assets/symbols/club.png"],
        ["SPADES", "assets/symbols/spade.png"],
      ];

      suits.forEach(async ([suit, symbol], index) => {
        const btn = await this.create_button(symbol);
        btn.x = this.rect_x + this.margin;
        btn.y =
          this.rect_y +
          index * (this.button_height + this.margin) +
          this.margin;
        btn.interactive = true;
        btn.on("pointerdown", () => {
          resolve(suit);
        });
        this.addChild(btn);
      });

      const exitButton = new Graphics();

      // Draw the button background with border
      exitButton
        .roundRect(
          this.rect_x +
            this.rect_width -
            GameSettings.fontSize * this.exitButtonSizeModifier,
          this.rect_y - GameSettings.fontSize * this.exitButtonSizeModifier,
          GameSettings.fontSize * 2 * this.exitButtonSizeModifier,
          GameSettings.fontSize * 2 * this.exitButtonSizeModifier,
          GameSettings.fontSize * 0.3 * this.exitButtonSizeModifier,
        )
        .fill(0xffffff);

      // Draw the red cross
      const crossPadding = GameSettings.fontSize * 0.3;
      const x1 =
        this.rect_x +
        this.rect_width -
        GameSettings.fontSize * this.exitButtonSizeModifier +
        crossPadding;
      const y1 =
        this.rect_y -
        GameSettings.fontSize * this.exitButtonSizeModifier +
        crossPadding;
      const x2 =
        x1 +
        GameSettings.fontSize * 2 * this.exitButtonSizeModifier -
        2 * crossPadding;
      const y2 =
        y1 +
        GameSettings.fontSize * 2 * this.exitButtonSizeModifier -
        2 * crossPadding;

      exitButton
        .setStrokeStyle({ width: 5, color: 0x000000, alpha: 1 }) // red cross
        .moveTo(x1, y1)
        .lineTo(x2, y2)
        .moveTo(x1, y2)
        .lineTo(x2, y1)
        .stroke();

      exitButton
        .setStrokeStyle({ width: 2, color: 0x000000, alpha: 1 }) // width, color, alpha
        .roundRect(
          this.rect_x +
            this.rect_width -
            GameSettings.fontSize * this.exitButtonSizeModifier,
          this.rect_y - GameSettings.fontSize * this.exitButtonSizeModifier,
          GameSettings.fontSize * 2 * this.exitButtonSizeModifier,
          GameSettings.fontSize * 2 * this.exitButtonSizeModifier,
          GameSettings.fontSize * 0.3 * this.exitButtonSizeModifier,
        )
        .stroke();

      exitButton.interactive = true;
      exitButton.eventMode = "static";
      exitButton.cursor = "pointer";

      exitButton.on("pointerdown", () => {
        this.exitFnc();
      });

      this.addChild(exitButton);
    });
  }

  private async create_button(symbol: string): Promise<Container> {
    const buttonContainer = new Container();

    const width = this.rect_width - this.margin * 2;
    const height = this.button_height;

    const button = new Graphics();
    const drawButton = (color: number) => {
      button.clear();
      button.roundRect(0, 0, width, height, this.edge_radius / 2).fill(color);
    };

    const color = 0x00a0af;
    const hover_color = 0x550000;
    drawButton(color);

    // IMPORTANT: Make the *container* interactive.
    buttonContainer.eventMode = "static";
    buttonContainer.cursor = "pointer";

    // Hover events attached to container
    buttonContainer.on("pointerover", () => {
      drawButton(hover_color);
    });
    buttonContainer.on("pointerout", () => {
      drawButton(color);
    });

    const desiredWidth = 50;
    const sprite = new Sprite(await Assets.load(symbol));
    sprite.scale.set(desiredWidth / sprite.width);
    sprite.x = width / 2 - sprite.width / 2;
    sprite.y = height / 2 - sprite.height / 2;

    // Add background and text
    buttonContainer.addChild(button);
    buttonContainer.addChild(sprite);

    return buttonContainer;
  }
}

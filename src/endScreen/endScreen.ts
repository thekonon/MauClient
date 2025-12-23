import {
  Application,
  Assets,
  Container,
  Sprite,
  Texture,
} from "pixi.js";
import { GameSettings } from "../gameSettings";
import { eventBus } from "../eventBus";

export class EndScreen extends Container {
  app: Application;
  sprite!: Sprite;
  texture!: Texture;

  winners: string[];
  totalScore: Record<string, number>;

  constructor(app: Application) {
    super();
    this.app = app;
    this.winners = [];
    this.totalScore = {};
    this.addEventListeners();
  }

  public async show() {
    const endScreen = document.getElementById("endScreen") as HTMLInputElement;

    if (endScreen) {
      endScreen.style.display = "flex";
    }

    const elementIds = [
      "first-place",
      "second-place",
      "third-place",
      "fourth-place",
      "fifth-place",
    ];

    const paddedWinners = [...this.winners, ...Array(5).fill("")].slice(0, 5);

    paddedWinners.forEach((winner, index) => {
      const elementId = elementIds[index];
      const htmlElement = document.getElementById(elementId);

      if (htmlElement) {
        htmlElement.textContent = winner;
      }
    });
  }

  public async hide() {
    const endScreen = document.getElementById("endScreen") as HTMLInputElement;

    if (endScreen) {
      endScreen.style.display = "none";
    }
  }

  public async setWinners(winners: string[]) {
    this.winners = winners
  }

  private addEventListeners(): void {
    eventBus.on("Action:END_GAME", async () => {
      await new Promise((res) => setTimeout(res, 1000));
      this.show();
    });
    eventBus.on("Action:PLAYER_RANK", (payload) => {
      this.setWinners(payload.playersOrder);
    });
  }
}

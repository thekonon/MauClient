import { Application, Container, Sprite, Texture } from "pixi.js";
import { eventBus } from "../EventBus";
import { Player } from "../loadingScreen/player";

export class EndScreen extends Container {
  app: Application;
  sprite!: Sprite;
  texture!: Texture;

  isReady: boolean;
  players: Player[];
  totalScore: Record<string, number>;

  constructor(app: Application) {
    super();
    this.app = app;
    this.players = [];
    this.totalScore = {};
    this.isReady = false;

    this.addEventListeners();
    this.setButtonEvents();
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

    const playerNames: string[] = this.players.map(player => player.name)

    const paddedWinners = [...playerNames, ...Array(5).fill("")].slice(0, 5);

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

  private addEventListeners(): void {
    eventBus.on("Action:END_GAME", async () => {
      await new Promise((res) => setTimeout(res, 1000));
      this.reset()
      this.show();
    });
    eventBus.on("Action:START_GAME", () => {
      this.hide();
    });
    eventBus.on("ServerMessage:PLAYER_READY", (payload) => {
      this.setPlayerReady(payload.playerName, payload.ready);
    });

    eventBus.on("Action:DESTROY", () => {
      console.log("Destoying");
      const playAgainButton = document.getElementById(
        "playAgainButton",
      ) as HTMLButtonElement;
      // playAgainButton.disabled = true;
      if (playAgainButton) {
        playAgainButton.disabled = true;
        if (!playAgainButton.classList.contains("disabled")) {
          playAgainButton.classList.add("disabled");
        }
      }
    });

    eventBus.on("Helper:SET_SCORE", (payload) => {
      this.setScore(payload.playerRank, payload.score)
    })
  }

  private setButtonEvents(): void {
    const playAgainButton = this.getReadyPlayerButton()
    const returnToLobbyButton = document.getElementById(
      "returnToLobbyButton",
    ) as HTMLButtonElement;
    playAgainButton.onclick = () => {
      this.readyButtonOnClick()
    };

    returnToLobbyButton.onclick = () => {
      // refresh page
      window.location.reload();
    };
  }

  private updateLeaderBoard() {
    const container = document.getElementById(
      "endScreen-leaderboard-display",
    ) as HTMLDivElement;

    container.innerHTML = "";
    this.players.forEach((player) => {
      const div = document.createElement("div");
      let symbol = "";
      if (player.isReady) {
        symbol = "🟢";
      } else {
        symbol = "🔴";
      }
      div.textContent = `${symbol} -  ${player.name}: ${player.score}`;
      div.style.color = "black";
      div.style.marginBottom = "5px";
      container.appendChild(div);
    });
  }

  private setScore(playerRank: string[], playerScore: Record<string, number>) {
    this.players = [];
    for (let index = 0; index < playerRank.length; index++) {
      const name = playerRank[index];
      const score = playerScore[name];
      this.players.push(new Player(name, score))
    }

    this.updateLeaderBoard()
  }

  private setPlayerReady(playerName: string, playerReady: boolean): void {
    this.players.forEach(player => {
      if (player.name === playerName) {
        player.isReady = playerReady
      }
    });
    this.updateLeaderBoard()
  }

  private readyButtonOnClick() {
    if (this.isReady) {
      this.isReady = false;
    }
    else {
      this.isReady = true
    }

    this.updateReadyPlayerButtonStyle()

    eventBus.emit("Command:PLAYER_READY", {
      playerReady: this.isReady,
    });
  }

  private updateReadyPlayerButtonStyle() {
    const playAgainButton = this.getReadyPlayerButton()

    if (this.isReady) {
      if (!playAgainButton.classList.contains("ready")) {
        playAgainButton.classList.add("ready");
      }
    }
    else {
      if (playAgainButton.classList.contains("ready")) {
        playAgainButton.classList.remove("ready");
      }
    }
  }

  private getReadyPlayerButton(): HTMLButtonElement {
    const playAgainButton = document.getElementById(
      "playAgainButton",
    ) as HTMLButtonElement;
    if (!playAgainButton) {
      throw Error("PlayAgain button not found")
    }
    return playAgainButton
  }

  private reset(){
    this.isReady = false
    this.updateReadyPlayerButtonStyle()
  }
}

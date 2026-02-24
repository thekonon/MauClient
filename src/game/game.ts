import { Application, Container } from "pixi.js";
import { Card } from "./card";
import { Deck } from "./deck";
import { PlayerHand } from "./playerHand";
import { Pile } from "./pile";
import { AnotherPlayer } from "./anotherPlayer";
import { GameSettings } from "../gameSettings";
import { eventBus } from "../EventBus";
import { StatusDisplay } from "./statusDisplay";

export class Game extends Container {
  private app: Application;

  playerHand: PlayerHand;
  pile: Pile;
  deck?: Deck;
  otherPlayers: AnotherPlayer[];
  statusDisplay: StatusDisplay;

  /* Info about players */
  mainPlayer: string;
  readyPlayers?: Promise<unknown>;
  private intervalId?: ReturnType<typeof setInterval>;
  private isShown: boolean = false;

  constructor(app: Application) {
    super();

    this.app = app;
    // Create a player hand - place where user cards are stored
    this.playerHand = new PlayerHand();

    // Create a pile - place to which cards go
    this.pile = new Pile();

    this.statusDisplay = new StatusDisplay();

    this.mainPlayer = "";
    this.otherPlayers = [];
    this.addEventListerners();
  }

  public async startGame() {
    if (this.readyPlayers === undefined) {
      console.error("Register players first");
      return;
    }
    await this.readyPlayers;
    // Create a deck - place where user can request drawing card
    if (this.deck === undefined) {
      this.deck = await Deck.create();
    }
    this.addAllChildren();
    this.show();
  }

  private registerPlayers(playerNames: string[]) {
    this.readyPlayers = new Promise((resolve, reject) => {
      (async () => {
        try {
          for (let index = 0; index < playerNames.length; index++) {
            const playerName = playerNames[index];
            const newPlayer = new AnotherPlayer(playerName);
            await newPlayer.drawPlayer(); // ✅ Await properly
            newPlayer.x = GameSettings.getOtherPlayerX(index);
            newPlayer.y = GameSettings.getOtherPlayerY(index);
            this.otherPlayers.push(newPlayer);
          }
          resolve(true);
        } catch (err) {
          reject(err);
        }
      })();
    });
  }

  public show() {
    // Add player hand and deck to app
    if (!this.isShown) {
      this.isShown = true;
      this.app.stage.addChild(this);
    }
  }

  public async playCard(playerName: string, type: string, value: string, newColor: string = "") {
    // When there is request to play a card - find the right one and play it
    let played_card: Card | null = null;
    if (playerName == this.mainPlayer) {
      played_card = this.playerHand.playCard(type, value);
    } else {
      played_card = await Card.create(type, value, GameSettings.getTexturePack());
      const player = this.otherPlayers.find((p) => p.playerName === playerName);
      if (player && played_card) {
        player.addChild(played_card);
        player.addCardCount(-1);
      }
    }
    // Played card goes to pile
    if (played_card) {
      played_card.changeContainer(this.pile);
      this.pile.playCard(played_card);
    }

    const suits = ["C", "S", "H", "D"] as const;

    function isSuit(value: string): value is (typeof suits)[number] {
      return (suits as readonly string[]).includes(value);
    }

    this.statusDisplay.displayNone();
    // If previous card was queen, display new color
    if (played_card?.value === "Q") {
      await this.pile.displayNextColor(newColor);

      if (isSuit(newColor)) {
        this.statusDisplay.displaySymbol(newColor);
      }
    }
    if (played_card?.value === "A") {
      this.statusDisplay.displayPass();
    }
    if (played_card?.value === "7") {
      this.statusDisplay.displaySeven();
    }
  }

  public async shiftPlayerAction(playerName: string, expireAtMs: number) {
    if (this.readyPlayers === undefined) {
      console.error("Report this bug to Pepa thanks");
      return;
    }
    await this.readyPlayers;
    // Get current timestamp in milliseconds
    // Periodic task every 0.1s
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
      const remainingTime: string = this.expires(expireAtMs);

      this.playerHand.updateRemainingTime(remainingTime);
      // Stop interval when time is up
      if (Date.now() >= expireAtMs) {
        clearInterval(this.intervalId);
        console.error("Time expired!");
      }
    }, 100); // 100 ms = 0.1s

    this.playerHand.updateBackgroundColor();
    this.otherPlayers.forEach((player) => {
      player.clearActivationAura();
    });
    if (playerName === this.mainPlayer) {
      this.playerHand.updateBackgroundColor(0x00ff00);
    } else {
      this.otherPlayers.forEach((player) => {
        if (player.playerName === playerName) {
          player.drawActivationAura();
        }
      });
    }
  }

  public async hiddenDrawAction(playerName: string, cardCount: number) {
    await this.readyPlayers;

    this.statusDisplay.displayNone();

    // Find the target player
    const player = this.otherPlayers.find((p) => p.playerName === playerName);
    if (!player) return;

    // Update their card count
    player.addCardCount(cardCount);

    // Create cards
    const cards: Card[] = [];
    for (let i = 0; i < cardCount; i++) {
      const card = await Card.create("", "back", GameSettings.getTexturePack());
      card.position.x = GameSettings.get_deck_top_x();
      card.position.y = GameSettings.get_deck_top_y();
      card.zIndex = -1;
      this.addChild(card);
      cards.push(card);
    }

    // Animate cards to player
    for (const card of cards) {
      card.end_animation_point_x = player.x;
      card.end_animation_point_y = player.y;
      card.play(1, -Math.PI * 2, () => {
        this.removeChild(card);
      });
      await new Promise((res) => setTimeout(res, 100));
    }
  }

  public hide(): void {
    if (this.isShown) {
      this.isShown = false;
      this.app.stage.removeChild(this);
    }
  }

  private addEventListerners() {
    eventBus.on("Action:START_GAME", async () => {
      this.startGame();
    });
    eventBus.on("Helper:SET_MAIN_PLAYER", (payload) => {
      this.mainPlayer = payload.playerName;
    });
    eventBus.on("Helper:REGISTER_PLAYERS", (payload) => {
      this.registerPlayers(payload.playerNames);
    });
    eventBus.on("Action:PLAYER_SHIFT", (payload) => {
      this.shiftPlayerAction(payload.playerName, payload.expireAtMs);
    });
    eventBus.on("Action:HIDDEN_DRAW", (payload) => {
      this.hiddenDrawAction(payload.playerName, payload.cardCount);
    });
    eventBus.on("Action:PLAY_CARD", (payload) => {
      this.playCard(payload.playerName, payload.type, payload.value, payload.newColor);
    });
    eventBus.on("Action:END_GAME", async () => {
      await new Promise((res) => setTimeout(res, 300));
      this.resetGame();
      this.hide();
    });
    eventBus.on("Action:PLAYER_RANK", (payload) => {
      const latestWinner = payload.playersOrder.at(-1);
      this.otherPlayers.forEach((player) => {
        if (player.playerName === latestWinner) {
          player.playerWon();
        }
      });
    });
    eventBus.on("Action:PASS", () => {
      this.statusDisplay.displayNone();
    });
    eventBus.on("Command:DRAW", () => {
      this.statusDisplay.displayNone();
    });
  }

  private expires(expireAtMs: number) {
    const now = Date.now();
    let remainingMs = expireAtMs - now;

    // Make sure it doesn't go negative
    remainingMs = remainingMs > 0 ? remainingMs : 0;

    // Convert to minutes, seconds, milliseconds
    const minutes = Math.floor(remainingMs / 1000 / 60);
    const seconds = Math.floor((remainingMs / 1000) % 60);
    // const milliseconds = ((remainingMs % 1000) / 10).toFixed(0); // 2 decimal places

    // Format as mm:ss:ms
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    // return `${minutes}:${seconds.toString().padStart(2, "0")}:${milliseconds.padStart(2, "0")}`;
  }

  private addAllChildren(): void {
    this.addChild(this.playerHand);
    this.addChild(this.deck!);
    this.addChild(this.pile);
    this.addChild(this.statusDisplay);
    this.otherPlayers.forEach((player) => {
      this.addChild(player);
    });
  }

  private resetGame(): void {
    this.playerHand.restart();
    this.otherPlayers.forEach((player) => {
      player.restart();
    });
  }
}

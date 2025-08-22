import { Application, Container } from "pixi.js";
import { Card } from "./card";
import { Deck } from "./deck";
import { PlayerHand } from "./playerHand";
import { Pile } from "./pile";
import { AnotherPlayer } from "./anotherPlayer";
import { GameSettings } from "../gameSettings";

export class Game extends Container {
  private app: Application;
  public startPileAction!: (card: Card) => void;
  public drawCardAction!: (card: Card) => void;
  public drawCardCommand!: () => void;
  public passCommand!: () => void;

  playerHand: PlayerHand;
  pile: Pile;
  deck?: Deck;
  otherPlayers: AnotherPlayer[];

  /* Info about players */
  mainPlayer: string;
  readyPlayers?: Promise<unknown>;
  intervalId?: number;

  constructor(app: Application) {
    super();

    this.app = app;
    // Create a player hand - place where user cards are stored
    this.playerHand = new PlayerHand();
    this.drawCardAction = this.playerHand.draw_card.bind(this.playerHand);

    // Create a pile - place to which cards go
    this.pile = new Pile();
    this.startPileAction = this.pile.playCard.bind(this.pile);

    this.mainPlayer = "";
    this.otherPlayers = [];
  }

  public async startGame() {
    // Create a deck - place where user can request drawing card
    if (this.readyPlayers === undefined) {
      console.error("Report this bug to Pepa thanks");
      return;
    }
    await this.readyPlayers;
    this.deck = await Deck.create();
    this.deck.deck_clicked_action = this.drawCardCommand.bind(this);
    this.playerHand.pass_command = this.passCommand.bind(this);
    this.show();
  }

  public register_players(playerNames: string[]) {
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

  public async playCard(
    playerName: string,
    type: string,
    value: string,
    newColor: string = "",
  ) {
    // When there is request to play a card - find the right one and play it
    let played_card: Card | null = null;
    if (playerName == this.mainPlayer) {
      played_card = this.playerHand.playCard(type, value);
    } else {
      played_card = await Card.create(type, value, "pythonGen");
      this.otherPlayers.forEach((player) => {
        if (player.playerName === playerName) {
          if (played_card) player.addChild(played_card);
          player.addCardCount(-1);
        }
      });
    }

    // Played card goes to pile
    if (played_card) {
      played_card.changeContainer(this.pile);
      this.pile.playCard(played_card);
    }

    // If previous card was queen, display new color
    if (played_card?.value == "Q") {
      this.pile.displayNextColor(newColor);
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
        console.log("Time expired!");
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

    // Find the target player
    const player = this.otherPlayers.find((p) => p.playerName === playerName);
    if (!player) return;

    // Update their card count
    player.addCardCount(cardCount);

    // Create cards
    const cards: Card[] = [];
    for (let i = 0; i < cardCount; i++) {
      const card = await Card.create("", "back", "pythonGen");
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
  public show() {
    // Add player hand and deck to app
    this.addAllChildren();
    this.app.stage.addChild(this);
  }

  public hide(): void {
    this.app.stage.removeChild(this);
  }

  private expires(expireAtMs: number) {
    const now = Date.now();
    let remainingMs = expireAtMs - now;

    // Make sure it doesn't go negative
    remainingMs = remainingMs > 0 ? remainingMs : 0;

    // Convert to minutes, seconds, milliseconds
    const minutes = Math.floor(remainingMs / 1000 / 60);
    const seconds = Math.floor((remainingMs / 1000) % 60);
    const milliseconds = ((remainingMs % 1000) / 10).toFixed(0); // 2 decimal places

    // Format as mm:ss:ms
    return `${minutes}:${seconds.toString().padStart(2, "0")}:${milliseconds.padStart(2, "0")}`;
  }

  private addAllChildren(): void {
    this.addChild(this.playerHand);
    this.addChild(this.deck!);
    this.addChild(this.pile);
    this.otherPlayers.forEach((player) => {
      this.addChild(player);
    });
  }
}

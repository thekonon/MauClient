import { Application, Sprite, Container, Texture, Assets, Ticker } from "pixi.js";

// extend Sprite with custom props
interface FallingCard extends Sprite {
  fallSpeed: number;
  rotationSpeed: number;
}

export class CardManager {
  private app: Application;
  private container: Container;
  private cards: FallingCard[] = [];
  private cardTextures: Texture[] = [];

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
    this.app.stage.addChild(this.container);
  }

  // Preload card images
  public async loadCardTextures() {
    const types = ["C", "D", "H", "S"];
    const values = ["7", "8", "9", "10", "J", "Q", "K", "A"];

    const cardNames: string[] = [];

    for (const type of types) {
      for (const value of values) {
        cardNames.push(type + value);
      }
    }

    // Prepare asset list
    const assets = cardNames.map((name) => ({
      alias: name,
      src: `assets/custom/${name}.png`,
    }));

    await Assets.load(assets);

    this.cardTextures = cardNames.map((name) => Assets.get(name) as Texture);
    console.log(this.cardTextures.length);
  }

  public createFallingCards(count: number) {
    if (this.cardTextures.length === 0) {
      console.warn("⚠️ Card textures not loaded yet! Call loadCardTextures() first.");
      return;
    }

    for (let i = 0; i < count; i++) {
      const tex = this.cardTextures[Math.floor(Math.random() * this.cardTextures.length)];
      const card = new Sprite(tex) as FallingCard;
      card.alpha = 0.4;

      // Random size
      const width = Math.random() * 40 + 30;
      const scale = width / card.width;
      card.scale.set(scale);

      // Random start position
      card.x = Math.random() * this.app.renderer.width;
      card.y = -card.height;

      // Custom properties
      card.fallSpeed = Math.random() * 2 + 1;
      card.rotationSpeed = (Math.random() - 0.5) * 0.02;

      this.container.addChild(card);
      this.cards.push(card);
    }

    this.app.ticker.add(this.update, this);
  }

  private update(ticker: Ticker) {
    const delta = ticker.deltaTime;
    for (const card of this.cards) {
      card.y += card.fallSpeed * delta;
      card.rotation += card.rotationSpeed * delta;

      if (card.y > this.app.renderer.height + card.height) {
        card.y = -card.height;
        card.x = Math.random() * this.app.renderer.width;
      }
    }
  }

  public removeFallingCards() {
    for (const card of this.cards) {
      this.container.removeChild(card);
      card.destroy();
    }
    this.cards = [];
    this.app.ticker.remove(this.update, this);
  }
}

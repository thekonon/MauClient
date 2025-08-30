import {
  Application,
  Sprite,
  Container,
  Texture,
  Assets,
  Ticker,
} from "pixi.js";

export class CardManager {
  private app: Application;
  private container: Container;
  private cards: Sprite[] = [];
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
      src: `assets/pythonGen/${name}.png`,
    }));

    // Load all textures into Pixi's cache
    await Assets.load(assets);

    // Retrieve from cache
    this.cardTextures = cardNames.map((name) => Assets.get(name) as Texture);
    console.log(this.cardTextures.length);
  }

  public createFallingCards(count: number) {
    if (this.cardTextures.length === 0) {
      console.warn(
        "⚠️ Card textures not loaded yet! Call loadCardTextures() first.",
      );
      return;
    }

    for (let i = 0; i < count; i++) {
      // Pick random card texture
      const tex =
        this.cardTextures[Math.floor(Math.random() * this.cardTextures.length)];
      const card = new Sprite(tex);

      // Random size
      const width = Math.random() * 40 + 30; // 30–70px
      const scale = width / card.width;
      card.scale.set(scale);

      // Random horizontal position
      card.x = Math.random() * this.app.renderer.width;
      card.y = -card.height; // start above screen

      // Falling + rotation speed
      (card as any).fallSpeed = Math.random() * 2 + 1; // 1–3 px/frame
      (card as any).rotationSpeed = (Math.random() - 0.5) * 0.02;

      this.container.addChild(card);
      this.cards.push(card);
    }

    this.app.ticker.add(this.update, this);
  }

  private update(ticker: Ticker) {
    const delta = ticker.deltaTime; // same as old "delta"
    for (const card of this.cards) {
      card.y += (card as any).fallSpeed * delta;
      card.rotation += (card as any).rotationSpeed * delta;

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

    // Stop update loop when no cards
    this.app.ticker.remove(this.update, this);
  }
}

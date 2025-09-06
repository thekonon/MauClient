import {
  Assets,
  Sprite,
  Texture,
  Container,
  Point,
  FederatedPointerEvent,
  Graphics,
  Bounds,
} from "pixi.js";
import { gsap } from "gsap";
import { GameSettings } from "../gameSettings";
import { QueenDialog } from "./queenDialog";
import { DropShadowFilter } from "pixi-filters";

export class Card extends Container {
  // General settings of the card
  /* Types of card:
    C - Clubs
    D - Diamonds
    H - Hearts
    S - Spades
    */
  type: string;
  /* Values of card
    7
    8
    9
    10
    J - Jack
    Q - Queen
    K - King
    A - Ace
    */
  value: string;

  /* Animation properties */
  /*  end_animation_point_x / y
            - where card lands after calling play()
        rotation
            - ending angle of card  
        animation duration [s]
            - default duration of playing animation in sec
    */
  end_animation_point_x: number;
  end_animation_point_y: number;
  rotation_angle: number;
  animation_duration: number;

  /* Methods needs to be defined as callbacks */
  /*  play_card
            this method is called after pressing on card,
            play card request is sent to server
    */
  public playCardCommand: (type: string, value: string, _: string) => void;
  public card_sprite: Sprite;

  private isDragging = false;
  private dragOffset = new Point();
  private dragStartPosition = new Point();
  private wasDragged = false;
  private isDialogActive = false;
  private _useOriginOfCard: boolean = false;
  spriteContainer: any;
  bounds!: Bounds;

  /* Card has to be created in async - therefore factory is used*/
  public static async create(
    type: string,
    value: string,
    texture_name: string = "default",
    useOriginOfCard: boolean = GameSettings.useOriginOfCard,
  ): Promise<Card> {
    const texture = await Card.load_texture(type, value, texture_name);
    const sprite = new Sprite(texture);
    return new Card(type, value, sprite, useOriginOfCard);
  }

  private constructor(
    type: string,
    value: string,
    sprite: Sprite,
    useOriginOfCard: boolean = true,
  ) {
    super();

    this.type = type;
    this.value = value;
    this.card_sprite = sprite;

    this.setDefaultSize();
    this.end_animation_point_x = 0;
    this.end_animation_point_y = 0;
    this.rotation_angle = 0;
    this.animation_duration = 1;
    this.interactive = true;

    // This is the container for rotating and transforming sprite itself
    this.spriteContainer = new Container();

    this.useOriginOfCard = useOriginOfCard; // needs to be defined after spriteContainer

    this.playCardCommand = (_type: string, _value: string, _nextcard) => {
      console.warn("playCardCommand not defined");
    };


    this.makeButtonMovable()
    this.addShade();

    this.spriteContainer.addChild(sprite);
    this.addChild(this.spriteContainer);
  }

  public play(
    duration?: number,
    rotation?: number,
    onFinish: () => void = () => { },
  ) {
    if (this.useOriginOfCard) {
      gsap.to(this, {
        x: this.end_animation_point_x,
        y: this.end_animation_point_y,
        duration: duration ?? this.animation_duration,
        onComplete: onFinish,
        ease: "power1.out",
      });
      gsap.to(this.spriteContainer, {
        rotation: rotation ?? this.rotation_angle,
        duration: duration ?? this.animation_duration,
        ease: "power1.out",
      });
    } else {
      gsap.to(this, {
        x: this.end_animation_point_x,
        y: this.end_animation_point_y,
        rotation: rotation ?? this.rotation_angle,
        duration: duration ?? this.animation_duration,
        onComplete: onFinish,
        ease: "power1.out",
      });
    }
  }

  public changeContainer(newContainer: Container) {
    if (this.parent) {
      const globalPoint = this.toGlobal(new Point(0, 0));
      this.parent.removeChild(this);
      this.position.copyFrom(newContainer.toLocal(globalPoint));
      newContainer.addChild(this);
    } else {
      console.error("Can not change card container from empty one");
    }
  }

  public setGlobalEndOfAnimation(x: number, y: number, rotation: number) {
    this.rotation_angle = rotation;
    if (!this.useOriginOfCard) {
      this.end_animation_point_x = x;
      this.end_animation_point_y = y;
    }
    else {
      const topLeftEdge = new Point(
        -this.card_sprite.width / 2,
        -this.card_sprite.height / 2,
      );

      // Simulate end of rotation in order to get the end point
      const prevRotation = this.spriteContainer.rotation;
      this.spriteContainer.rotation = rotation;
      const globalDiff = this.spriteContainer.toGlobal(topLeftEdge);
      this.spriteContainer.rotation = prevRotation;

      const testGraphics = new Graphics()
        .moveTo(0, 0)
        .lineTo(topLeftEdge.x, topLeftEdge.y)
        .stroke({ width: 2, color: 0x000000 });
      this.spriteContainer.addChild(testGraphics)

      const testGraphics2 = new Graphics()
        .moveTo(0, 0)
        .lineTo(globalDiff.x, globalDiff.y)
        .stroke({ width: 2, color: 0x000000 });
      this.addChild(testGraphics2)

      this.end_animation_point_x = x - globalDiff.x;
      this.end_animation_point_y = y - globalDiff.y;
    }
  }

  public setLocalEndOfAnimation(x: number, y: number, rotation: number): void {
    this.rotation_angle = rotation;
    if (!this.useOriginOfCard) {
      this.end_animation_point_x = x;
      this.end_animation_point_y = y;
    }
    else {
      const topLeftEdge = new Point(
        -this.card_sprite.width / 2,
        -this.card_sprite.height / 2,
      );

      // Simulate end of rotation in order to get the end point
      const prevRotation = this.spriteContainer.rotation;
      this.spriteContainer.rotation = rotation;
      const localDiff = this.spriteContainer.parent.toLocal(
        this.spriteContainer.toGlobal(topLeftEdge),
      );
      this.spriteContainer.rotation = prevRotation;

      const testGraphics = new Graphics()
        .moveTo(0, 0)
        .lineTo(topLeftEdge.x, topLeftEdge.y)
        .stroke({ width: 2, color: 0x000000 });
      this.spriteContainer.addChild(testGraphics)
      this.end_animation_point_x = x - localDiff.x;
      this.end_animation_point_y = y - localDiff.y;
    }
  }

  public setDefaultSize() {
    this.card_sprite.width = GameSettings.card_width;
    this.card_sprite.height = GameSettings.card_height;
  }

  public makeButtonMovable() {
    this.on("pointerdown", this.onDragStart, this);
    this.on("pointerup", this.onDragEnd, this);
    this.on("pointerupoutside", this.onDragEnd, this);
    this.on("pointermove", this.onDragMove, this);
  }

  public removeButtonMovable() {
    this.off("pointerdown", this.onDragStart, this);
    this.off("pointerup", this.onDragEnd, this);
    this.off("pointerupoutside", this.onDragEnd, this);
    this.off("pointermove", this.onDragMove, this);
  }

  private onDragStart(event: FederatedPointerEvent): void {
    this.isDragging = true;
    this.wasDragged = false;
    this.dragOffset = event.getLocalPosition(this);
    this.dragStartPosition = event.getLocalPosition(this.parent);
    this.zIndex = 1000;
    this.alpha = 0.7;
    this.bounds = this.parent.getBounds()
  }

  private onDragMove(event: FederatedPointerEvent): void {
    if (!this.isDragging) return;

    const currentPosition = event.getLocalPosition(this.parent);
    const dx = currentPosition.x - this.dragStartPosition.x;
    const dy = currentPosition.y - this.dragStartPosition.y;

    // Set as dragged if movement is beyond threshold
    if (!this.wasDragged && Math.sqrt(dx * dx + dy * dy) > 500) {
      this.wasDragged = true;
    }

    if (currentPosition.x - this.dragOffset.x < -GameSettings.get_player_hand_width() * 0.1) {
      return;
    }
    if (currentPosition.y - this.dragOffset.y < -GameSettings.get_player_hand_height() * 0.1) {
      return;
    }
    if (currentPosition.y - this.dragOffset.y + this.card_sprite.height > GameSettings.get_player_hand_width() * 1.1) {
      return;
    }
    if (currentPosition.y - this.dragOffset.y + this.card_sprite.height > GameSettings.get_player_hand_height() * 1.1) {
      return;
    }

    this.position.set(
      currentPosition.x - this.dragOffset.x,
      currentPosition.y - this.dragOffset.y,
    );
  }

  private onDragEnd(_: FederatedPointerEvent): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.alpha = 1;
    this.zIndex = 0;

    // Click vs Drag handling
    if (!this.wasDragged) {
      this.onCardClick();
    } else {
      // Drag finished — optional: snap back or drop logic here
      console.log("snapping back")
      this.position.set(
        this.dragStartPosition.x - this.dragOffset.x,
        this.dragStartPosition.y - this.dragOffset.y,
      );
    }
  }
  private async onCardClick() {
    let nextColor = "";
    if (this.isDialogActive) {
      console.warn("There is already active dialog window for queen!");
      return;
    }
    if (this.value === "Q") {
      const dialog = new QueenDialog();
      this.isDialogActive = true;
      dialog.exitFnc = () => {
        this.parent.removeChild(dialog);
        this.isDialogActive = false;
      };
      dialog.zIndex = 999999999999;
      this.parent.addChild(dialog);
      nextColor = await dialog.show();
      this.parent.removeChild(dialog);
      this.isDialogActive = false;
    }
    this.playCardCommand(this.type, this.value, nextColor);
  }

  private static async load_texture(
    type: string,
    value: string,
    texture: string,
  ): Promise<Texture> {
    const path = `assets/${texture}/${type}${value}.png`;
    try {
      return await Assets.load(path);
    } catch {
      return await Assets.load(`assets/default/back.png`);
    }
  }

  private addShade() {
    this.card_sprite.filters = [
      new DropShadowFilter({
        offset: { x: 10, y: 10 },
        alpha: 0.6,
        blur: 6,
        color: 0x000000,
      }),
    ];
  }

  set useOriginOfCard(useOriginOfCard: boolean) {
    this._useOriginOfCard = useOriginOfCard
    if (useOriginOfCard) {
      this.card_sprite.anchor.set(0.5);
      this.spriteContainer.x = this.card_sprite.width / 2;
      this.spriteContainer.y = this.card_sprite.height / 2;
    }
    else {
      this.card_sprite.anchor.set(0);
      this.spriteContainer.x = 0;
      this.spriteContainer.y = 0;
    }
  }

  get useOriginOfCard() {
    return this._useOriginOfCard;
  }
}

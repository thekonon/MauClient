import {
  Assets,
  Sprite,
  Texture,
  Container,
  Point,
  FederatedPointerEvent,
} from "pixi.js";
import { gsap } from "gsap";
import { GameSettings } from "../gameSettings";
import { QueenDialog } from "./queenDialog";

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
  /* Textures:
    - default
    */
  texture: string;

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

  /* Card has to be created in async - therefore factory is used*/
  public static async create(
    type: string,
    value: string,
    texture_name: string = "default",
  ): Promise<Card> {
    const texture = await Card.load_texture(type, value, texture_name);
    const sprite = new Sprite(texture);
    return new Card(type, value, sprite);
  }

  private constructor(
    type: string,
    value: string,
    sprite: Sprite,
    texture: string = "default",
  ) {
    super();

    this.type = type;
    this.value = value;
    this.card_sprite = sprite;
    this.texture = texture;

    this.setDefaultSize();
    this.end_animation_point_x = 0;
    this.end_animation_point_y = 0;
    this.rotation_angle = 0;
    this.animation_duration = 1;

    this.playCardCommand = (_type: string, _value: string, _nextcard) => {
      console.warn("playCardCommand not defined");
    };

    this.interactive = true;

    this.on("pointerdown", this.onDragStart, this);
    this.on("pointerup", this.onDragEnd, this);
    this.on("pointerupoutside", this.onDragEnd, this);
    this.on("pointermove", this.onDragMove, this);

    this.addChild(sprite);
  }

  public play(
    duration?: number,
    rotation?: number,
    onFinish: () => void = () => {},
  ) {
    gsap.to(this, {
      x: this.end_animation_point_x,
      y: this.end_animation_point_y,
      rotation: rotation ?? this.rotation_angle,
      duration: duration ?? this.animation_duration,
      onComplete: onFinish,
      ease: "power1.out",
    });
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
    const globalPoint = new Point(x, y);
    const localPoint = this.toLocal(globalPoint);
    this.end_animation_point_x = localPoint.x;
    this.end_animation_point_y = localPoint.y;
    this.rotation_angle = rotation;
  }

  public setLocalEndOfAnimation(x: number, y: number, rotation: number): void {
    this.end_animation_point_x = x;
    this.end_animation_point_y = y;
    this.rotation_angle = rotation;
  }

  public setDefaultSize() {
    this.card_sprite.width = GameSettings.card_width;
    this.card_sprite.height = GameSettings.card_height;
  }

  private onDragStart(event: FederatedPointerEvent): void {
    this.isDragging = true;
    this.wasDragged = false;
    this.dragOffset = event.getLocalPosition(this);
    this.dragStartPosition = event.getLocalPosition(this.parent);
    this.zIndex = 1000;
    this.alpha = 0.7;
  }

  private onDragMove(event: FederatedPointerEvent): void {
    if (!this.isDragging) return;

    const currentPosition = event.getLocalPosition(this.parent);
    const dx = currentPosition.x - this.dragStartPosition.x;
    const dy = currentPosition.y - this.dragStartPosition.y;

    // Set as dragged if movement is beyond threshold
    if (!this.wasDragged && Math.sqrt(dx * dx + dy * dy) > 5) {
      this.wasDragged = true;
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
    }
  }
  private async onCardClick() {
    let nextColor = "";
    if (this.isDialogActive){
      console.warn("There is already active dialog window for queen!")
      return
    }
    if (this.value === "Q") {
      const dialog = new QueenDialog();
      this.isDialogActive = true;
      dialog.exitFnc = () => {this.parent.removeChild(dialog); this.isDialogActive = false;};
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
}

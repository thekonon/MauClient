import { Assets, Sprite, Texture, Container } from "pixi.js";
import { gsap } from "gsap";

export class Card extends Container {
    type: string;
    value: string;
    texture: string;
    sprite: Sprite;

    end_animation_point_x: number;
    end_animation_point_y: number;
    rotation_angle: number;
    animation_duration: number;

    public play_card: (type: string, value: string) => void;

    private constructor(type: string, value: string, sprite: Sprite) {
        super();

        this.type = type;
        this.value = value;
        this.texture = "default";

        this.sprite = sprite;
        this.addChild(sprite);

        this.end_animation_point_x = 0;
        this.end_animation_point_y = 0;
        this.rotation_angle = 0;
        this.animation_duration = 1;

        this.play_card = (_type: string, _value: string) => {
            console.log("Not defined");
        };

        this.interactive = true;
        this.on("pointerdown", () => {
            this.play_card(this.type, this.value);
        });
    }

    public static async create(type: string, value: string, height: number = 100): Promise<Card> {
        const texture = await Card.load_texture(type, value);
        const sprite = new Sprite(texture);
        const scale = height / sprite.height;
        sprite.scale.set(scale);

        return new Card(type, value, sprite);
    }

    public play(duration?: number, rotation?: number) {
        gsap.to(this, {
            x: this.end_animation_point_x,
            y: this.end_animation_point_y,
            rotation: rotation ?? this.rotation_angle,
            duration: duration ?? this.animation_duration,
            ease: "power1.out"
        });
    }

    public set_end_of_animation(x: number, y: number, rotation: number): void {
        this.end_animation_point_x = x;
        this.end_animation_point_y = y;
        this.rotation_angle = rotation;
    }

    private static async load_texture(type: string, value: string): Promise<Texture> {
        const path = `assets/default/${type}${value}.png`;
        try {
            return await Assets.load(path);
        } catch {
            return await Assets.load(`assets/default/default.png`);
        }
    }
}

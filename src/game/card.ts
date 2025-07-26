// card.ts
import { Assets, Sprite, Texture } from "pixi.js";
import { gsap } from "gsap";
export class Card {
    type: string;
    value: string;
    texture: string;
    sprite!: Sprite;

    end_animation_point_x: number;
    end_animation_point_y: number;
    rotation: number;

    animation_duration: number;

    public constructor(type: string, value: string) {
        this.type = type;
        this.value = value;
        this.texture = "default";

        this.end_animation_point_x = 0;
        this.end_animation_point_y = 0;
        this.rotation = Math.PI * 2;

        this.animation_duration = 1; // in sec
    }

    public static async create(type: string, value: string, height: number = 100): Promise<Card> {
        const card = new Card(type, value);
        const texture = await card.get_texture();
        card.sprite = new Sprite(texture);
        const scale = height / card.sprite.height;
        card.sprite.scale.set(scale);
        card.sprite.interactive = true;

        card.sprite.on("pointerdown", () => {
            card.play()
        })
        return card;
    }

    public play() {
        gsap.to(this.sprite, {
            x: this.end_animation_point_x,
            y: this.end_animation_point_y,
            rotation: this.rotation,
            duration: this.animation_duration,
            ease: "power1.out",
        })
    }

    public get_sprite(): Sprite {
        return this.sprite;
    }

    public set_end_of_animation(x: number, y: number, rotation: number): void {
        // Overload: set_end_of_animation(x, y, rotation)
        this.end_animation_point_x = x;
        this.end_animation_point_y = y;
        this.rotation = rotation;
    }

    private get_texture(): Promise<Texture> {
        const path = `assets/${this.texture}/${this.type}${this.value}.png`;
        var loaded_texture;
        try {
            loaded_texture = Assets.load(path);
        }
        catch (err) {
            const default_path = `assets/default/default.png`;
            loaded_texture = Assets.load(default_path);
        }
        return loaded_texture;
    }
}

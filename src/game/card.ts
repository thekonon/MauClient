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
    public play_card: (type: string, value: string) => void;

    animation_duration: number;

    public constructor(type: string, value: string) {
        this.type = type;
        this.value = value;
        this.texture = "default";

        this.end_animation_point_x = 0;
        this.end_animation_point_y = 0;
        this.rotation = 0;

        this.animation_duration = 1; // in sec

        this.play_card = (type: string, value: string) => {
            console.log("Not defined");   
        };
    }

    public static async create(type: string, value: string, height: number = 100): Promise<Card> {
        const card = new Card(type, value);
        const texture = await card.get_texture();
        card.sprite = new Sprite(texture);
        const scale = height / card.sprite.height;
        card.sprite.scale.set(scale);
        card.sprite.interactive = true;
        card.sprite.rotation = -Math.PI*2;

        card.sprite.on("pointerdown", () => {
            card.play_card(card.type, card.value)
        })
        return card;
    }

    public play(duration?: number, rotation?: number) {
        if(duration===undefined){
            duration = this.animation_duration;
        }
        if(rotation===undefined){
            rotation = this.rotation;
        }
        gsap.to(this.sprite, {
            x: this.end_animation_point_x,
            y: this.end_animation_point_y,
            rotation: rotation,
            duration: duration,
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

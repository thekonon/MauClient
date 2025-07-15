// card.ts
import { Assets, Sprite, Texture, DropShadowFilter } from "pixi.js";
import {gsap} from "gsap";
export class Card {
    type: string;
    value: string;
    texture: string;
    sprite!: Sprite;

    end_animation_point_x: number;
    end_animation_point_y: number;

    state: number;

    private constructor(type: string, value: string) {
        this.type = type;
        this.value = value;
        this.texture = "default";

        this.end_animation_point_x = 0;
        this.end_animation_point_y = 0;
        // 0 - spawn, 1 - hand, 2 - played
        this.state = 0;
    }

    public static async create(type: string, value: string, height: number = 100): Promise<Card> {
        const card = new Card(type, value);
        const texture = await card.get_texture();
        card.sprite = new Sprite(texture);
        const scale = height / card.sprite.height;
        card.sprite.scale.set(scale);
        card.sprite.interactive = true;
        // card.sprite.anchor.set(0.5)

        // card.sprite.filters = [
        //     new DropShadowFilter({
        //         distance: 4,
        //         rotation: 45,
        //         blur: 4,
        //         alpha: 0.5,
        //         color: 0xFFFFFF,
        //     })
        // ];

        card.sprite.on("pointerdown", () => {
            card.play()
        })
        return card;
    }

    public play(){
        gsap.to(this.get_sprite(), {
            x: this.end_animation_point_x,
            y: this.end_animation_point_y,
            rotation: Math.PI*2,
            duration: 1,
            ease: "power1.out",
            onComplete: () => {
                this.set_end_of_animation()
            }
        })
    }

    public get_sprite(): Sprite {
        return this.sprite;
    }

    public set_end_of_animation(): void{
        switch (this.state){
        case 0:
            this.end_animation_point_x = 500;
            this.end_animation_point_y = 500;
            this.state = 1;
            break;
        case 1:
            this.state = 2;
            break;
        default:
            this.state = 2;
        }

    }

    private get_texture(): Promise<Texture> {
        const path = `assets/${this.texture}/${this.type}${this.value}.png`;
        var loaded_texture;
        try
        {
            loaded_texture = Assets.load(path);
        }
        catch(err)
        {
            const default_path = `assets/default/default.png`;
            loaded_texture = Assets.load(default_path);
        }
        return loaded_texture;
    }
}

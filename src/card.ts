// card.ts
import { Assets, Sprite, Texture } from "pixi.js";
import {gsap} from "gsap";
export class Card {
    type: string;
    value: string;
    texture: string;
    sprite!: Sprite;

    private constructor(type: string, value: string) {
        this.type = type;
        this.value = value;
        this.texture = "default";
    }

    public static async create(type: string, value: string): Promise<Card> {
        const card = new Card(type, value);
        const texture = await card.get_texture();
        card.sprite = new Sprite(texture);
        card.sprite.scale.set(0.1);
        card.sprite.position.set(100, 100);
        card.sprite.interactive = true;

        card.sprite.on("pointerdown", () => {
        gsap.to(card.get_sprite(), {
            x: Math.random()*1000,
            y: Math.random()*1000,
            rotation: (Math.random()-1)*10,
            duration: 3,
            ease: "power1.out",
            })
        })
        return card;
    }

    public get_sprite(): Sprite {
        return this.sprite;
    }

    private get_texture(): Promise<Texture> {
        const path = `assets/${this.texture}/${this.type}${this.value}.png`;
        console.log(path)
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

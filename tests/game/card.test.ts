import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Application } from "pixi.js";
import { Card } from "../../src/game/card"
import { GameSettings } from "../../src/gameSettings";

const suits = ["C", "D", "H", "S"] as const;
const values = ["A", "2", "3", "4", "5", "K", "Q", "J"] as const;

let app: Application;

beforeAll(async () => {

    const canvasWidth = 414
    const canvasHeight = 896

    GameSettings.setScreenDimensions(canvasHeight, canvasWidth)

    app = new Application();
    await app.init({ background: "#1099bb", width: canvasWidth, height: canvasHeight })

    document.body.appendChild(app.canvas);
});

afterAll(() => {
    app.destroy(true, { children: true, texture: true });
});

describe("card.ts tests", () => {
    it.each(suits)("creates card with type %s", async (testedType) => {
        const card = await Card.create(testedType, "A");
        expect(card.type).toBe(testedType);
    });

    it.each(values)("creates card with value %s", async (testedValue) => {
        const card = await Card.create("C", testedValue);
        expect(card.value).toBe(testedValue);
    });
    it("test location definition", async () => {
        const newX = 100;
        const newY = 200;
        const card = await Card.create("C", "A");
        app.stage.addChild(card)
        card.setGlobalEndOfAnimation(newX, newY, 0);

        expect(card.x).toBe(0)
        expect(card.y).toBe(0)
        expect(card.parent).toBe(app.stage)

        expect(card.end_animation_point_x).toBe(newX)
        expect(card.end_animation_point_y).toBe(newY)


    })
}
)
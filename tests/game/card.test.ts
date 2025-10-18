import { describe, it, expect } from "vitest";
import { Card } from "../../src/game/card";
import { app } from "../../setupTests";

const suits = ["C", "D", "H", "S"] as const;
const values = ["A", "2", "3", "4", "5", "K", "Q", "J"] as const;

describe("card.ts assertions tests", () => {
  it.each(suits)("creates card with type %s", async (testedType) => {
    const card = await Card.create(testedType, "A");
    expect(card.type).toBe(testedType);
  });

  it.each(values)("creates card with value %s", async (testedValue) => {
    const card = await Card.create("C", testedValue);
    expect(card.value).toBe(testedValue);
  });
});
describe("card.ts unit tests", () => {
  it("test location definition without middle origin", async () => {
    const newX = 100;
    const newY = 200;
    const card = await Card.create("C", "A", "default", false);
    app.stage.addChild(card);
    card.setGlobalEndOfAnimation(newX, newY, 0);

    expect(card.x).toBe(0);
    expect(card.y).toBe(0);
    expect(card.parent).toBe(app.stage);

    expect(card.end_animation_point_x).toBeCloseTo(newX);
    expect(card.end_animation_point_y).toBeCloseTo(newY);
  });
  it("test location definition with middle origin", async () => {
    const newX = 100;
    const newY = 200;
    const card = await Card.create("C", "A", "default", true);
    app.stage.addChild(card);
    card.setGlobalEndOfAnimation(newX, newY, 0);

    expect(card.x).toBe(0);
    expect(card.y).toBe(0);
    expect(card.parent).toBe(app.stage);

    expect(card.end_animation_point_x).toBeCloseTo(newX, 5);
    expect(card.end_animation_point_y).toBeCloseTo(newY, 5);
  });
  it("test location definition with middle origin rotated", async () => {
    const newX = 0;
    const newY = 0;
    const rotation = -Math.PI / 2;
    const card = await Card.create("C", "A", "default", true);
    app.stage.addChild(card);

    card.setGlobalEndOfAnimation(newX, newY, rotation);

    const expectedX = (card.card_sprite.height - card.card_sprite.width) / 2;
    const expectedY = -(card.card_sprite.height + card.card_sprite.width) / 2;

    expect(card.end_animation_point_x).toBeCloseTo(expectedX, 5);
    expect(card.end_animation_point_y).toBeCloseTo(expectedY, 5);
  });
  it("test location definition with middle origin rotated and moved", async () => {
    const newX = 100;
    const newY = 100;
    const rotation = -Math.PI / 2;
    const card = await Card.create("C", "A", "default", true);
    app.stage.addChild(card);

    card.setGlobalEndOfAnimation(newX, newY, rotation);

    const expectedX =
      (card.card_sprite.height - card.card_sprite.width) / 2 + newX;
    const expectedY =
      -(card.card_sprite.height + card.card_sprite.width) / 2 + newY;

    expect(card.end_animation_point_x).toBeCloseTo(expectedX);
    expect(card.end_animation_point_y).toBeCloseTo(expectedY);

    const duration = 0.0001;

    const cardAnimationFinished = new Promise<void>(async (resolve) => {
      card.play(duration, undefined, resolve);
    })
    await cardAnimationFinished

    // await new Promise((res) => setTimeout(res, 1000 * duration * 1.05));

    expect(card.x).toBeCloseTo(expectedX);
    expect(card.y).toBeCloseTo(expectedY);
  });
});

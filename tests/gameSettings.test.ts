import { describe, test, expect, beforeEach, vi } from "vitest";
import { GameSettings } from "../src/gameSettings";

describe("GameSettings", () => {
  // Setup common test dimensions
  const TEST_WIDTH = 1200;
  const TEST_HEIGHT = 800;

  beforeEach(() => {
    // Reset to default values before each test
    GameSettings.setScreenDimensions(TEST_HEIGHT, TEST_WIDTH);
  });

  describe("Static Properties", () => {
    test("should have correct default values", () => {
      expect(GameSettings.useOriginOfCard).toBe(false);
      expect(GameSettings.player_hand_width_percent).toBe(80);
      expect(GameSettings.player_hand_height_percent).toBe(30);
      expect(GameSettings.player_hand_card_delta).toBe(5);
      expect(GameSettings.deck_margin).toBe(50);
      expect(GameSettings.dialog_window_color).toBe(0x00ff00);
      expect(GameSettings.otherPlayerMarginsPercent).toBe(1);
    });
  });

  describe("setScreenDimensions", () => {
    test("should set screen dimensions correctly", () => {
      GameSettings.setScreenDimensions(1000, 1500);
      expect(GameSettings.screen_height).toBe(1000);
      expect(GameSettings.screen_width).toBe(1500);
    });

    test("should handle zero dimensions", () => {
      GameSettings.setScreenDimensions(0, 0);
      expect(GameSettings.screen_height).toBe(0);
      expect(GameSettings.screen_width).toBe(0);
    });

    test("should handle large dimensions", () => {
      const largeHeight = 4000;
      const largeWidth = 6000;
      GameSettings.setScreenDimensions(largeHeight, largeWidth);
      expect(GameSettings.screen_height).toBe(largeHeight);
      expect(GameSettings.screen_width).toBe(largeWidth);
    });
  });

  describe("Canvas dimensions", () => {
    test("get_canvas_height should return screen_height", () => {
      expect(GameSettings.get_canvas_height()).toBe(TEST_HEIGHT);
    });

    test("get_canvas_width should return screen_width", () => {
      expect(GameSettings.get_canvas_width()).toBe(TEST_WIDTH);
    });

    test("get_mid_x should return half of canvas width", () => {
      expect(GameSettings.get_mid_x()).toBe(TEST_WIDTH / 2);
    });

    test("get_mid_y should return half of canvas height", () => {
      expect(GameSettings.get_mid_y()).toBe(TEST_HEIGHT / 2);
    });
  });

  describe("Card dimensions", () => {
    test("card_height should be calculated correctly", () => {
      const expectedPlayerHandHeight = (TEST_HEIGHT * 30) / 100; // 240
      const expectedPadding = expectedPlayerHandHeight * 0.05; // 12
      const expectedCardHeight = expectedPlayerHandHeight - expectedPadding * 2; // 216
      expect(GameSettings.card_height).toBe(expectedCardHeight);
    });

    test("card_width should maintain 9:15 aspect ratio", () => {
      const cardHeight = GameSettings.card_height;
      const expectedCardWidth = (cardHeight * 9) / 15;
      expect(GameSettings.card_width).toBe(expectedCardWidth);
    });

    test("player_hand_padding should be 5% of player hand height", () => {
      const playerHandHeight = GameSettings.get_player_hand_height();
      const expectedPadding = playerHandHeight * 0.05;
      expect(GameSettings.player_hand_padding).toBe(expectedPadding);
    });
  });

  describe("Font size", () => {
    test("fontSize should be 5% of screen height", () => {
      const expectedFontSize = TEST_HEIGHT * 0.05;
      expect(GameSettings.fontSize).toBe(expectedFontSize);
    });
  });

  describe("Deck positioning", () => {
    test("get_deck_top_x should be mid_x plus deck_margin", () => {
      const expectedX = GameSettings.get_mid_x() + GameSettings.deck_margin;
      expect(GameSettings.get_deck_top_x()).toBe(expectedX);
    });

    test("get_deck_top_y should be mid_y minus half card height", () => {
      const expectedY = GameSettings.get_mid_y() - GameSettings.card_height / 2;
      expect(GameSettings.get_deck_top_y()).toBe(expectedY);
    });
  });

  describe("Player hand positioning", () => {
    test("get_player_hand_top_x should calculate correctly", () => {
      const midX = GameSettings.get_mid_x();
      const widthPercent = GameSettings.player_hand_width_percent;
      const expectedX = midX * (1 - widthPercent / 100);
      expect(GameSettings.get_player_hand_top_x()).toBe(expectedX);
    });

    test("get_player_hand_top_y should calculate correctly", () => {
      const canvasHeight = GameSettings.get_canvas_height();
      const heightPercent = GameSettings.player_hand_height_percent;
      const expectedY = canvasHeight * (1 - heightPercent / 100);
      expect(GameSettings.get_player_hand_top_y()).toBe(expectedY);
    });

    test("get_player_hand_bot_x should calculate correctly", () => {
      const midX = GameSettings.get_mid_x();
      const widthPercent = GameSettings.player_hand_width_percent;
      const expectedX = midX + (midX * widthPercent) / 200;
      expect(GameSettings.get_player_hand_bot_x()).toBe(expectedX);
    });

    test("get_player_hand_bot_y should return canvas height", () => {
      expect(GameSettings.get_player_hand_bot_y()).toBe(GameSettings.get_canvas_height());
    });

    test("get_player_hand_width should calculate correctly", () => {
      const screenWidth = GameSettings.screen_width;
      const widthPercent = GameSettings.player_hand_width_percent;
      const expectedWidth = (screenWidth * widthPercent) / 100;
      expect(GameSettings.get_player_hand_width()).toBe(expectedWidth);
    });

    test("get_player_hand_height should calculate correctly", () => {
      const screenHeight = GameSettings.screen_height;
      const heightPercent = GameSettings.player_hand_height_percent;
      const expectedHeight = (screenHeight * heightPercent) / 100;
      expect(GameSettings.get_player_hand_height()).toBe(expectedHeight);
    });
  });

  describe("Player hand button dimensions", () => {
    test("playerHandButtonWidth should be fontSize * 7", () => {
      const expectedWidth = GameSettings.fontSize * 7;
      expect(GameSettings.playerHandButtonWidth).toBe(expectedWidth);
    });

    test("playerHandButtonHeight should be fontSize * 3", () => {
      const expectedHeight = GameSettings.fontSize * 3;
      expect(GameSettings.playerHandButtonHeight).toBe(expectedHeight);
    });

    test("playerHandButtonRadius should be fontSize / 3", () => {
      const expectedRadius = GameSettings.fontSize / 3;
      expect(GameSettings.playerHandButtonRadius).toBe(expectedRadius);
    });
  });

  describe("Other players positioning and sizing", () => {
    test("otherPlayerCardSizeScale should calculate correctly", () => {
      const screenWidth = GameSettings.screen_width;
      const playerHandWidthPercent = GameSettings.player_hand_width_percent;
      const marginsPercent = GameSettings.otherPlayerMarginsPercent;
      const cardWidth = GameSettings.card_width;

      const expectedScale =
        (screenWidth * (1 - playerHandWidthPercent / 100 - (4 * marginsPercent) / 100)) / 2 / cardWidth;
      expect(GameSettings.otherPlayerCardSizeScale).toBe(expectedScale);
    });

    test("getOtherPlayerWidth should return scaled card width", () => {
      const expectedWidth = GameSettings.card_width * GameSettings.otherPlayerCardSizeScale;
      expect(GameSettings.getOtherPlayerWidth()).toBe(expectedWidth);
    });

    test("getOtherPlayerHeight should return scaled card height", () => {
      const expectedHeight = GameSettings.card_height * GameSettings.otherPlayerCardSizeScale;
      expect(GameSettings.getOtherPlayerHeight()).toBe(expectedHeight);
    });

    describe("getOtherPlayerX", () => {
      test("should return left margin for index 0 and 1", () => {
        const expectedX = GameSettings.screen_width * (GameSettings.otherPlayerMarginsPercent / 100);
        expect(GameSettings.getOtherPlayerX(0)).toBe(expectedX);
        expect(GameSettings.getOtherPlayerX(1)).toBe(expectedX);
      });

      test("should return right position for index 2 and above", () => {
        const expectedX =
          GameSettings.screen_width -
          GameSettings.getOtherPlayerWidth() -
          GameSettings.screen_width * (GameSettings.otherPlayerMarginsPercent / 100);
        expect(GameSettings.getOtherPlayerX(2)).toBe(expectedX);
        expect(GameSettings.getOtherPlayerX(3)).toBe(expectedX);
      });
    });

    describe("getOtherPlayerY", () => {
      test("should return top margin for index 0 and 2", () => {
        const expectedY = (GameSettings.screen_width * GameSettings.otherPlayerMarginsPercent) / 100;
        expect(GameSettings.getOtherPlayerY(0)).toBe(expectedY);
        expect(GameSettings.getOtherPlayerY(2)).toBe(expectedY);
      });

      test("should return bottom position for index 1 and 3", () => {
        const expectedY =
          GameSettings.screen_height * (1 - (4 * GameSettings.otherPlayerMarginsPercent) / 100) -
          GameSettings.getOtherPlayerHeight() -
          2 * GameSettings.fontSize;
        expect(GameSettings.getOtherPlayerY(1)).toBe(expectedY);
        expect(GameSettings.getOtherPlayerY(3)).toBe(expectedY);
      });
    });
  });

  describe("Edge cases and different screen sizes", () => {
    test("should handle very small screen dimensions", () => {
      GameSettings.setScreenDimensions(100, 200);

      // Should not throw errors
      expect(() => {
        GameSettings.card_height;
        GameSettings.card_width;
        GameSettings.get_player_hand_width();
        GameSettings.get_player_hand_height();
        GameSettings.getOtherPlayerWidth();
        GameSettings.getOtherPlayerHeight();
      }).not.toThrow();
    });

    test("should handle very large screen dimensions", () => {
      GameSettings.setScreenDimensions(8000, 12000);

      // Should not throw errors and values should be proportional
      expect(GameSettings.card_height).toBeGreaterThan(0);
      expect(GameSettings.card_width).toBeGreaterThan(0);
      expect(GameSettings.get_player_hand_width()).toBeGreaterThan(0);
      expect(GameSettings.get_player_hand_height()).toBeGreaterThan(0);
    });

    test("should maintain aspect ratio across different screen sizes", () => {
      const testSizes = [
        [800, 600],
        [1920, 1080],
        [2560, 1440],
        [3840, 2160],
      ];

      testSizes.forEach(([height, width]) => {
        GameSettings.setScreenDimensions(height, width);
        const aspectRatio = GameSettings.card_width / GameSettings.card_height;
        expect(aspectRatio).toBeCloseTo(9 / 15, 5);
      });
    });
  });

  describe("Mathematical consistency", () => {
    test("player hand dimensions should be consistent with percentages", () => {
      const expectedWidth = (TEST_WIDTH * GameSettings.player_hand_width_percent) / 100;
      const expectedHeight = (TEST_HEIGHT * GameSettings.player_hand_height_percent) / 100;

      expect(GameSettings.get_player_hand_width()).toBe(expectedWidth);
      expect(GameSettings.get_player_hand_height()).toBe(expectedHeight);
    });

    test("deck position should be relative to center", () => {
      const centerX = GameSettings.get_mid_x();
      const centerY = GameSettings.get_mid_y();

      expect(GameSettings.get_deck_top_x()).toBe(centerX + GameSettings.deck_margin);
      expect(GameSettings.get_deck_top_y()).toBe(centerY - GameSettings.card_height / 2);
    });
  });
});

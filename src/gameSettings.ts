export class GameSettings {
  // General
  static screen_height: number;
  static screen_width: number;
  static texturePack: string = "custom";

  static useOriginOfCard: boolean = false;

  // Player hand
  static player_hand_width_percent = 80;
  static player_hand_height_percent = 30;
  static player_hand_card_delta = 5;

  // Deck
  static deck_margin = 50;

  // Queen dialog window
  static dialog_window_color = 0x00ff00;

  // Other players settings
  static otherPlayerMarginsPercent = 1;
  // static otherPLayerGapPercent = 30;

  static basicInit() {
    const texturePack = localStorage.getItem("texturePack");
    if (texturePack) {
      GameSettings.setTexturePack(texturePack);
    }

    GameSettings.setScreenDimensions(window.innerHeight, window.innerWidth);
  }

  static setTexturePack(texturePack: string) {
    GameSettings.texturePack = texturePack;
  }

  static getTexturePack(): string {
    return GameSettings.texturePack;
  }

  static setScreenDimensions(height: number, width: number) {
    GameSettings.screen_height = height;
    GameSettings.screen_width = width;
  }

  static get card_height() {
    return this.get_player_hand_height() - this.player_hand_padding * 2;
  }

  static get card_width() {
    // return 100
    return (this.card_height * 9) / 15;
  }

  static get player_hand_padding() {
    return this.get_player_hand_height() * 0.05;
  }

  static get fontSize() {
    return this.screen_height * 0.05;
  }

  static get_deck_top_x() {
    return this.get_mid_x() + this.deck_margin;
  }

  static get_deck_top_y() {
    return this.get_mid_y() - this.card_height / 2;
  }

  static get_player_hand_top_x() {
    return this.get_mid_x() * (1 - this.player_hand_width_percent / 100);
  }

  static get_player_hand_top_y() {
    return this.get_canvas_height() * (1 - this.player_hand_height_percent / 100);
  }

  static get_player_hand_bot_x() {
    return this.get_mid_x() + (this.get_mid_x() * this.player_hand_width_percent) / 200;
  }

  static get_player_hand_bot_y() {
    return this.get_canvas_height();
  }

  static get_player_hand_width() {
    return (this.screen_width * this.player_hand_width_percent) / 100;
  }

  static get_player_hand_height() {
    return (this.screen_height * this.player_hand_height_percent) / 100;
  }

  static get playerHandButtonWidth() {
    return this.fontSize * 7;
  }

  static get playerHandButtonHeight() {
    return this.fontSize * 3;
  }

  static get playerHandButtonRadius() {
    return this.fontSize / 3;
  }

  static get_mid_x() {
    return this.get_canvas_width() / 2;
  }

  static get_mid_y() {
    return this.get_canvas_height() / 2;
  }

  static get_canvas_height(): number {
    return this.screen_height;
  }

  static get_canvas_width(): number {
    return this.screen_width;
  }

  static get otherPlayerCardSizeScale() {
    return (
      (this.screen_width * (1 - this.player_hand_width_percent / 100 - (4 * this.otherPlayerMarginsPercent) / 100)) /
      2 /
      this.card_width
    );
  }

  static getOtherPlayerWidth(): number {
    // return this.screen_width*(1 - this.player_hand_width_percent/100-4*this.otherPlayerMarginsPercent/100)/2;
    return this.card_width * this.otherPlayerCardSizeScale;
  }

  static getOtherPlayerHeight(): number {
    return this.card_height * this.otherPlayerCardSizeScale;
  }

  static getOtherPlayerX(index: number): number {
    if (index < 2) {
      return this.screen_width * (this.otherPlayerMarginsPercent / 100);
    } else {
      return (
        this.screen_width - this.getOtherPlayerWidth() - this.screen_width * (this.otherPlayerMarginsPercent / 100)
      );
    }
  }
  static getOtherPlayerY(index: number): number {
    if (index === 0 || index === 2) {
      return (this.screen_width * this.otherPlayerMarginsPercent) / 100;
    } else {
      return (
        this.screen_height * (1 - (4 * this.otherPlayerMarginsPercent) / 100) -
        this.getOtherPlayerHeight() -
        2 * this.fontSize
      );
    }
  }
}

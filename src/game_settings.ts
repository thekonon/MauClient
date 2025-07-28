export class GameSettings {
    // General
    static screen_height: number;
    static screen_width: number;

    // Loading screen
    static loading_screen_width_percent = 50;
    static loading_screen_height_percent = 75;
    static loading_screen_round_edge = 50;

    // Player hand
    static player_hand_width_percent = 80;
    static player_hand_height_percent = 25;
    static player_hand_padding = 20;
    static player_hand_card_delta = 10;

    // Deck
    static deck_margin = 50;

    // Queen dialog window
    static dialog_window_pos = [100, 100];
    static dialog_window_dim = [300, 300];
    static dialog_window_radius = 15;
    static dialog_window_padding = 15;
    static dialog_window_color = 0x00ff00;

    static setScreenDimensions(height: number, width: number) {
        GameSettings.screen_height = height;
        GameSettings.screen_width = width;
    }

    static get card_height() {
        return this.get_player_hand_height() - this.player_hand_padding * 2;
    }

    static get card_width() {
        return this.card_height * 9 / 15;
    }

    static get_loading_screen_top_x() {
        return this.get_mid_x() - this.get_loading_screen_width() / 2;
    }

    static get_loading_screen_top_y() {
        return this.get_mid_y() - this.get_loading_screen_height() / 2;
    }

    static get_loading_screen_width() {
        return this.screen_width * this.loading_screen_width_percent / 100;
    }

    static get_loading_screen_height() {
        return this.screen_height * this.loading_screen_height_percent / 100;
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
        return this.get_mid_x() + this.get_mid_x() * this.player_hand_width_percent / 200;
    }

    static get_player_hand_bot_y() {
        return this.get_canvas_height();
    }

    static get_player_hand_width() {
        return this.screen_width * this.player_hand_width_percent / 100;
    }

    static get_player_hand_height() {
        return this.screen_height * this.player_hand_height_percent / 100;
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
}

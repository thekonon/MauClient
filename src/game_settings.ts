export class GameSettings{
    screen_height: number;
    screen_width: number;

    player_hand_width_percent: number;
    player_hand_height_percent: number;
    player_hand_padding: number;
    player_hand_card_delta: number;

    card_height: number;
    card_width: number;

    deck_margin: number;


    public constructor(screen_height: number, screen_width: number){
        this.screen_height = screen_height;
        this.screen_width = screen_width;

        // User settings
        this.player_hand_height_percent = 25;
        this.player_hand_width_percent = 80;
        this.player_hand_padding = 20;
        this.player_hand_card_delta = 10;

        this.card_height = this.get_player_hand_height() - this.player_hand_padding*2;
        this.card_width = this.card_height*9/15

        this.deck_margin = 50;

    }
    public get_deck_top_x(){
        return this.get_mid_x() + this.deck_margin;
    }

    public get_deck_top_y(){
        return this.get_mid_y() - this.card_height/2;
    }

    public get_player_hand_top_x(){
        // /2 is due to the mid is in half
        return this.get_mid_x() * (1 - this.player_hand_width_percent / 100);
    }

    public get_player_hand_top_y(){
        return this.get_canvas_height() * (1 - this.player_hand_height_percent/100)
    }

    public get_player_hand_bot_x(){
        // /2 is due to the mid is in half
        return this.get_mid_x() + this.get_mid_x()*this.player_hand_width_percent / 200;
    }

    public get_player_hand_bot_y(){
        return this.get_canvas_height();
    }

    public get_player_hand_width(){
        return this.screen_width*this.player_hand_width_percent/100
    }

    public get_player_hand_height(){
        return this.screen_height*this.player_hand_height_percent/100
    }

    public get_mid_x(){
        return this.get_canvas_width() / 2;
    }
    
    public get_mid_y(){
        return this.get_canvas_height() / 2;
    }

    public get_canvas_height(): number{
        return this.screen_height;
    }

    public get_canvas_width(): number{
        return this.screen_width;
    }

}
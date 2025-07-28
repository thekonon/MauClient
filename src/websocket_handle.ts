import { Card } from "./game/card.ts";

export class WebSocketHandle {
    private socket!: WebSocket;
    private url: string;
    private readonly cardNameMap = new Map<string, string>([
        ["ACE", "A"],
        ["KING", "K"],
        ["QUEEN", "Q"],
        ["JACK", "J"],
        ["TEN", "10"],
        ["NINE", "9"],
        ["EIGHT", "8"],
        ["SEVEN", "7"],
        ["SIX", "6"],

        ["HEARTS", "H"],
        ["SPADES", "S"],
        ["CLUBS", "C"],
        ["DIAMONDS", "D"]
    ]);
    private readonly cardShortToFullMap = new Map<string, string>(
        Array.from(this.cardNameMap.entries()).map(([key, value]) => [value, key])
    );

    // Game actions
    public draw_a_card!: (card: Card) => void;
    public update_player_list!: (player_list: string[]) => void;
    public add_player!: (player: string) => void;
    public start_game!: () => void;
    public start_pile!: (card: Card) => void;
    public play_card!: (type: string, value: string) => void;
    public select_queen_color!: () => void;
    ip: string;
    port: string;

    // Websocket event
    public onOpen(): void { }
    public onClose(): void { }
    public onError(error: Event): void { }

    // Game state
    game_started: boolean;

    // User data
    user_name: string;
    user_id: string;

    // Connectio data

    // Previously played card
    previous_card_type: string;
    previous_card_value: string;

    constructor() {
        this.ip = "";
        this.port = "";

        this.game_started = false;
        this.url = ""
        this.user_name = ""
        this.user_id = ""

        this.previous_card_type = "";
        this.previous_card_value = "";
    }

    public set_ip_port(ip: string, port: string) {
        this.ip = ip;
        this.port = port;
    }

    public set_user(user_name: string) {
        this.user_name = user_name;
    }

    public create_connection() {
        if (this.user_name == "") {
            throw new Error("UserName must be set first")
        }
        if (this.ip == "") {
            throw new Error("UserName must be set first")
        }
        if (this.port == "") {
            throw new Error("UserName must be set first")
        }
        this.url = `ws://${this.ip}:${this.port}/game?user=${this.user_name}`;
        this.socket = this.createSocket();
    }

    private createSocket(): WebSocket {
        // console.log("Trying to connect to: ", this.url)
        const socket = new WebSocket(this.url);

        socket.addEventListener("open", () => {
            console.log("WebSocket connected");
            this.onOpen();
        });

        socket.addEventListener("message", (event) => {
            console.log("Received from WS:", event.data);
            this.onMessage(event.data);
        });

        socket.addEventListener("error", (error) => {
            console.error("WebSocket error:", error);
            this.onError(error);
        });

        socket.addEventListener("close", () => {
            console.log("WebSocket disconnected");
            this.onClose();
        });

        return socket;
    }

    public send(data: string): void {
        if (this.socket.readyState === WebSocket.OPEN) {
            console.log("Sending data", data)
            this.socket.send(data);
        } else {
            console.warn("WebSocket not open. Cannot send:", data);
        }
    }

    // Call this method when there is a draw card request
    public draw_card_request() {
        const draw_command = '{"type":"DRAW"}';
        this.send(draw_command);
    }

    public play_card_command(type: string, value: string, next_color: string = "SPADES") {
        const message = JSON.stringify({
            type: "PLAY",
            card: {
                type: this.cardShortToFullMap.get(value),
                color: this.cardShortToFullMap.get(type)
            },
            nextColor: next_color
        });
        this.send(message);
        this.previous_card_type = type;
        this.previous_card_value = value;
    }

    // Event hooks (can be overridden or assigned externally)
    public async onMessage(data: string): Promise<void> {
        //{"body":{"name":"CardException","message":"Next color not specified, when played QUEEN.","timestamp":"2025-07-27T16:39:30.578998735Z"},"responseType":"ERROR"}
        try {
            const message = JSON.parse(data);
            // console.log("Type of msg: ", message.type);
            /* Handle normal messages */
            switch (message.type) {
                case "PLAYERS":
                    this.players_action(message);
                    break;
                case "REGISTER_PLAYER":
                    this.register_player_action(message);
                    break;
                case "START_GAME":
                    // console.log("Starting game detected")
                    this.game_started = true;
                    this.start_game_action();
                    break
                case "START_PILE":
                    if (this.game_started) {
                        // console.log("Calling start pile action")
                        this.start_pile_action(message);
                    } else {
                        console.error("Can not start pile when game is not started");
                    }
                    break;
                case "DRAW":
                    if (this.game_started) {
                        this.draw_card_action(message);
                    } else {
                        console.error("Can not draw when game is not started")
                    }
                    break;
                case "PLAY_CARD":
                    if (this.game_started) {
                        this.play_card_action(message);
                    }
                    else {
                        console.error("Can not play card when game is not started")
                    }
                    break;
                case "PLAYER_SHIFT":
                    break;
                case "HIDDEN_DRAW":
                    break;
                default:
                    console.log("Other message");
                    console.log(message.body.name)
                    /* Handle error messages */
                    switch (message.body.name) {
                        case "CardException":
                            if (message.body.message === "Next color not specified, when played QUEEN."){
                                this.select_queen_color();
                                console.log("Now dialog have to be displayed + prev card played")
                            }
                    }
            }
        } catch (err) {
            console.error("Invalid JSON or message format:", err);
        }
    }
    public play_card_action(message: any) {
        console.log("message:", message)
        const card_info = message.card;
        console.log(card_info)
        this.play_card(
            this.cardNameMap.get(card_info.color)!,
            this.cardNameMap.get(card_info.type)!
        );
    }

    public start_game_action() {
        this.start_game();
    }

    public register_player_action(message: any) {
        // console.log("Player is beeing registered");
        const player = message.playerDto.username;
        this.add_player(player)
    }

    public players_action(message: any) {
        const players = message.players;
        // console.log(players);
        this.update_player_list(players);
    }

    public async start_pile_action(message: any) {
        // console.log("Starting pile");
        const card_info = message.card;
        const card = await Card.create(
            this.cardNameMap.get(card_info.color)!,
            this.cardNameMap.get(card_info.type)!
        );

        card.end_animation_point_x = card.position.x;
        card.end_animation_point_y = card.position.y;
        card.end_animation_point_x -= card.width * 1.1;
        card.end_animation_point_y += card.height * 0.3;

        card.rotation = Math.PI / 2;
        this.start_pile(card);
    }

    public async draw_card_action(message: any) {
        for (const card_info of message.cards) {
            // console.log("Drawing: ", card_info.type, card_info.color);
            const type = card_info.type;
            const color = card_info.color;

            const card = await Card.create(this.cardNameMap.get(color)!, this.cardNameMap.get(type)!);
            card.play_card = this.play_card_command.bind(this)
            this.draw_a_card(card);
        }
    }

    private getRandomCardAndColor() {
        const entries = Array.from(this.cardNameMap.keys());

        // Separate type (ranks) and color (suits)
        const types = entries.slice(0, 9);   // "ACE", "KING", ..., "SIX"
        const colors = entries.slice(9);     // "HEARTS", "SPADES", "CLUBS", "DIAMONDS"

        // Pick random type and color
        const randomType = types[Math.floor(Math.random() * types.length)];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        // Return the full message
        return {
            type: "DRAW",
            cards: [
                {
                    type: randomType,
                    color: randomColor
                }
            ]
        };
    }
}

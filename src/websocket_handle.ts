import { Card } from "./game/card.ts";

export class WebSocketHandle {
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
    public draw_a_card: (card: Card) => void = (_: Card) => { };
    public update_player_list!: (player_list: string[]) => void;
    public add_player!: (player: string) => void;
    public start_game!: () => void;
    public start_pile!: (card: Card) => void;
    public play_card!: (user: string, type: string, value: string) => Promise<void>;
    public select_queen_color!: () => void;
    public ip: string;
    public port: string;

    // Websocket event
    public onOpen(): void { }
    public onClose(): void { }
    public onError(error: Event): void { }

    // Game state
    game_started: boolean;

    // User data
    userName: string;
    userID: string;

    // Connectio data
    private socket!: WebSocket;
    private url: string;

    constructor() {
        this.ip = "";
        this.port = "";

        this.game_started = false;
        this.url = ""
        this.userName = ""
        this.userID = ""
    }

    public set_ip_port(ip: string, port: string) {
        this.ip = ip;
        this.port = port;
    }

    public set_user(user_name: string) {
        this.userName = user_name;
    }

    public create_connection() {
        if (this.userName == "") {
            throw new Error("UserName must be set first")
        }
        if (this.ip == "") {
            throw new Error("UserName must be set first")
        }
        if (this.port == "") {
            throw new Error("UserName must be set first")
        }
        this.url = `ws://${this.ip}:${this.port}/game?user=${this.userName}`;
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
        const draw_command = JSON.stringify({
            requestType: "MOVE",
            move: {
                "moveType": "DRAW"
            }});
        this.send(draw_command);
    }

    public play_card_command(type: string, value: string, nextColor: string = "") {
        // TODO: Implement next color
        const message = JSON.stringify({
            requestType: "MOVE",
            move: {
                "moveType": "PLAY",
                "card": {
                    "color": this.cardShortToFullMap.get(type),
                    "type": this.cardShortToFullMap.get(value)
                },
            nextColor: "CLUBS"//nextColor
            }});
            //
        this.send(message);
    }

    public play_pass_command() {
        const pass_command = JSON.stringify({
            requestType: "MOVE",
            move: {
                "moveType": "PASS"
            }});
        this.send(pass_command);
    }

    // Event hooks (can be overridden or assigned externally)
    public async onMessage(data: string): Promise<void> {
        try {
            const message = JSON.parse(data);
            switch (message.messageType) {
                case "ACTION":
                    this.handleAction(message.action);
                    break;
                case "ERROR":
                    console.error("Error detected, not implemented yet");
                    break;
                default:
                    console.error("Message type", message.messageType, "not defined yet");
            }
        }
        catch (err) {
            console.error("Invalid JSON or message format:", err);
        }
    }

    private handleAction(message: any) {
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
        }
    }

    public play_card_action(message: any) {
        const card_info = message.card;
        const playerDto = message.playerDto;
        this.play_card(
            playerDto.username,
            this.cardNameMap.get(card_info.color)!,
            this.cardNameMap.get(card_info.type)!
        );
    }

    public start_game_action() {
        this.start_game();
    }

    public register_player_action(message: any) {
        const player = message.playerDto.username;
        this.add_player(player)
    }

    public players_action(message: any) {
        const players = message.players;
        this.update_player_list(players);
    }

    public async start_pile_action(message: any) {
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
            const type = card_info.type;
            const color = card_info.color;
            console.log("Drawing card")

            const card = await Card.create(this.cardNameMap.get(color)!, this.cardNameMap.get(type)!);
            card.play_card = (type: string, value: string) => { this.play_card_command(type, value) }
            //this.play_card_command.bind(this)
            this.draw_a_card(card);
        }
    }
}

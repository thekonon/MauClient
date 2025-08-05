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
    public drawCardAction: (card: Card) => void = (_: Card) => { };
    public update_player_list!: (player_list: string[]) => void;
    public add_player!: (player: string) => void;
    public start_game!: () => void;
    public start_pile!: (card: Card) => void;
    public playCardAction!: (user: string, type: string, value: string, newColor: string) => Promise<void>;
    public shiftPlayerAction: (userName: string) => void = (_) => {console.warn("ShiftPlayerAction not defined in WS")}
    public hiddenDrawAction: (userName: string, cardCount: number) => void = (_, __) => {console.warn("hiddenDrawAction not defined in WS")}
    public ip: string;
    public port: string;

    // Websocket event
    public onOpen(): void { }
    public onClose(): void { }
    public onError(_: Event): void { }

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
            }
        });
        this.send(draw_command);
    }

    public play_card_command(type: string, value: string, nextColor: string = "") {
        const move: any = {
            moveType: "PLAY",
            card: {
                color: this.cardShortToFullMap.get(type),
                type: this.cardShortToFullMap.get(value),
            },
        };

        if (nextColor !== "") {
            move.nextColor = nextColor;
        }

        const message = JSON.stringify({
            requestType: "MOVE",
            move,
        });

        this.send(message);
    }

    public play_pass_command() {
        const pass_command = JSON.stringify({
            requestType: "MOVE",
            move: {
                "moveType": "PASS"
            }
        });
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
                this.game_started = true;
                this.start_game_action();
                break
            case "START_PILE":
                if (this.game_started) {
                    this.start_pile_action(message);
                } else {
                    console.error("Can not start pile when game is not started");
                }
                break;
            case "DRAW":
                if (this.game_started) {
                    this.drawCard(message);
                } else {
                    console.error("Can not draw when game is not started")
                }
                break;
            case "PLAY_CARD":
                if (this.game_started) {
                    this.playCard(message);
                }
                else {
                    console.error("Can not play card when game is not started")
                }
                break;
            case "PLAYER_SHIFT":
                console.log("Shifting player")
                this.shiftPlayer(message.playerDto.username)
                break;
            case "HIDDEN_DRAW":
                console.log("Someone took card, but secretly! Psst")
                this.hiddenDraw(message.playerDto.username, message.count)
                break;
        }
    }

    public playCard(message: any) {
        const card_info = message.card;
        const playerDto = message.playerDto;
        const nextColor = message.nextColor; // this field exists only sometimes, handle it
        const chosenNextColor = nextColor ? this.cardNameMap.get(nextColor) ?? "" : "";
        this.playCardAction(
            playerDto.username,
            this.cardNameMap.get(card_info.color)!,
            this.cardNameMap.get(card_info.type)!,
            chosenNextColor
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

    public async drawCard(message: any) {
        for (const card_info of message.cards) {
            const type = card_info.type;
            const color = card_info.color;

            const card = await Card.create(this.cardNameMap.get(color)!, this.cardNameMap.get(type)!);
            card.play_card_action = (type: string, value: string, nextColor: string) => { this.play_card_command(type, value, nextColor) }
            this.drawCardAction(card);
        }
    }

    private shiftPlayer(activePlayerName: string){
        console.log("ShiftPlayer inner")
        this.shiftPlayerAction(activePlayerName)
    }

    private hiddenDraw(playerName: string, count: number){
        this.hiddenDrawAction(playerName, count)
    }

    private setUUID(uuid = "urmomgayUUID") {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7); // 7 days from now
        document.cookie = `uuid=${uuid}; expires=${expirationDate.toUTCString()}; path=/`;
    }

    private getUUID(): string|null {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [key, value] = cookie.trim().split('=');
            if (key === 'uuid') {
                return decodeURIComponent(value);
            }
        }
        return null;
    }
}

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

    // Game actions
    public draw_a_card!: (card: Card) => void;
    public update_player_list!: (player_list: string[]) => void;
    public add_player!: (player: string) => void;
    public start_game!: () => void;
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

    constructor() {
        this.ip = "";
        this.port = "";

        this.game_started = false;
        this.url = ""
        this.user_name = ""
        this.user_id = ""
    }

    public set_ip_port(ip: string, port: string){
        this.ip = ip;
        this.port = port;
    }

    public set_user(user_name: string){
        this.user_name = user_name;
    }

    public create_connection(){
        if(this.user_name == ""){
            throw new Error("UserName must be set first")
        }
        if(this.ip == ""){
            throw new Error("UserName must be set first")
        }
        if(this.port == ""){
            throw new Error("UserName must be set first")
        }
        this.url = `ws://${this.ip}:${this.port}/game?user=${this.user_name}`;
        this.socket = this.createSocket();
    }

    private createSocket(): WebSocket {
        console.log("Trying to connect to: ", this.url)
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
    public draw_card_request(){
        const draw_command = '{"TYPE":"DRAW", "USER": "THEKONO"}';
        this.send(draw_command);
    }

    // Event hooks (can be overridden or assigned externally)
    public async onMessage(data: string): Promise<void> {
        try {
            const message = JSON.parse(data);
            switch(message.type){
                case "START_GAME":
                    console.log("Starting game detected")
                    this.start_game_action(message);
                    break
                case "DRAW":
                    if(this.game_started){
                        this.draw_card_action(message);
                    }
                    break
                case "PLAYERS":
                    this.players_action(message);
                    break
                case "REGISTER_PLAYER":
                    this.register_player_action(message);
            }
        } catch (err) {
            console.error("Invalid JSON or message format:", err);
        }
    }

    public start_game_action(message: any){
        this.start_game();
    }

    public register_player_action(message: any) {
        const player = message.playerDto.username;
        console.log("Player is beeing registered");
        this.add_player(player)
    }

    public players_action(message: any){
        const players = message.players;
        console.log(players);
        this.update_player_list(players);
    }

    public async draw_card_action(message: any) {
        for (const card_info of message.cards) {
            const type = card_info.type;
            const color = card_info.color;

            const card = await Card.create(this.cardNameMap.get(color)!, this.cardNameMap.get(type)!);
            this.draw_a_card(card);
        }
    }
}

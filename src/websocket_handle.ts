import { Card } from "./game/card.ts";

export class WebSocketHandle {
    private socket: WebSocket;
    private readonly url: string;
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
    public draw_a_card!: (card: Card) => void;
    public update_player_list!: (player_list: string[]) => void;
    public add_player!: (player: string) => void;
    
    constructor(url = "ws://localhost:8080/game?user=thekonon") {
        this.url = url;
        this.socket = this.createSocket();
    }

    private createSocket(): WebSocket {
        console.log("Creating websocket started");
        const socket = new WebSocket(this.url);
        console.log("Creating websocket finished");

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

    // Call this to manually send a message
    public send(data: string): void {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(data);
        } else {
            console.warn("WebSocket not open. Cannot send:", data);
        }
    }

    // Event hooks (can be overridden or assigned externally)
    public async onMessage(data: string): Promise<void> {
        try {
            const message = JSON.parse(data);
            switch(message.type){
                case "DRAW":
                    this.draw_card_action(message);
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
    public onOpen(): void { }
    public onClose(): void { }
    public onError(error: Event): void { }

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

    // Optional: add reconnect, disconnect, etc.
}

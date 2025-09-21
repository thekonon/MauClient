import { Card } from "./game/card.ts";
import { eventBus } from "./EventBus.ts";

interface Move {
  moveType: "PLAY";
  card: {
    color: string | undefined;
    type: string | undefined;
  };
  nextColor?: string;
}

export interface ServerMessage {
  messageType: "ACTION" | "ERROR" | string; // expand as needed
  action?: GameAction; // present when messageType === "ACTION"
  body?: ServerMessageBody;
  error?: string; // you can add more for ERROR, etc.
}

// The "inner" action payload
export interface GameAction {
  type:
  | "PLAYERS"
  | "REGISTER_PLAYER"
  | "START_GAME"
  | "START_PILE"
  | "DRAW"
  | "PLAY_CARD"
  | "PLAYER_SHIFT"
  | "HIDDEN_DRAW"
  | "PLAYER_RANK"
  | "WIN"
  | "LOSE"
  | "END_GAME"
  | "REMOVE_PLAYER";

  players?: string[];
  playerDto?: { username: string; playerId: string };
  expireAtMs?: number;
  playerRank?: string[];

  card?: {
    color: string;
    type: string;
  };

  cards?: { color: string; type: string }[];

  count?: number;
  nextColor?: string;
}

export interface ServerMessageBody {
  bodyType: "READY";
  username: string;
}

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
    ["DIAMONDS", "D"],
  ]);
  private readonly cardShortToFullMap = new Map<string, string>(
    Array.from(this.cardNameMap.entries()).map(([key, value]) => [value, key]),
  );

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
    this.url = "";
    this.userName = "";
    this.userID = "";
    this.addEventListerners()
  }

  public setIPPort(ip: string, port: string) {
    this.ip = ip;
    this.port = port;
  }

  public setUser(user_name: string) {
    this.userName = user_name;
  }

  public createConnection() {
    if (this.userName == "") {
      throw new Error("UserName must be set first");
    }
    if (this.ip == "") {
      throw new Error("IP must be set first");
    }
    if (this.port == "") {
      throw new Error("Port must be set first");
    }
    this.url = `ws://${this.ip}:${this.port}/game?user=${this.userName}`;
    this.socket = this.createSocket();
  }

  public reconnect() {
    if (this.ip == "") {
      alert("IP must be set first");
      throw new Error("IP must be set first");
    }
    if (this.port == "") {
      alert("PORT must be set first");
      throw new Error("PORT must be set first");
    }
    const UUID = this.getUUID();
    if (UUID === null) {
      alert("No user UUID is saved");
    }
    this.url = `ws://${this.ip}:${this.port}/game?playerId=${UUID}`;
    this.socket = this.createSocket();
  }

  public sendReadyCommand(ready: boolean) {
    const readyCommand = JSON.stringify({
      requestType: "CONTROL",
      control: {
        controlType: ready ? "READY" : "UNREADY",
      },
    });
    this.send(readyCommand);
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
      console.log("Sending data", data);
      this.socket.send(data);
    } else {
      console.warn("WebSocket not open. Cannot send:", data);
    }
  }

  private addEventListerners(): void {
    /* Event listers are added here
    - Register player
    - Reconnect player
    - Player ready
    - Player playCard
    - Player drawCard
    - Player pass*/

    eventBus.on("Command:REGISTER_PLAYER", payload => {
      this.setUser(payload.playerName);
      this.setIPPort(payload.ip, payload.port);
      this.createConnection();
    })

    eventBus.on("Command:RECONNECT", () => {
      console.warn("Reconnect player event is not implemented yet in websocket")
    })

    eventBus.on("Command:PLAYER_READY", payload => {
      this.sendReadyCommand(payload.playerReady);
    })

    eventBus.on("Command:PLAY_CARD", payload => {
      this.playCardCommand(payload.type, payload.value, payload.nextColor);
    })

    eventBus.on("Command:DRAW", () => {
      this.drawCardCommand();
    })

    eventBus.on("Command:PASS", () => {
      this.playPassCommand()
    })
  }

  // Call this method when there is a draw card request
  private drawCardCommand() {
    const draw_command = JSON.stringify({
      requestType: "MOVE",
      move: {
        moveType: "DRAW",
      },
    });
    this.send(draw_command);
  }

  private playCardCommand(type: string, value: string, nextColor: string = "") {
    const move: Move = {
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

  private playPassCommand() {
    const pass_command = JSON.stringify({
      requestType: "MOVE",
      move: {
        moveType: "PASS",
      },
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
        case "SERVER_MESSAGE":
          this.handleServerMessage(message.body);
          break;
        case "ERROR":
          console.error("Error detected, not implemented yet");
          break;
        default:
          console.error("Message type", message.messageType, "not defined yet");
      }
    } catch (err) {
      console.error("Invalid JSON or message format:", err);
    }
  }

  private handleAction(message: GameAction) {
    const handlers: Record<string, (msg: GameAction) => void> = {
      PLAYERS: (msg) => this.players_action(msg),
      REGISTER_PLAYER: (msg) => this.register_player_action(msg),
      START_GAME: (_) => {
        this.game_started = true;
        eventBus.emit("Action:START_GAME", undefined)
      },
      START_PILE: (msg) => {
        if (!this.game_started)
          return console.error("Cannot start pile when game is not started");
        this.start_pile_action(msg);
      },
      DRAW: (msg) => {
        if (!this.game_started)
          return console.error("Cannot draw when game is not started");
        this.drawCard(msg);
      },
      PLAY_CARD: (msg) => {
        if (!this.game_started)
          return console.error("Cannot play card when game is not started");
        this.playCard(msg);
      },
      PLAYER_SHIFT: (msg) => {
        if (!msg.playerDto)
          return console.error("Player DTO was not specified");
        if (!msg.expireAtMs || msg.expireAtMs === -1)
          return console.error("Report this to Pepa, i got no expiration time");
        this.shiftPlayer(msg.playerDto.username, msg.expireAtMs);
      },
      HIDDEN_DRAW: (msg) => {
        if (!msg.playerDto)
          return console.error("Player DTO was not specified");
        if (!msg.count) return console.error("Card count was not specified");
        this.hiddenDraw(msg.playerDto.username, msg.count);
      },
      PLAYER_RANK: (msg) => {
        if (!msg.players)
          return console.error("Players was not specified in RANK action");
        console.log("One of the playes ended");
      },
      WIN: () => {
        console.log("You won");
        console.warn("Not implemented");
      },
      LOSE: () => {
        console.log("You lost");
        console.warn("Not implemented");
      },
      END_GAME: (msg) => {
        if (!msg.playerRank)
          return console.error("Players was not specified in RANK action");
        console.log("Game ended");
        eventBus.emit("Action:PLAYER_RANK", {playersOrder: msg.playerRank})
        eventBus.emit("Action:END_GAME", undefined)
      },
      REMOVE_PLAYER: (msg) => {
        if (!msg.playerDto)
          return console.error("Player DTO was not specified");
        eventBus.emit("Action:REMOVE_PLAYER", { playerName: msg.playerDto.username })
      },
    };

    const handler = handlers[message.type];
    if (handler) {
      handler(message);
    } else {
      console.log("Unknown command!:", message.type);
    }
  }

  private handleServerMessage(message: ServerMessageBody) {
    switch (message.bodyType) {
      case "READY":
        eventBus.emit("ServerMessage:PLAYER_READY", { ready: true, playerName: message.username })
    }
  }

  public playCard(message: GameAction) {
    if (!message.playerDto) {
      console.error("Player DTO was not specified");
      return;
    }
    if (!message.card) {
      console.error("Card info was not specified");
      return;
    }

    const card_info = message.card;
    const chosenNextColor = message.nextColor
      ? (this.cardNameMap.get(message.nextColor) ?? "")
      : "";
    eventBus.emit("Action:PLAY_CARD", {
      playerName: message.playerDto.username,
      type: this.cardNameMap.get(card_info.color)!,
      value: this.cardNameMap.get(card_info.type)!,
      newColor: chosenNextColor
    })
  }

  public register_player_action(message: GameAction) {
    if (!message.playerDto)
      return console.error("Player DTO was not specified");
    if (message.playerDto.username === this.userName) {
      this.saveUUID(message.playerDto.playerId);
    }
    const player = message.playerDto.username;
    eventBus.emit("Action:ADD_PLAYER", { playerName: player })
    // this.add_player(player);
  }

  public players_action(message: GameAction) {
    if (!message.players)
      return console.error("Players field was not specified");
    const players = message.players;
    eventBus.emit("Action:PLAYERS", { playerNames: players })
  }

  public async start_pile_action(message: GameAction) {
    // TODO: move this to pile
    if (!message.card) return console.error("Card was not specified");
    const card_info = message.card;
    const card = await Card.create(
      this.cardNameMap.get(card_info.color)!,
      this.cardNameMap.get(card_info.type)!,
      "pythonGen",
    );
    eventBus.emit("Action:START_PILE", card)
  }

  public async drawCard(message: GameAction) {
    if (!message.cards) return console.error("Cards was not specified");
    for (const card_info of message.cards) {
      const type = card_info.type;
      const color = card_info.color;

      const card = await Card.create(
        this.cardNameMap.get(color)!,
        this.cardNameMap.get(type)!,
        "pythonGen",
      );
      eventBus.emit("Action:DRAW", card)
    }
  }

  private shiftPlayer(activePlayerName: string, expireAtMs: number) {
    eventBus.emit("Action:PLAYER_SHIFT", { playerName: activePlayerName, expireAtMs: expireAtMs })
  }

  private hiddenDraw(playerName: string, count: number) {
    eventBus.emit("Action:HIDDEN_DRAW", { playerName: playerName, cardCount: count })
  }

  private saveUUID(uuid: string) {
    localStorage.setItem("UUID", uuid);
  }

  private getUUID(): string | null {
    const uuid = localStorage.getItem("UUID");
    if (!uuid) {
      return null;
    } else {
      console.log("UUID restored!", uuid);
      return uuid;
    }
  }
}

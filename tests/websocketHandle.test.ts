// WebSocketHandle.test.ts
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { WebSocketHandle } from "../src/WebSocketHandle";
import { eventBus } from "../src/EventBus";
import MnauConfig from "../mnau.config";
import { GameSettings } from "../src/gameSettings";
import { Card } from "../src/game/card";

let websocket: WebSocketHandle;
let createSocketSpy: ReturnType<typeof vi.spyOn>;
let sendSpy: ReturnType<typeof vi.spyOn>;
let emitSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  websocket = new WebSocketHandle();

  // Mock private createSocket method
  createSocketSpy = vi.spyOn(websocket as any, "createSocket").mockImplementation(() => {
    return {
      addEventListener: vi.fn(),
      send: vi.fn(),
      close: vi.fn(),
      readyState: WebSocket.OPEN,
    } as unknown as WebSocket;
  });

  // Mock send
  sendSpy = vi.spyOn(websocket as any, "send").mockImplementation(() => {});

  // Spy on eventBus
  emitSpy = vi.spyOn(eventBus, "emit");

  // Mock Card.create to return simple object
  vi.spyOn(Card, "create").mockImplementation(async (color, type) => ({ color, type }) as unknown as Card);

  // Mock GameSettings.getTexturePack
  vi.spyOn(GameSettings, "getTexturePack").mockReturnValue("default");
  // vi.spyOn(websocket as any, "send").mockImplementation(() => { });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("WebSocketHandle basic tests", () => {
  it("assigns username correctly", () => {
    const userName = "TestUser";
    websocket.setUser(userName);
    expect(websocket.user.name).toBe(userName);
  });

  it("throws error if username is too long", () => {
    const userName = "123d456789012345678901"; // 21 chars
    expect(() => websocket.setUser(userName)).toThrowError();
  });

  it("sendReadyCommand sends correct payload", () => {
    websocket.sendReadyCommand(true);
    expect(sendSpy).toHaveBeenCalledWith(
      JSON.stringify({
        requestType: "CONTROL",
        control: { controlType: "READY" },
      }),
    );

    websocket.sendReadyCommand(false);
    expect(sendSpy).toHaveBeenCalledWith(
      JSON.stringify({
        requestType: "CONTROL",
        control: { controlType: "UNREADY" },
      }),
    );
  });

  it("createConnection sets correct URL", () => {
    websocket.setUser("Alice");
    (websocket as any).lobbyName = "TestLobby";
    (websocket as any).newLobby = true;
    (websocket as any).privateLobby = true;

    websocket.createConnection();
    expect(createSocketSpy).toHaveBeenCalled();
    expect(websocket.getUrl()).toBe(
      `ws://${MnauConfig.ip}:${MnauConfig.port}/game?user=Alice&lobby=TestLobby&new=true&private=true`,
    );
  });

  it("reconnect sets correct URL", () => {
    websocket.setUser("Bob");
    websocket.reconnect();
    expect(createSocketSpy).toHaveBeenCalled();
    expect(websocket.getUrl()).toBe(`ws://${MnauConfig.ip}:${MnauConfig.port}/game?user=Bob&reconnect=true`);
  });
});

describe("WebSocketHandle event handling", () => {
  it("playersAction emits PLAYERS event", () => {
    const emitSpy = vi.spyOn(eventBus, "emit");
    websocket.playersAction({ type: "PLAYERS", players: ["A", "B"] });
    expect(emitSpy).toHaveBeenCalledWith("Action:PLAYERS", {
      playerNames: ["A", "B"],
    });
  });

  it("playCard emits PLAY_CARD event", () => {
    const emitSpy = vi.spyOn(eventBus, "emit");
    websocket.playCard({
      type: "PLAY_CARD",
      playerDto: { username: "Dave", playerId: "id" },
      card: { color: "HEARTS", type: "ACE" },
    });
    expect(emitSpy).toHaveBeenCalledWith("Action:PLAY_CARD", {
      playerName: "Dave",
      type: "H",
      value: "A",
      newColor: "",
    });
  });

  it("handleServerMessage READY emits PLAYER_READY event", () => {
    const emitSpy = vi.spyOn(eventBus, "emit");
    (websocket as any).handleServerMessage({
      bodyType: "READY",
      username: "Eve",
    });
    expect(emitSpy).toHaveBeenCalledWith("ServerMessage:PLAYER_READY", {
      ready: true,
      playerName: "Eve",
    });
  });
});

describe("WebSocketHandle additional commands tests", () => {
  it("drawCardCommand sends DRAW move", () => {
    (websocket as any).drawCardCommand();
    expect(sendSpy).toHaveBeenCalledWith(JSON.stringify({ requestType: "MOVE", move: { moveType: "DRAW" } }));
  });

  it("playPassCommand sends PASS move", () => {
    (websocket as any).playPassCommand();
    expect(sendSpy).toHaveBeenCalledWith(JSON.stringify({ requestType: "MOVE", move: { moveType: "PASS" } }));
  });

  it("addNPCcommand sends REGISTER_NPC control", () => {
    (websocket as any).addNPCcommand();
    expect(sendSpy).toHaveBeenCalledWith(
      JSON.stringify({ requestType: "CONTROL", control: { controlType: "REGISTER_NPC" } }),
    );
  });

  it("kickCommand sends KICK control", () => {
    (websocket as any).kickCommand("Player1");
    expect(sendSpy).toHaveBeenCalledWith(
      JSON.stringify({ requestType: "CONTROL", control: { controlType: "KICK", username: "Player1" } }),
    );
  });

  it("sendMessageCommand sends CHAT message", () => {
    (websocket as any).sendMessageCommand("Hello!");
    expect(sendSpy).toHaveBeenCalledWith(
      JSON.stringify({ requestType: "CHAT", chat: { chatType: "MESSAGE", message: "Hello!" } }),
    );
  });

  it("startPileAction emits START_PILE event with card", async () => {
    websocket.gameStarted = true;
    await (websocket as any).startPileAction({
      type: "START_PILE",
      card: { color: "HEARTS", type: "ACE" },
    });
    expect(emitSpy).toHaveBeenCalledWith("Action:START_PILE", { color: "H", type: "A" });
  });

  it("drawCard emits DRAW event for each card", async () => {
    websocket.gameStarted = true;
    await websocket.drawCard({
      type: "DRAW",
      cards: [
        { color: "HEARTS", type: "ACE" },
        { color: "SPADES", type: "KING" },
      ],
    });
    expect(emitSpy).toHaveBeenCalledWith("Action:DRAW", { color: "H", type: "A" });
    expect(emitSpy).toHaveBeenCalledWith("Action:DRAW", { color: "S", type: "K" });
  });

  it("shiftPlayer emits PLAYER_SHIFT", () => {
    (websocket as any).shiftPlayer("Alice", 1000);
    expect(emitSpy).toHaveBeenCalledWith("Action:PLAYER_SHIFT", { playerName: "Alice", expireAtMs: 1000 });
  });

  it("hiddenDraw emits HIDDEN_DRAW", () => {
    (websocket as any).hiddenDraw("Bob", 3);
    expect(emitSpy).toHaveBeenCalledWith("Action:HIDDEN_DRAW", { playerName: "Bob", cardCount: 3 });
  });

  it("handleServerMessage emits CHAT_MESSAGE", () => {
    (websocket as any).handleServerMessage({
      bodyType: "CHAT_MESSAGE",
      message: { username: "User1", message: "Hi", timestamp: "123" },
    });
    expect(emitSpy).toHaveBeenCalledWith("Helper:GET_MESSAGE", { message: "Hi" });
  });
});

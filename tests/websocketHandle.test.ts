// WebSocketHandle.test.ts
import { describe, it, test, expect, beforeEach, vi, Mocked } from "vitest";
import { GameAction, ServerMessage, ServerMessageBody, WebSocketHandle } from "../src/WebSocketHandle";
import { eventBus } from "../src/EventBus";
import { Card } from "../src/game/card";

// Mock dependencies
vi.mock('./EventBus', () => ({
  eventBus: {
    on: vi.fn(()=>{}),
    emit: vi.fn(()=>{}),
  },
}));

vi.mock('./game/card', () => ({
  Card: {
    create: vi.fn(),
  },
}));

// Mock WebSocket
class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;

  readyState: number = MockWebSocket.OPEN;
  url: string;
  onopen?: () => void;
  onmessage?: (event: { data: string }) => void;
  onerror?: (error: Event) => void;
  onclose?: () => void;

  private eventListeners: Map<string, ((event: any) => void)[]> = new Map();

  constructor(url: string) {
    this.url = url;
    // Simulate async connection
    setTimeout(() => this.triggerOpen(), 0);
  }

  addEventListener(type: string, listener: (event: any) => void) {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(listener);
  }

  send = vi.fn();
  close = vi.fn();

  // Helper methods for testing
  triggerOpen() {
    const listeners = this.eventListeners.get('open') || [];
    listeners.forEach(listener => listener({}));
  }

  triggerMessage(data: string) {
    const listeners = this.eventListeners.get('message') || [];
    listeners.forEach(listener => listener({ data }));
  }

  triggerError(error: Event) {
    const listeners = this.eventListeners.get('error') || [];
    listeners.forEach(listener => listener(error));
  }

  triggerClose() {
    this.readyState = MockWebSocket.CLOSED;
    const listeners = this.eventListeners.get('close') || [];
    listeners.forEach(listener => listener({}));
  }
}

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock global WebSocket
vi.stubGlobal("WebSocket", MockWebSocket);

describe('WebSocketHandle', () => {
  let wsHandle: WebSocketHandle;
  let mockEventBus: Mocked<typeof eventBus>;
  let mockCard: Mocked<typeof Card>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();

    mockEventBus = eventBus as Mocked<typeof eventBus>;
    mockCard = Card as Mocked<typeof Card>;

    wsHandle = new WebSocketHandle();
  });

  describe('Constructor and Initialization', () => {
    test('should initialize with default values', () => {
      expect(wsHandle.ip).toBe('');
      expect(wsHandle.port).toBe('');
      expect(wsHandle.game_started).toBe(false);
      expect(wsHandle.userName).toBe('');
      expect(wsHandle.userID).toBe('');
    });

    test('should set up event listeners on construction', () => {
      expect(mockEventBus.on).toHaveBeenCalledWith('Command:REGISTER_PLAYER', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('Command:RECONNECT', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('Command:PLAYER_READY', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('Command:PLAY_CARD', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('Command:DRAW', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('Command:PASS', expect.any(Function));
    });
  });

  describe('Configuration Methods', () => {
    test('setIPPort should set IP and port', () => {
      wsHandle.setIPPort('192.168.1.1', '8080');
      expect(wsHandle.ip).toBe('192.168.1.1');
      expect(wsHandle.port).toBe('8080');
    });

    test('setUser should set username', () => {
      wsHandle.setUser('testUser');
      expect(wsHandle.userName).toBe('testUser');
    });
  });

  describe('Connection Management', () => {
    beforeEach(() => {
      wsHandle.setUser('testUser');
      wsHandle.setIPPort('localhost', '8080');
    });

    test('createConnection should create WebSocket with correct URL', () => {
      wsHandle.createConnection();
      // The WebSocket should be created (mocked)
      expect(MockWebSocket).toHaveBeenCalledWith('ws://localhost:8080/game?user=testUser');
    });

    test('createConnection should throw error if username not set', () => {
      wsHandle.setUser('');
      expect(() => wsHandle.createConnection()).toThrow('UserName must be set first');
    });

    test('createConnection should throw error if IP not set', () => {
      wsHandle.setIPPort('', '8080');
      expect(() => wsHandle.createConnection()).toThrow('IP must be set first');
    });

    test('createConnection should throw error if port not set', () => {
      wsHandle.setIPPort('localhost', '');
      expect(() => wsHandle.createConnection()).toThrow('Port must be set first');
    });

    test('reconnect should use UUID from localStorage', () => {
      const mockUUID = 'test-uuid-123';
      mockLocalStorage.getItem.mockReturnValue(mockUUID);

      wsHandle.reconnect();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('UUID');
      expect(MockWebSocket).toHaveBeenCalledWith(`ws://localhost:8080/game?playerId=${mockUUID}`);
    });

    test('reconnect should handle missing UUID', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      // Mock alert to avoid actual alert popup in tests
      window.alert = vi.fn();

      wsHandle.reconnect();

      expect(window.alert).toHaveBeenCalledWith('No user UUID is saved');
    });
  });

  describe('Message Sending', () => {
    let mockSocket: MockWebSocket;

    beforeEach(() => {
      wsHandle.setUser('testUser');
      wsHandle.setIPPort('localhost', '8080');
      wsHandle.createConnection();
      // Get the created socket mock
      mockSocket = (wsHandle as any).socket;
    });

    test('send should send data when socket is open', () => {
      const testData = 'test message';
      wsHandle.send(testData);

      expect(mockSocket.send).toHaveBeenCalledWith(testData);
    });

    test('send should not send data when socket is closed', () => {
      mockSocket.readyState = MockWebSocket.CLOSED;
      console.warn = vi.fn();

      const testData = 'test message';
      wsHandle.send(testData);

      expect(mockSocket.send).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('WebSocket not open. Cannot send:', testData);
    });

    test('sendReadyCommand should send correct ready command', () => {
      wsHandle.sendReadyCommand(true);

      const expectedCommand = JSON.stringify({
        requestType: 'CONTROL',
        control: {
          controlType: 'READY',
        },
      });

      expect(mockSocket.send).toHaveBeenCalledWith(expectedCommand);
    });

    test('sendReadyCommand should send correct unready command', () => {
      wsHandle.sendReadyCommand(false);

      const expectedCommand = JSON.stringify({
        requestType: 'CONTROL',
        control: {
          controlType: 'UNREADY',
        },
      });

      expect(mockSocket.send).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('Command Methods', () => {
    let mockSocket: MockWebSocket;

    beforeEach(() => {
      wsHandle.setUser('testUser');
      wsHandle.setIPPort('localhost', '8080');
      wsHandle.createConnection();
      mockSocket = (wsHandle as any).socket;
    });

    test('drawCardCommand should send correct draw command', () => {
      (wsHandle as any).drawCardCommand();

      const expectedCommand = JSON.stringify({
        requestType: 'MOVE',
        move: {
          moveType: 'DRAW',
        },
      });

      expect(mockSocket.send).toHaveBeenCalledWith(expectedCommand);
    });

    test('playCardCommand should send correct play command', () => {
      (wsHandle as any).playCardCommand('H', 'A', 'S');

      const expectedCommand = JSON.stringify({
        requestType: 'MOVE',
        move: {
          moveType: 'PLAY',
          card: {
            color: 'HEARTS',
            type: 'ACE',
          },
          nextColor: 'S',
        },
      });

      expect(mockSocket.send).toHaveBeenCalledWith(expectedCommand);
    });

    test('playCardCommand should handle missing nextColor', () => {
      (wsHandle as any).playCardCommand('C', 'K');

      const expectedCommand = JSON.stringify({
        requestType: 'MOVE',
        move: {
          moveType: 'PLAY',
          card: {
            color: 'CLUBS',
            type: 'KING',
          },
        },
      });

      expect(mockSocket.send).toHaveBeenCalledWith(expectedCommand);
    });

    test('playPassCommand should send correct pass command', () => {
      (wsHandle as any).playPassCommand();

      const expectedCommand = JSON.stringify({
        requestType: 'MOVE',
        move: {
          moveType: 'PASS',
        },
      });

      expect(mockSocket.send).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('Message Processing', () => {
    test('onMessage should handle ACTION messages', async () => {
      const mockAction: GameAction = {
        type: 'START_GAME',
      };

      const message: ServerMessage = {
        messageType: 'ACTION',
        action: mockAction,
      };

      await wsHandle.onMessage(JSON.stringify(message));

      expect(wsHandle.game_started).toBe(true);
      expect(mockEventBus.emit).toHaveBeenCalledWith('Action:START_GAME', undefined);
    });

    test('onMessage should handle SERVER_MESSAGE messages', async () => {
      const mockServerMessage: ServerMessageBody = {
        bodyType: 'READY',
        username: 'testPlayer',
      };

      const message: ServerMessage = {
        messageType: 'SERVER_MESSAGE',
        body: mockServerMessage,
      };

      await wsHandle.onMessage(JSON.stringify(message));

      expect(mockEventBus.emit).toHaveBeenCalledWith('ServerMessage:PLAYER_READY', {
        ready: true,
        playerName: 'testPlayer',
      });
    });

    test('onMessage should handle ERROR messages', async () => {
      console.error = vi.fn();

      const message: ServerMessage = {
        messageType: 'ERROR',
        error: 'Test error',
      };

      await wsHandle.onMessage(JSON.stringify(message));

      expect(console.error).toHaveBeenCalledWith('Error detected, not implemented yet');
    });

    test('onMessage should handle invalid JSON gracefully', async () => {
      console.error = vi.fn();

      await wsHandle.onMessage('invalid json');

      expect(console.error).toHaveBeenCalledWith('Invalid JSON or message format:', expect.any(Error));
    });
  });

  describe('Game Action Handlers', () => {
    beforeEach(() => {
      wsHandle.game_started = true;
    });

    test('handleAction should process PLAYERS action', () => {
      const action: GameAction = {
        type: 'PLAYERS',
        players: ['player1', 'player2', 'player3'],
      };

      (wsHandle as any).handleAction(action);

      expect(mockEventBus.emit).toHaveBeenCalledWith('Action:PLAYERS', {
        playerNames: ['player1', 'player2', 'player3'],
      });
    });

    test('handleAction should process REGISTER_PLAYER action', () => {
      wsHandle.setUser('testUser');
      const action: GameAction = {
        type: 'REGISTER_PLAYER',
        playerDto: {
          username: 'testUser',
          playerId: 'test-id-123',
        },
      };

      (wsHandle as any).handleAction(action);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('UUID', 'test-id-123');
      expect(mockEventBus.emit).toHaveBeenCalledWith('Action:ADD_PLAYER', {
        playerName: 'testUser',
      });
    });

    test('handleAction should process PLAY_CARD action', () => {
      const action: GameAction = {
        type: 'PLAY_CARD',
        playerDto: {
          username: 'testPlayer',
          playerId: 'test-id',
        },
        card: {
          color: 'HEARTS',
          type: 'ACE',
        },
        nextColor: 'SPADES',
      };

      wsHandle.playCard(action);

      expect(mockEventBus.emit).toHaveBeenCalledWith('Action:PLAY_CARD', {
        playerName: 'testPlayer',
        type: 'H',
        value: 'A',
        newColor: 'S',
      });
    });

    test('handleAction should process DRAW action', async () => {
      const mockCardInstance = { id: 'test-card' };
      mockCard.create.mockResolvedValue(mockCardInstance as any);

      const action: GameAction = {
        type: 'DRAW',
        cards: [
          { color: 'HEARTS', type: 'ACE' },
          { color: 'SPADES', type: 'KING' },
        ],
      };

      await wsHandle.drawCard(action);

      expect(mockCard.create).toHaveBeenCalledWith('H', 'A', 'pythonGen');
      expect(mockCard.create).toHaveBeenCalledWith('S', 'K', 'pythonGen');
      expect(mockEventBus.emit).toHaveBeenCalledTimes(2);
      expect(mockEventBus.emit).toHaveBeenCalledWith('Action:DRAW', mockCardInstance);
    });

    test('handleAction should process START_PILE action', async () => {
      const mockCardInstance = { id: 'pile-card' };
      mockCard.create.mockResolvedValue(mockCardInstance as any);

      const action: GameAction = {
        type: 'START_PILE',
        card: {
          color: 'DIAMONDS',
          type: 'QUEEN',
        },
      };

      await (wsHandle as any).start_pile_action(action);

      expect(mockCard.create).toHaveBeenCalledWith('D', 'Q', 'pythonGen');
      expect(mockEventBus.emit).toHaveBeenCalledWith('Action:START_PILE', mockCardInstance);
    });

    test('handleAction should process PLAYER_SHIFT action', () => {
      const action: GameAction = {
        type: 'PLAYER_SHIFT',
        playerDto: {
          username: 'activePlayer',
          playerId: 'test-id',
        },
        expireAtMs: 1234567890,
      };

      (wsHandle as any).handleAction(action);

      expect(mockEventBus.emit).toHaveBeenCalledWith('Action:PLAYER_SHIFT', {
        playerName: 'activePlayer',
        expireAtMs: 1234567890,
      });
    });

    test('handleAction should process HIDDEN_DRAW action', () => {
      const action: GameAction = {
        type: 'HIDDEN_DRAW',
        playerDto: {
          username: 'drawingPlayer',
          playerId: 'test-id',
        },
        count: 3,
      };

      (wsHandle as any).handleAction(action);

      expect(mockEventBus.emit).toHaveBeenCalledWith('Action:HIDDEN_DRAW', {
        playerName: 'drawingPlayer',
        cardCount: 3,
      });
    });

    test('handleAction should process END_GAME action', () => {
      const action: GameAction = {
        type: 'END_GAME',
        playerRank: ['winner', 'second', 'third'],
      };

      (wsHandle as any).handleAction(action);

      expect(mockEventBus.emit).toHaveBeenCalledWith('Action:PLAYER_RANK', {
        playersOrder: ['winner', 'second', 'third'],
      });
      expect(mockEventBus.emit).toHaveBeenCalledWith('Action:END_GAME', undefined);
    });

    test('handleAction should process REMOVE_PLAYER action', () => {
      const action: GameAction = {
        type: 'REMOVE_PLAYER',
        playerDto: {
          username: 'removedPlayer',
          playerId: 'test-id',
        },
      };

      (wsHandle as any).handleAction(action);

      expect(mockEventBus.emit).toHaveBeenCalledWith('Action:REMOVE_PLAYER', {
        playerName: 'removedPlayer',
      });
    });
  });

  describe('Card Name Mapping', () => {
    test('should correctly map card types and colors', () => {
      // Access private cardNameMap for testing
      const cardNameMap = (wsHandle as any).cardNameMap;

      expect(cardNameMap.get('ACE')).toBe('A');
      expect(cardNameMap.get('KING')).toBe('K');
      expect(cardNameMap.get('QUEEN')).toBe('Q');
      expect(cardNameMap.get('JACK')).toBe('J');
      expect(cardNameMap.get('HEARTS')).toBe('H');
      expect(cardNameMap.get('SPADES')).toBe('S');
      expect(cardNameMap.get('CLUBS')).toBe('C');
      expect(cardNameMap.get('DIAMONDS')).toBe('D');
    });

    test('should correctly reverse map card names', () => {
      const cardShortToFullMap = (wsHandle as any).cardShortToFullMap;

      expect(cardShortToFullMap.get('A')).toBe('ACE');
      expect(cardShortToFullMap.get('K')).toBe('KING');
      expect(cardShortToFullMap.get('Q')).toBe('QUEEN');
      expect(cardShortToFullMap.get('J')).toBe('JACK');
      expect(cardShortToFullMap.get('H')).toBe('HEARTS');
      expect(cardShortToFullMap.get('S')).toBe('SPADES');
      expect(cardShortToFullMap.get('C')).toBe('CLUBS');
      expect(cardShortToFullMap.get('D')).toBe('DIAMONDS');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing playerDto in actions', () => {
      console.error = vi.fn();

      const action: GameAction = {
        type: 'PLAY_CARD',
        card: { color: 'HEARTS', type: 'ACE' },
      };

      wsHandle.playCard(action);

      expect(console.error).toHaveBeenCalledWith('Player DTO was not specified');
    });

    test('should handle missing card in PLAY_CARD action', () => {
      console.error = vi.fn();

      const action: GameAction = {
        type: 'PLAY_CARD',
        playerDto: { username: 'test', playerId: 'test-id' },
      };

      wsHandle.playCard(action);

      expect(console.error).toHaveBeenCalledWith('Card info was not specified');
    });

    test('should handle actions when game not started', () => {
      console.error = vi.fn();
      wsHandle.game_started = false;

      const action: GameAction = {
        type: 'DRAW',
        cards: [{ color: 'HEARTS', type: 'ACE' }],
      };

      (wsHandle as any).handleAction(action);

      expect(console.error).toHaveBeenCalledWith('Cannot draw when game is not started');
    });
  });

  describe('localStorage Integration', () => {
    test('should save UUID to localStorage', () => {
      const testUUID = 'test-uuid-123';
      (wsHandle as any).saveUUID(testUUID);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('UUID', testUUID);
    });

    test('should retrieve UUID from localStorage', () => {
      const testUUID = 'stored-uuid-456';
      mockLocalStorage.getItem.mockReturnValue(testUUID);
      console.log = vi.fn();

      const result = (wsHandle as any).getUUID();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('UUID');
      expect(result).toBe(testUUID);
      expect(console.log).toHaveBeenCalledWith('UUID restored!', testUUID);
    });

    test('should handle missing UUID in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = (wsHandle as any).getUUID();

      expect(result).toBeNull();
    });
  });

  describe('WebSocket Event Callbacks', () => {
    test('should have overridable event callbacks', () => {
      expect(typeof wsHandle.onOpen).toBe('function');
      expect(typeof wsHandle.onClose).toBe('function');
      expect(typeof wsHandle.onError).toBe('function');
    });

    test('onOpen callback should be called on connection', async () => {
      wsHandle.onOpen = vi.fn();

      wsHandle.setUser('testUser');
      wsHandle.setIPPort('localhost', '8080');
      wsHandle.createConnection();

      // wait a tick for the connection to trigger
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(wsHandle.onOpen).toHaveBeenCalled();
    });
  });
});
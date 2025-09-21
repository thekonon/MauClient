import { Card } from "./game/card";

// events.ts
export interface AppEvents {
    "Command:PLAYER_READY": void;
    "Command:RECONNECT": void;
    "Action:PLAYERS": { playerName: string };
    "Action:REGISTER_PLAYER": { playerName: string };
    "Action:ADD_PLAYER": {playerName: string};
    "Action:START_GAME": void;
    "Action:START_PILE": Card;
    "Action:DRAW": Card;
    "Action:PLAY_CARD": {playerName: string, type: string, value: string, newColor: string};
    "Action:PLAYER_SHIFT": {playerName: string, expireAtMs: number};
    "Action:HIDDEN_DRAW": {playerName: string, cardCount: number};
    "Action:PLAYER_RANK": {playersOrder: string[]};
    "Action:WIN": void;
    "Action:LOSE": void;
    "Action:END_GAME": void;
    "Action:REMOVE_PLAYER": { playerName: string };
    "Command:DRAW_CARD": Card;
    "Command:PASS_CARD": Card;
}

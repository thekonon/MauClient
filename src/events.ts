import { Card } from "./game/card";

// events.ts
export interface AppEvents {
  "Command:REGISTER_PLAYER": { playerName: string; ip: string; port: string; newLobby: boolean; privateLobby: boolean };
  "Command:PLAYER_READY": { playerReady: boolean };
  "Command:RECONNECT": void;
  "ServerMessage:PLAYER_READY": { ready: boolean; playerName: string };
  "Action:PLAYERS": { playerNames: string[] };
  "Action:REGISTER_PLAYER": { playerName: string };
  "Action:ADD_PLAYER": { playerName: string };
  "Action:START_GAME": void;
  "Action:START_PILE": Card;
  "Action:DRAW": Card;
  "Action:PLAY_CARD": {
    playerName: string;
    type: string;
    value: string;
    newColor: string;
  };
  "Action:PLAYER_SHIFT": { playerName: string; expireAtMs: number };
  "Action:HIDDEN_DRAW": { playerName: string; cardCount: number };
  "Action:PLAYER_RANK": { playersOrder: string[] };
  "Action:WIN": void;
  "Action:LOSE": void;
  "Action:END_GAME": void;
  "Action:REMOVE_PLAYER": { playerName: string };
  "Command:PLAY_CARD": { type: string; value: string; nextColor: string };
  "Command:DRAW": void;
  "Command:PASS": void;
  "Helper:SET_MAIN_PLAYER": { playerName: string };
  "Helper:REGISTER_PLAYERS": { playerNames: string[] };
}

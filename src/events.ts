import { Card } from "./game/card";

// events.ts
export interface AppEvents {
  "Command:REGISTER_PLAYER": {
    playerName: string;
    ip: string;
    lobbyName: string;
    port: string;
    newLobby: boolean;
    privateLobby: boolean;
  };
  "Command:PLAYER_READY": { playerReady: boolean };
  "Command:RECONNECT": { playerName: string; ip: string; port: string };
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
  "Action:DESTROY": void;
  "Action:PASS": void;
  "Command:PLAY_CARD": { type: string; value: string; nextColor: string };
  "Command:DRAW": void;
  "Command:PASS": void;
  "Command:REGISTER_NPC": void;
  "Command:KICK": {playerName: string};
  "Helper:SET_MAIN_PLAYER": { playerName: string };
  "Helper:REGISTER_PLAYERS": { playerNames: string[] };
  "Helper:SET_IDS": { lobbyID: string; playerID: string };
  "Helper:SET_SCORE": {playerRank: string[], score: Record<string, number>;};
  "Helper:REQUEST_CONNECTED_PLAYERS": void;
  "Helper:GET_CONNECTED_PLAYERS": {players: string[]};
}
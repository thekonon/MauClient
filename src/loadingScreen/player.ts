export class Player {
  name: string;
  score: number;
  isReady: boolean;

  constructor(name: string, score = 0) {
    this.name = name;
    this.isReady = false;
    this.score = score;
  }

  public setPlayerName(name: string) {
    this.name = name;
  }
}

export class MainPlayer extends Player {
  lobbyName: string;
  lobbyID: string;
  playerID: string;

  constructor(name: string) {
    super(name);

    this.lobbyName = "";
    this.lobbyID = "";
    this.playerID = "";
  }

  public setLobbyName(lobbyName: string) {
    this.lobbyName = lobbyName;
  }

  public setLobbyID(lobbyID: string) {
    this.lobbyID = lobbyID;
  }
  public setPlayerID(playerID: string) {
    this.playerID = playerID;
  }
}

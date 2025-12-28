export class Player {
  name: string;
  isReady: boolean;

  constructor(name: string) {
    this.name = name;
    this.isReady = false;
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

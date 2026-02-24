import { eventBus } from "../EventBus";
import { LoginMenu } from "./loginMenu";
import { Player, MainPlayer } from "./player";
import { SettingsMenu } from "./setttingsMenu";

export class LoadingScreen {
  mainPlayer: MainPlayer;
  connectedPlayers: Player[];

  settingsMenu: SettingsMenu;
  loginMenu: LoginMenu;

  constructor() {
    this.mainPlayer = new MainPlayer("");
    this.connectedPlayers = [];
    this.settingsMenu = new SettingsMenu();
    this.loginMenu = new LoginMenu();
    this.addEvents();
    this.updateConnectionInfo();
  }

  public show() {
    // Show logging window to user
    const loginMenu = document.getElementById("loginMenu");
    if (loginMenu) {
      loginMenu.style.display = "block";
    }
    this.updateConnectedPlayers();
  }

  public hide() {
    // Hide logging window to user
    const loginMenu = document.getElementById("loginMenu");
    if (loginMenu) {
      loginMenu.style.display = "none";
    }
  }

  public addEvents() {
    const input = document.getElementById("playerName") as HTMLInputElement | null;

    if (input) {
      input.addEventListener("input", () => {
        if (input.value.length >= input.maxLength) {
          input.classList.add("max-reached");
        } else {
          input.classList.remove("max-reached");
        }
      });
    }
    const connectButton = document.getElementById("connectButton") as HTMLButtonElement;
    connectButton.addEventListener("click", () => {
      this.registerPlayer();
    });

    const createLobbyButton = document.getElementById("createLobbyButton") as HTMLInputElement | null;
    const createPrivateLobbyButton = document.getElementById("createPrivateLobbyButton") as HTMLInputElement | null;

    if (createLobbyButton) {
      createLobbyButton.addEventListener("click", () => {
        this.createLobby();
      });
    } else {
      console.log("createLobby button was not found");
    }

    if (createPrivateLobbyButton) {
      createPrivateLobbyButton.addEventListener("click", () => {
        this.createPrivateLobby();
      });
    } else {
      console.log("createPrivateLobby button was not found");
    }

    const reconnectButton = document.getElementById("reconnectButton") as HTMLButtonElement;
    reconnectButton.addEventListener("click", () => {
      this.reconnectPlayer();
    });

    const readyButton = document.getElementById("readyButton") as HTMLButtonElement;
    readyButton.addEventListener("click", () => {
      this.readyPlayerButtonClicked();
    });

    const settingsButton = document.getElementById("settingsBtn") as HTMLButtonElement;
    settingsButton.addEventListener("click", () => {
      this.settingsMenu.open();
    });

    document.getElementById("profileBtn")?.addEventListener("click", () => {
      this.loginMenu.open(); // your login/register modal
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.registerPlayer();
      }
    });

    eventBus.on("Action:ADD_PLAYER", (payload) => {
      this.addPlayerToList(payload.playerName);
    });
    eventBus.on("Action:PLAYERS", (payload) => {
      this.updatePlayerList(payload.playerNames);
    });
    eventBus.on("Action:REMOVE_PLAYER", (payload) => {
      this.removePlayerFromList(payload.playerName);
    });
    eventBus.on("Action:START_GAME", this.startGameHandler);
    eventBus.on("ServerMessage:PLAYER_READY", (payload) => {
      this.readyPlayerMessage(payload.playerName, payload.ready);
    });
    eventBus.on("Helper:SET_IDS", (payload) => {
      this.mainPlayer.lobbyID = payload.lobbyID;
      this.mainPlayer.playerID = payload.playerID;
      this.updateConnectionInfo();
    });
    eventBus.on("Helper:REQUEST_CONNECTED_PLAYERS", () => {
      const playerNames = (this.connectedPlayers ?? []).map((p) => p.name);
      eventBus.emit("Helper:GET_CONNECTED_PLAYERS", { players: playerNames });
    });
    eventBus.on("Helper:REGISTER_PLAYERS", () => {
      const playerNames = (this.connectedPlayers ?? []).map((p) => p.name);
      eventBus.emit("Helper:GET_CONNECTED_PLAYERS", { players: playerNames });
    });
  }

  public getPlayersList(): string[] {
    let listWithoutMainPlayer = this.connectedPlayers;
    listWithoutMainPlayer = listWithoutMainPlayer.filter((item) => item.name != this.getMainPlayer());
    return listWithoutMainPlayer.map((player) => player.name);
  }

  public getMainPlayer(): string {
    return this.mainPlayer.name;
  }

  private addPlayerToList(player_name: string) {
    if (this.connectedPlayers.length > 4) {
      throw Error("This client supports maximum of 5 players");
    }
    this.connectedPlayers.push(new Player(player_name));
    this.updateConnectedPlayers();
    eventBus.emit("Helper:GET_CONNECTED_PLAYERS", {
      players: (this.connectedPlayers ?? []).map((p) => p.name),
    });
  }

  private removePlayerFromList(playerName: string) {
    this.connectedPlayers = this.connectedPlayers.filter((player) => player.name !== playerName);
    this.updateConnectedPlayers();
    eventBus.emit("Helper:GET_CONNECTED_PLAYERS", {
      players: (this.connectedPlayers ?? []).map((p) => p.name),
    });
  }

  private updatePlayerList(playerNames: string[]) {
    if (playerNames.length > 5) {
      throw Error("This client supports maximum of 5 players");
    }

    this.connectedPlayers = [];

    playerNames.forEach((name) => {
      this.connectedPlayers.push(new Player(name));
    });

    this.updateConnectedPlayers();
  }

  private readyPlayerMessage(playerName: string, ready: boolean) {
    if (playerName === this.mainPlayer.name) {
      if (ready) {
        this.setReadyButtonReady();
      } else {
        this.unsetReadyButtonReady();
      }
      this.mainPlayer.isReady = ready;
    }

    this.connectedPlayers.forEach((player) => {
      if (player.name === playerName) {
        player.isReady = ready;
      }
    });
    this.updateConnectedPlayers();
  }

  private unsetReadyButtonReady() {
    const readyButton = document.getElementById("readyButton") as HTMLInputElement;

    if (readyButton.classList.contains("ready")) {
      readyButton.textContent = "Make me ready";
      readyButton.classList.remove("ready");
    }
  }

  private setReadyButtonReady() {
    const readyButton = document.getElementById("readyButton") as HTMLInputElement;

    if (!readyButton.classList.contains("ready")) {
      readyButton.textContent = "I am ready";
      readyButton.classList.add("ready");
    }
  }

  public toggleReadyButtonReady() {
    const readyButton = document.getElementById("readyButton") as HTMLInputElement;

    if (!readyButton.classList.contains("ready")) {
      this.setReadyButtonReady();
    } else {
      this.unsetReadyButtonReady();
    }
  }

  private readyPlayerButtonClicked() {
    eventBus.emit("Command:PLAYER_READY", {
      playerReady: !this.mainPlayer.isReady!,
    });
  }

  private registerPlayer() {
    const playerNameInput = document.getElementById("playerName") as HTMLInputElement;
    const lobbyNane = document.getElementById("lobbyName") as HTMLInputElement;
    const playerName = playerNameInput.value.trim();

    if (playerName === "") {
      alert("Please enter a player name.");
      return;
    }

    this.mainPlayer = new MainPlayer(playerName);
    this.mainPlayer.setLobbyName(lobbyNane.value);
    eventBus.emit("Command:REGISTER_PLAYER", {
      playerName: playerName,
      lobbyName: lobbyNane.value,
      newLobby: false,
      privateLobby: false,
    });
  }

  private reconnectPlayer() {
    const playerNameInput = document.getElementById("playerName") as HTMLInputElement;
    const playerName = playerNameInput.value.trim();

    this.mainPlayer = new MainPlayer(playerName);

    if (playerName === "") {
      alert("Please enter a player name.");
      return;
    }
    this.reconnectCommand(this.mainPlayer.name);
  }

  private createLobby() {
    const playerNameInput = document.getElementById("playerName") as HTMLInputElement;
    const lobbyNane = document.getElementById("lobbyName") as HTMLInputElement;
    const playerName = playerNameInput.value.trim();

    if (playerName === "") {
      alert("Please enter a player name.");
      return;
    }
    this.mainPlayer = new MainPlayer(playerName);
    this.mainPlayer.setLobbyName(lobbyNane.value);
    console.log("Createing new lobby");
    eventBus.emit("Command:REGISTER_PLAYER", {
      playerName: this.mainPlayer.name,
      lobbyName: lobbyNane.value,
      newLobby: true,
      privateLobby: false,
    });
  }

  private createPrivateLobby() {
    const playerNameInput = document.getElementById("playerName") as HTMLInputElement;
    const lobbyNane = document.getElementById("lobbyName") as HTMLInputElement;
    const playerName = playerNameInput.value.trim();

    if (playerName === "") {
      alert("Please enter a player name.");
      return;
    }

    this.mainPlayer = new MainPlayer(playerName);
    this.mainPlayer.setLobbyName(lobbyNane.value);
    console.log("Createing private lobby");
    eventBus.emit("Command:REGISTER_PLAYER", {
      playerName: this.mainPlayer.name,
      lobbyName: lobbyNane.value,
      newLobby: true,
      privateLobby: true,
    });
  }

  private updateConnectedPlayers() {
    const container = document.getElementById("connectedPlayersList");

    if (!container) {
      console.warn("connectedPlayersList not found");
      return;
    }

    // Clear current content
    container.innerHTML = "";
    if (this.connectedPlayers.length === 0) {
      container.innerHTML = `<em style="color: #555;">No connection to lobby</em>`;
      return;
    } else {
      this.freezeForm();
    }

    this.connectedPlayers.forEach((player) => {
      const div = document.createElement("div");
      let symbol = "";
      if (player.isReady) {
        symbol = "🟢";
      } else {
        symbol = "🔴";
      }
      if (player.name == this.mainPlayer.name) {
        div.textContent = `${symbol} ${player.name} - user`;
      } else {
        div.textContent = `${symbol} ${player.name}`;
      }
      div.style.color = "black";
      div.style.marginBottom = "5px";
      container.appendChild(div);
    });
  }

  private startGameHandler = () => {
    eventBus.emit("Helper:SET_MAIN_PLAYER", {
      playerName: this.getMainPlayer(),
    });
    eventBus.emit("Helper:REGISTER_PLAYERS", {
      playerNames: this.getPlayersList(),
    });
    this.hide();
    eventBus.off("Action:START_GAME", this.startGameHandler);
  };

  private reconnectCommand(playerName: string) {
    eventBus.emit("Command:RECONNECT", {
      playerName: playerName,
    });
  }

  private updateConnectionInfo() {
    const container = document.getElementById("connectionInfo") as HTMLDivElement;
    const stringsToDisplay = [
      `PlayerID: ${this.mainPlayer.playerID}`,
      `Lobby name: ${this.mainPlayer.lobbyName}`,
      `LobbyID: ${this.mainPlayer.lobbyID}`,
    ];
    container.textContent = ``;

    stringsToDisplay.forEach((element) => {
      const div = document.createElement("div");
      div.textContent = element;
      container.appendChild(div);
    });
  }

  private freezeForm() {
    this.disableConnectButton();
    this.getPlayerNameInput().disabled = true;
    this.getLobbyNameInput().disabled = true;
  }

  private disableConnectButton(): void {
    const buttonsIDs = ["connectButton", "createLobbyButton", "createPrivateLobbyButton", "reconnectButton"];
    buttonsIDs.forEach((id) => {
      this.disableButton(id);
    });
  }

  private disableButton(buttonID: string): void {
    const button = document.getElementById(buttonID) as HTMLButtonElement | null;

    if (button) {
      button.disabled = true;
      if (!button.classList.contains("disabled")) {
        button.classList.add("disabled");
      }
    }
  }

  private getPlayerNameInput(): HTMLInputElement {
    const input = document.getElementById("playerName") as HTMLInputElement | null;
    if (input === null) {
      throw Error("plz, fix id of player name");
    }
    return input;
  }

  private getLobbyNameInput(): HTMLInputElement {
    const input = document.getElementById("lobbyName") as HTMLInputElement | null;
    if (input === null) {
      throw Error("plz, fix id of lobby name");
    }
    return input;
  }
}

import { eventBus } from "../EventBus";
import { Player } from "./player";

export class LoadingScreen {
  mainPlayer: Player;
  connectedPlayers: Player[];

  constructor() {
    this.mainPlayer = new Player("");
    this.connectedPlayers = [];
    this.addEvents();
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
    const input = document.getElementById(
      "playerName",
    ) as HTMLInputElement | null;
    const ip = document.getElementById("IP") as HTMLInputElement | null;

    if (input) {
      input.addEventListener("input", () => {
        if (input.value.length >= input.maxLength) {
          input.classList.add("max-reached");
        } else {
          input.classList.remove("max-reached");
        }
      });
    }
    if (ip) {
      ip.value = window.location.hostname; // now works
    }
    const connectButton = document.getElementById(
      "connectButton",
    ) as HTMLButtonElement;
    connectButton.addEventListener("click", () => {
      this.registerPlayer();
    });

    const reconnectButton = document.getElementById(
      "reconnectButton",
    ) as HTMLButtonElement;
    reconnectButton.addEventListener("click", () => {
      this.reconnectPlayer();
    });

    const readyButton = document.getElementById(
      "readyButton",
    ) as HTMLButtonElement;
    readyButton.addEventListener("click", () => {
      this.readyPlayerButtonClicked();
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.registerPlayer();
      }
    });

    eventBus.on("Action:ADD_PLAYER", payload =>{
      this.addPlayerToList(payload.playerName)
    })
    eventBus.on("Action:PLAYERS", payload => {
      this.updatePlayerList(payload.playerNames)
    })
    eventBus.on("Action:REMOVE_PLAYER", payload => {
      this.removePlayerFromList(payload.playerName);
    })
    eventBus.on("ServerMessage:PLAYER_READY", payload => {
      this.readyPlayerMessage(payload.playerName, payload.ready)
    })
  }

  public get_players_list(): string[] {
    let listWithoutMainPlayer = this.connectedPlayers;
    listWithoutMainPlayer = listWithoutMainPlayer.filter(
      (item) => item.name != this.getMainPlayer(),
    );
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
  }

  private removePlayerFromList(playerName: string) {
    this.connectedPlayers = this.connectedPlayers.filter(
      (player) => player.name !== playerName,
    );
    this.updateConnectedPlayers();
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
    const readyButton = document.getElementById(
      "readyButton",
    ) as HTMLInputElement;

    if (readyButton.classList.contains("ready")) {
      readyButton.textContent = "Make me ready";
      readyButton.classList.remove("ready");
    }
  }

  private setReadyButtonReady() {
    const readyButton = document.getElementById(
      "readyButton",
    ) as HTMLInputElement;

    if (!readyButton.classList.contains("ready")) {
      readyButton.textContent = "I am ready";
      readyButton.classList.add("ready");
    }
  }

  public toggleReadyButtonReady() {
    const readyButton = document.getElementById(
      "readyButton",
    ) as HTMLInputElement;

    if (!readyButton.classList.contains("ready")) {
      this.setReadyButtonReady();
    } else {
      this.unsetReadyButtonReady();
    }
  }

  private readyPlayerButtonClicked() {
    eventBus.emit("Command:PLAYER_READY", {playerReady: !this.mainPlayer.isReady!})
  }

  private registerPlayer() {
    const playerNameInput = document.getElementById(
      "playerName",
    ) as HTMLInputElement;
    const IPInput = document.getElementById("IP") as HTMLInputElement;
    const PORTInput = document.getElementById("PORT") as HTMLInputElement;
    const playerName = playerNameInput.value.trim();
    const ip = IPInput.value.trim();
    const port = PORTInput.value.trim();

    if (playerName === "") {
      alert("Please enter a player name.");
      return;
    }

    if (ip === "") {
      alert("Kindof strange ip, don't you think?");
      return;
    }

    if (port === "") {
      alert("Kindof strange port, don't you think?");
      return;
    }
    this.mainPlayer = new Player(playerName);
    eventBus.emit("Command:REGISTER_PLAYER", {playerName: playerName, ip: ip, port: port})
  }

  private reconnectPlayer() {
    const IPInput = document.getElementById("IP") as HTMLInputElement;
    const PORTInput = document.getElementById("PORT") as HTMLInputElement;
    const ip = IPInput.value.trim();
    const port = PORTInput.value.trim();

    if (ip === "") {
      alert("Kindof strange ip, don't you think?");
      return;
    }

    if (port === "") {
      alert("Kindof strange port, don't you think?");
      return;
    }
    this.reconnectCommand(ip, port);
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
      this.disableConnectButton();
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

  private disableConnectButton(): void {
    const connectButton = document.getElementById(
      "connectButton",
    ) as HTMLButtonElement | null;

    if (connectButton) {
      connectButton.disabled = true;
      if (!connectButton.classList.contains("disabled")) {
        connectButton.classList.add("disabled");
      }
    }
  }
}

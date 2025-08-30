export class LoadingScreen {
  mainPlayer: string;
  connectedPlayers: string[];

  public on_register_player:
    | ((playerName: string, ip: string, port: string) => void)
    | null = null;
  public reconnectCommand: (_: string, __: string) => void = (
    _: string,
    __: string,
  ) => {
    alert("Reconnect button not implement yet");
  };

  constructor() {
    this.mainPlayer = "";
    this.connectedPlayers = [];
    this.addEvents()
  }

  public show() {
    const loginMenu = document.getElementById("loginMenu");
    if (loginMenu) {
      loginMenu.style.display = "block";
    }
    this.updateConnectedPlayers();
  }

  public hide() {
    const loginMenu = document.getElementById("loginMenu");
    if (loginMenu) {
      loginMenu.style.display = "none";
    }
  }

  public addEvents() {
    const input = document.getElementById("playerName") as HTMLInputElement | null;
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
  }

  public get_players_list(): string[] {
    let listWithoutMainPlayer = this.connectedPlayers;
    listWithoutMainPlayer = listWithoutMainPlayer.filter(
      (item) => item != this.getMainPlayer(),
    );
    return listWithoutMainPlayer;
  }

  public getMainPlayer(): string {
    return this.mainPlayer;
  }

  public addPlayerToList(player: string) {
    if (this.connectedPlayers.length > 4) {
      throw Error("This client supports maximum of 5 players");
    }
    this.connectedPlayers.push(player);
    this.updateConnectedPlayers();
  }

  public removePlayerFromList(player: string) {
    this.connectedPlayers = this.connectedPlayers.filter((p) => p !== player);
    this.updateConnectedPlayers();
  }

  public updatePlayerList(playerList: string[]) {
    if (playerList.length > 5) {
      throw Error("This client supports maximum of 5 players");
    }
    this.connectedPlayers = playerList;
    this.updateConnectedPlayers();
  }

  public unsetReadyButtonReady() {
    const readyButton = document.getElementById(
      "readyButton",
    ) as HTMLInputElement;

    if (readyButton.classList.contains("ready")) {
      readyButton.textContent = "Make me ready"
      readyButton.classList.remove("ready");
    }
  }

  public setReadyButtonReady() {
    const readyButton = document.getElementById(
      "readyButton",
    ) as HTMLInputElement;

    if (!readyButton.classList.contains("ready")) {
      readyButton.textContent = "I am ready"
      readyButton.classList.add("ready");
    }
  }

  public toggleReadyButtonReady() {
    const readyButton = document.getElementById(
      "readyButton",
    ) as HTMLInputElement;

    if (!readyButton.classList.contains("ready")) {
      this.setReadyButtonReady()
    } else{
      this.unsetReadyButtonReady()
    }
  }

  private readyPlayerButtonClicked() {
    console.log("player is ready")
    this.toggleReadyButtonReady()
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
    this.mainPlayer = playerName;
    this.on_register_player?.(playerName, ip, port);
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

    // Add each player as a line
    this.connectedPlayers.forEach((player) => {
      const div = document.createElement("div");
      if (player == this.mainPlayer) {
        div.textContent = `🟢 ${player} - user`;
      } else {
        div.textContent = `🟢 ${player}`;
      }
      div.style.color = "black";
      div.style.marginBottom = "5px";
      container.appendChild(div);
    });
  }

  private disableConnectButton(): void {
    const connectButton = document.getElementById(
      "connectButton"
    ) as HTMLButtonElement | null;

    if (connectButton) {
      // Disable the native button functionality
      connectButton.disabled = true;

      // Add CSS class for styling
      if (!connectButton.classList.contains("disabled")) {
        connectButton.classList.add("disabled");
      }
    }
  }
}

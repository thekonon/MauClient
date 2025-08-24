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
    this.createFallingCards(30);
    const loginMenu = document.getElementById("loginMenu");
    if (loginMenu) {
      loginMenu.style.display = "block";
    }
    this.updateConnectedPlayers();
  }

  public hide() {
    this.removeFallingCards();
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

  private createFallingCards(count: number) {
    for (let i = 0; i < count; i++) {
      const card = document.createElement('div');
      card.classList.add('card');

      // Random size
      const width = Math.random() * 40 + 30; // 30-70px
      const height = width * 1.4; // typical card ratio
      card.style.width = `${width}px`;
      card.style.height = `${height}px`;

      // Random horizontal position
      card.style.left = `${Math.random() * 100}vw`;

      // Random color (optional)
      const colors = ['#fff', '#f5f5dc', '#f0e68c', '#ffe4e1'];
      card.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

      // Random animation duration and delay
      const duration = Math.random() * 5 + 4; // 4-9s
      const delay = Math.random() * 5; // 0-5s
      card.style.animation = `fall ${duration}s linear infinite`;
      card.style.animationDelay = `${delay}s`;

      document.body.appendChild(card);
    }
  }

  private removeFallingCards() {
    const cards = document.querySelectorAll('.card'); // find all elements with class 'card'
    cards.forEach(card => card.remove()); // remove each element
  }
}

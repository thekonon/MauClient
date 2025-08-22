import { Application, Container, Graphics, Text, TextStyle } from "pixi.js";
import { GameSettings } from "../gameSettings";

export class LoadingScreen extends Container {
  app: Application;

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

  constructor(app: Application) {
    super();
    this.app = app;
    this.mainPlayer = "";
    this.connectedPlayers = [];
  }

  public show() {
    this.app.stage.addChild(this);
    this.draw_loading_screen();
    this.updateConnectedPlayers();
  }

  public hide() {
    document.getElementById("loginMenu")?.remove();
    this.app.stage.removeChild(this);
  }

  public draw_loading_screen() {
    // Form styled to match PIXI background
    const uiContainer = document.createElement("div");
    uiContainer.id = "loginMenu";
    uiContainer.classList.add("login-menu");

    uiContainer.innerHTML = `
    <div class="container">
      <div class = "form">
        <div class="title">MňauMňauGame</div>
          <div class="form-group">
            <label for="playerName">Player Name:</label>
            <input type="text" id="playerName" name="playerName">
          </div>

          <div class="form-group">
            <label for="ip">IP:</label>
            <input type="text" id="IP" name="ip" value="${window.location.hostname}">
          </div>

          <div class="form-group">
            <label for="port">PORT:</label>
            <input type="text" id="PORT" name="port" value="8080">
          </div>

          <div class="form-group">
            <label for="port">Lobies:</label>
            <select name="cars" id="cars">
              <option value="volvo">SELECT</option>
              <option value="saab">Saab</option>
              <option value="mercedes">Mercedes</option>
              <option value="audi">Audi</option>
            </select>
          </div>

          <div class="buttons">
            <button class="btn" id="connectButton">Connect to lobby!</button>
            <button class="btn" id="reconnectButton">Try to reconnect!</button>
          </div>
        </div>
        <div class = "players">
          <div class="players-connected-title">Connected Players:</div>
          <div class="players-box" id="connectedPlayersList">
            No players connected yet.
        </div>
      </div>
    </div>
        `;
    document.body.appendChild(uiContainer);

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
      container.innerHTML = `<em style="color: #555;">No players connected yet.</em>`;
      return;
    } else {
      this.disableConnectButton();
    }

    // Add each player as a line
    this.connectedPlayers.forEach((player) => {
      const div = document.createElement("div");
      if (player == this.mainPlayer) {
        div.textContent = `🟢 ${player} - current user`;
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
      "connectButton",
    ) as HTMLButtonElement | null;

    if (connectButton) {
      connectButton.disabled = true;
      connectButton.classList.add("disabled"); // so CSS can style it
    }
  }
}

import { eventBus } from "../EventBus";

export class SettingsMenu {
  private modal?: HTMLDivElement;

  constructor() {
    this.addEvents();
  }

  public open() {
    if (this.modal) return;
    // Request currently connected players

    this.modal = document.createElement("div");
    this.modal.className = "settings-modal";

    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    const content = document.createElement("div");
    content.className = "settings-modal-content";

    // Title
    const title = document.createElement("h2");
    title.innerText = "Settings";
    content.appendChild(title);

    // --- Player Kick Dropdown ---
    const kickLabel = document.createElement("label");
    kickLabel.innerText = "Select player to kick:";
    content.appendChild(kickLabel);

    const playerSelect = document.createElement("select");
    playerSelect.id = "kickPlayerSelection";
    content.appendChild(playerSelect);

    // Kick button
    const kickBtn = document.createElement("button");
    kickBtn.innerText = "Kick Player";
    kickBtn.className = "settings-btn";
    kickBtn.addEventListener("click", () => {
      const playerName = playerSelect.value;
      if (playerName) this.kickPlayer(playerName);
    });
    content.appendChild(kickBtn);

    // Add NPC button
    const addNpcBtn = document.createElement("button");
    addNpcBtn.innerText = "Add NPC";
    addNpcBtn.className = "settings-btn";
    addNpcBtn.addEventListener("click", () => this.addNpc());
    content.appendChild(addNpcBtn);

    // Texture pack dropdown
    const texturePackDropDown = document.createElement(
      "select",
    ) as HTMLSelectElement;
    const options = ["custom", "default", "other", "pythonGen"];
    options.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt;
      option.text = opt.charAt(0).toUpperCase() + opt.slice(1);
      texturePackDropDown.appendChild(option);
    });
    content.appendChild(texturePackDropDown);

    // Save button
    const saveBtn = document.createElement("button");
    saveBtn.innerText = "Save";
    saveBtn.className = "settings-btn";
    saveBtn.addEventListener("click", () => {
      this.saveButtonClicked(texturePackDropDown.value);
    });
    content.appendChild(saveBtn);

    // Cancel button
    const cancelBtn = document.createElement("button");
    cancelBtn.innerText = "Cancel";
    cancelBtn.className = "settings-btn";
    cancelBtn.addEventListener("click", () => this.close());
    content.appendChild(cancelBtn);

    this.modal.appendChild(content);
    document.body.appendChild(this.modal);

    eventBus.emit("Helper:REQUEST_CONNECTED_PLAYERS", undefined);
  }

  public close() {
    if (this.modal) {
      document.body.removeChild(this.modal);
      this.modal = undefined;
    }
  }

  private saveButtonClicked(selectedTexturePack: string) {
    alert(`Selected texture pack: ${selectedTexturePack}`);
    localStorage.setItem("texturePack", selectedTexturePack);
    this.close();
  }

  private kickPlayer(playerName: string) {
    eventBus.emit("Command:KICK", { playerName: playerName });
  }

  private addNpc() {
    eventBus.emit("Command:REGISTER_NPC", undefined);
  }

  private addEvents() {
    eventBus.on("Helper:GET_CONNECTED_PLAYERS", async (payload) => {
      this.updateConnectedPlayers(payload.players);
    });
  }

  private async updateConnectedPlayers(players: string[]) {
    const select = document.getElementById(
      "kickPlayerSelection",
    ) as HTMLSelectElement;
    if (!select) return;
    select.innerHTML = "";

    players.forEach((player) => {
      const opt = document.createElement("option");
      select.appendChild(opt);
      console.log("adding player");
      opt.text = player;
    });
  }
}

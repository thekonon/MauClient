export class SettingsMenu {
    private modal?: HTMLDivElement;

    constructor() {}

    public open() {
        if (this.modal) return;

        this.modal = document.createElement("div");
        this.modal.className = "settings-modal";

        const content = document.createElement("div");
        content.className = "settings-modal-content";

        const title = document.createElement("h2");
        title.innerText = "Settings";
        content.appendChild(title);

        // --- Player Kick Dropdown ---
        const kickLabel = document.createElement("label");
        kickLabel.innerText = "Select player to kick:";
        content.appendChild(kickLabel);

        const playerSelect = document.createElement("select");
        playerSelect.className = "kick-player-select";

        const players = ["Player1", "Player2", "Player3"];
        players.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p;
            opt.text = p;
            playerSelect.appendChild(opt);
        });

        content.appendChild(playerSelect);

        // Kick button
        const kickBtn = document.createElement("button");
        kickBtn.innerText = "Kick Player";
        kickBtn.className = "settings-btn";
        kickBtn.addEventListener("click", () => {
            this.kickPlayer(playerSelect.value);
        });
        content.appendChild(kickBtn);

        // Add NPC button
        const addNpcBtn = document.createElement("button");
        addNpcBtn.innerText = "Add NPC";
        addNpcBtn.className = "settings-btn";
        addNpcBtn.addEventListener("click", () => this.addNpc());
        content.appendChild(addNpcBtn);

        // Texture pack dropdown
        const texturePackDropDown = document.createElement("select");
        const options = ["custom", "default", "other", "pythonGen"];

        options.forEach(opt => {
            const option = document.createElement("option");
            option.value = opt;
            option.text = opt.charAt(0).toUpperCase() + opt.slice(1);
            texturePackDropDown.appendChild(option);
        });

        content.appendChild(texturePackDropDown);

        // --- Save and Cancel (no wrapper div) ---
        const saveBtn = document.createElement("button");
        saveBtn.innerText = "Save";
        saveBtn.className = "settings-btn";
        saveBtn.addEventListener("click", () =>
            this.saveButtonClicked(texturePackDropDown.value)
        );
        content.appendChild(saveBtn);

        const cancelBtn = document.createElement("button");
        cancelBtn.innerText = "Cancel";
        cancelBtn.className = "settings-btn";
        cancelBtn.addEventListener("click", () => this.close());
        content.appendChild(cancelBtn);

        this.modal.appendChild(content);
        document.body.appendChild(this.modal);
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
        console.log("Kick player:", playerName);
    }

    private addNpc() {
        console.log("Add NPC");
    }
}

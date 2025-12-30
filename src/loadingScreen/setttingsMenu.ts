export class SettingsMenu {
    private modal?: HTMLDivElement;

    constructor() { }

    public open() {
        if (this.modal) return;

        this.modal = document.createElement("div");
        this.modal.className = "settings-modal";

        const content = document.createElement("div");
        content.className = "settings-modal-content";

        // Title
        const title = document.createElement("h2");
        title.innerText = "Settings";
        content.appendChild(title);

        // Dummy input fields
        const input1 = document.createElement("input");
        input1.placeholder = "Enter value 1";
        content.appendChild(input1);

        const input2 = document.createElement("input");
        input2.placeholder = "Enter value 2";
        content.appendChild(input2);

        // Dummy checkbox
        const checkboxLabel = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(document.createTextNode("Enable feature"));
        content.appendChild(checkboxLabel);

        // Texture pack selection dropdown
        const texturePackDropDown = document.createElement("select");

        // Add options
        const options = ["custom", "default", "other", "pythonGen"];
        options.forEach(opt => {
            const option = document.createElement("option");
            option.value = opt;
            option.text = opt.charAt(0).toUpperCase() + opt.slice(1); // optional: capitalize first letter
            texturePackDropDown.appendChild(option);
        });

        // Append to modal content
        content.appendChild(texturePackDropDown);
        // Buttons
        const buttons = document.createElement("div");
        buttons.className = "settings-modal-buttons";

        const saveBtn = document.createElement("button");
        saveBtn.innerText = "Save";
        saveBtn.addEventListener("click", () => {
            this.saveButtonClicked(texturePackDropDown.value)
        });
        buttons.appendChild(saveBtn);

        const cancelBtn = document.createElement("button");
        cancelBtn.innerText = "Cancel";
        cancelBtn.addEventListener("click", () => { this.closeButtonClicked() });
        buttons.appendChild(cancelBtn);

        content.appendChild(buttons);
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
        alert(`Selected texture pack: ${selectedTexturePack}`)
        localStorage.setItem("texturePack", selectedTexturePack);
        this.close();
    }

    private closeButtonClicked() {
        this.close();
    }
}

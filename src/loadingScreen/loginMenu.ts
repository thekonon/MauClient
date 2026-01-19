export class SettingsMenu {
    private modal?: HTMLDivElement;

    public open() {
        if (this.modal) return;

        this.modal = document.createElement("div");
        this.modal.className = "settings-modal";

        const content = document.createElement("div");
        content.className = "settings-modal-content";

        // Heading
        const title = document.createElement("h2");
        title.innerText = "Login";
        content.appendChild(title);

        // Username input
        const usernameInput = document.createElement("input");
        usernameInput.type = "text";
        usernameInput.placeholder = "Username";
        usernameInput.className = "settings-input";
        content.appendChild(usernameInput);

        // Password input
        const passwordInput = document.createElement("input");
        passwordInput.type = "password";
        passwordInput.placeholder = "Password";
        passwordInput.className = "settings-input";
        content.appendChild(passwordInput);

        // Login button
        const loginBtn = document.createElement("button");
        loginBtn.innerText = "Login";
        loginBtn.className = "settings-btn";
        loginBtn.onclick = () => {
            const username = usernameInput.value;
            const password = passwordInput.value;

            console.log("Login:", { username, password });
            // emit login event / call API here
        };
        content.appendChild(loginBtn);

        // Register button
        const registerBtn = document.createElement("button");
        registerBtn.innerText = "Register";
        registerBtn.className = "settings-btn";
        registerBtn.onclick = () => {
            console.log("Register clicked");
            // emit register event / open register modal
        };
        content.appendChild(registerBtn);

        this.modal.appendChild(content);
        document.body.appendChild(this.modal);
    }

    public close() {
        if (!this.modal) return;
        document.body.removeChild(this.modal);
        this.modal = undefined;
    }
}

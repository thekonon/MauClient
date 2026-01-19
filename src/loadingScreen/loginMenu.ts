import MnauConfig from "@mnauConfig";

export class LoginMenu {
  private modal?: HTMLDivElement;
  private isRegisterMode = false;

  public open() {
    if (this.modal) return;

    this.modal = document.createElement("div");
    this.modal.className = "settings-modal";

    // Close on outside click
    this.modal.addEventListener("click", () => this.close());

    const content = document.createElement("div");
    content.className = "settings-modal-content";

    // Prevent closing when clicking inside modal
    content.addEventListener("click", (e) => e.stopPropagation());

    this.buildForm(content);

    this.modal.appendChild(content);
    document.body.appendChild(this.modal);
  }

  private buildForm(content: HTMLDivElement) {
    content.innerHTML = "";

    // Heading
    const title = document.createElement("h2");
    title.innerText = this.isRegisterMode ? "Register" : "Login";
    content.appendChild(title);

    // Username
    const usernameInput = document.createElement("input");
    usernameInput.type = "text";
    usernameInput.placeholder = "Username";
    usernameInput.className = "settings-input";
    content.appendChild(usernameInput);

    // --- Register-specific fields ---
    let emailInput: HTMLInputElement | undefined;
    let passwordVerifyInput: HTMLInputElement | undefined;

    // Password wrapper
    const passwordWrapper = document.createElement("div");
    passwordWrapper.className = "password-wrapper";

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.placeholder = "Password";
    passwordInput.className = "settings-input";
    passwordWrapper.appendChild(passwordInput);
    content.appendChild(passwordWrapper);

    if (this.isRegisterMode) {
      // Email
      emailInput = document.createElement("input");
      emailInput.type = "email";
      emailInput.placeholder = "Email";
      emailInput.className = "settings-input";

      // Password verification
      passwordVerifyInput = document.createElement("input");
      passwordVerifyInput.type = "password";
      passwordVerifyInput.placeholder = "Verify Password";
      passwordVerifyInput.className = "settings-input";
      content.appendChild(passwordVerifyInput);
      content.appendChild(emailInput);
    }

    // Show / hide password
    const togglePwdBtn = document.createElement("button");
    togglePwdBtn.type = "button";
    togglePwdBtn.innerText = "👁";
    togglePwdBtn.className = "toggle-password-btn";
    togglePwdBtn.onclick = () => {
      passwordInput.type =
        passwordInput.type === "password" ? "text" : "password";
      if (passwordVerifyInput)
        passwordVerifyInput.type =
          passwordVerifyInput.type === "password" ? "text" : "password";
    };
    passwordWrapper.appendChild(togglePwdBtn);

    // Submit (Login/Register)
    const submitBtn = document.createElement("button");
    submitBtn.className = "settings-btn primary";
    submitBtn.innerText = this.isRegisterMode ? "Register" : "Login";
    content.appendChild(submitBtn);

    const submit = () => {
      const username = usernameInput.value.trim();
      const password = passwordInput.value;

      if (!username || !password) {
        alert("Please fill all fields");
        return;
      }

      if (this.isRegisterMode) {
        const email = emailInput?.value.trim();
        const passwordVerify = passwordVerifyInput?.value;
        if (!email || !passwordVerify || password !== passwordVerify) {
          alert("Invalid fields or passwords do not match");
          return;
        }
        this.register(username, email, password);
      } else {
        this.login(username, password);
      }
    };

    submitBtn.onclick = submit;

    // Enter-to-submit
    content.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit();
    });

    // Switch Login / Register
    const switchModeBtn = document.createElement("button");
    switchModeBtn.className = "settings-btn secondary";
    switchModeBtn.innerText = this.isRegisterMode
      ? "Already have an account? Login"
      : "No account? Register";

    switchModeBtn.onclick = () => {
      this.isRegisterMode = !this.isRegisterMode;
      this.buildForm(content);
    };

    content.appendChild(switchModeBtn);
  }

  public close() {
    if (!this.modal) return;
    document.body.removeChild(this.modal);
    this.modal = undefined;
  }

  private async login(username: string, password: string) {
    try {
      const response = await fetch(
        `http://${MnauConfig.ip}:${MnauConfig.port}/api/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        },
      );

      if (!response.ok) {
        const err = await response.json();
        alert(`Login failed: ${err.message}`);
        return;
      }

      const data = await response.json();
      console.log("Login success:", data);
      // data could contain token, user info, etc.
    } catch (err) {
      console.error("Login error:", err);
    }
  }

  private async register(username: string, email: string, password: string) {
    try {
      const response = await fetch(
        `http://${MnauConfig.ip}:${MnauConfig.port}/api/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password }),
        },
      );

      if (!response.ok) {
        const err = await response.json();
        alert(`Registration failed: ${err.message}`);
        return;
      }

      const data = await response.json();
      console.log("Register success:", data);
      // optionally auto-login or show success message
    } catch (err) {
      console.error("Register error:", err);
    }
  }
}

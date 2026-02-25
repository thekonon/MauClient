import MnauConfig from "@mnauConfig";
import { eventBus } from "../EventBus";

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password2: string;
}

interface LoginPayload {
  username: string;
  password: string;
}

interface APICommand {
  prefix: string;
  type: string;
  method: string;
  payload?: RegisterPayload | LoginPayload;
}

interface RegisterCommand extends APICommand {
  prefix: "auth/";
  type: "register";
  method: "POST";
  payload: RegisterPayload;
}

interface LoginCommand extends APICommand {
  prefix: "auth/";
  type: "login";
  method: "POST";
  payload: LoginPayload;
}

interface RefreshCommand extends APICommand {
  prefix: "auth/";
  type: "refresh";
  method: "POST";
  payload?: never;
}

interface LogoutCommand extends APICommand {
  prefix: "auth/";
  type: "logout";
  method: "POST";
  payload?: never;
}

interface WhoAmICommand extends APICommand {
  prefix: "";
  type: "whoami";
  method: "GET";
  payload?: never;
}

interface TimeLeftCommand extends APICommand {
  prefix: "";
  type: "time-left";
  method: "GET";
  payload?: never;
}

type RestAPICommand = RegisterCommand | LoginCommand | WhoAmICommand | TimeLeftCommand | RefreshCommand | LogoutCommand;

export class RestManager {
  constructor() {
    this.addEvents();
  }

  private addEvents() {
    eventBus.on("Rest:REGISTER", (payload) => {
      this.register(payload.username, payload.email, payload.password, payload.password2);
    });
    eventBus.on("Rest:LOGIN", (payload) => {
      this.login(payload.username, payload.password);
    });
    eventBus.on("Rest:REFRESH", () => {
      this.refresh();
    });
    eventBus.on("Rest:LOGOUT", () => {
      this.logout();
    });
    eventBus.on("Rest:WHOAMI", () => {
      this.whoami();
    });
    eventBus.on("Rest:TIMELEFT", () => {
      this.timeleft();
    });
  }

  private async register(username: string, email: string, password: string, password2: string) {
    const command: RegisterCommand = {
      prefix: "auth/",
      type: "register",
      method: "POST",
      payload: {
        username: username,
        email: email,
        password: password,
        password2: password2,
      },
    };
    const response = await this.sendCommand(command);
    // handle response here
  }

  private async login(username: string, password: string) {
    const command: LoginCommand = {
      prefix: "auth/",
      type: "login",
      method: "POST",
      payload: {
        username: username,
        password: password,
      },
    };
    const response = await this.sendCommand(command);

    if (response.ok) {
      const data = await response.json();

      console.log(data);

      eventBus.emit("Helper:LOGIN", { username: data.user });
    }
  }

  private async refresh(): Promise<boolean> {
    const command: RefreshCommand = {
      prefix: "auth/",
      type: "refresh",
      method: "POST",
    };
    const response = await this.sendCommand(command);

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  }

  private async logout() {
    const command: LogoutCommand = {
      prefix: "auth/",
      type: "logout",
      method: "POST",
    };
    const response = await this.sendCommand(command);
  }

  private async whoami() {
    const command: WhoAmICommand = {
      prefix: "",
      method: "GET",
      type: "whoami",
    };

    const userLoggedIn = await this.refresh();

    if (!userLoggedIn) {
      alert("Log in before running such commands!");
      return;
    }

    const response = await this.sendCommand(command);

    if (response.ok) {
      const data = await response.json();
      alert(`You are logged as ${data.user},\n${data.message}`);
      console.log(data);
    }
    // handle response here
  }

  private async timeleft() {
    const command: TimeLeftCommand = {
      prefix: "",
      method: "GET",
      type: "time-left",
    };

    const userLoggedIn = await this.refresh();

    if (!userLoggedIn) {
      alert("Log in before running such commands!");
      return;
    }

    const response = await this.sendCommand(command);

    if (response.ok) {
      const data = await response.json();
      alert(`Time left for user: ${data.user} - ${data.timeLeftSeconds}`);
      console.log(data);
    }
    // handle response here
  }

  private async sendCommand(command: RestAPICommand): Promise<any> {
    try {
      const url = `http://${MnauConfig.ip}:${MnauConfig.port}/api/${command.prefix}${command.type}`;

      const options: RequestInit = {
        method: command.method,
      };
      options.credentials = "include";

      if (command.payload) {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(command.payload);
      }

      console.log("Sending command:", JSON.stringify(command));
      const response = await fetch(url, options);

      return response;
    } catch (err) {
      console.error("Login error:", err);
    }
  }
}

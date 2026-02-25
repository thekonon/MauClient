import MnauConfig from "@mnauConfig";

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
    payload?: RegisterPayload | LoginPayload
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

type RestAPICommand =
    | RegisterCommand
    | LoginCommand
    | WhoAmICommand
    | TimeLeftCommand
    | RefreshCommand
    | LogoutCommand;

export class RestManager {

    constructor() {


    }

    public async register(username: string, email: string, password: string, password2: string) {

        const command: RegisterCommand = {
            prefix: "auth/",
            type: "register",
            method: "POST",
            payload: {
                username: username,
                email: email,
                password: password,
                password2: password2,
            }
        }
        const response = await this.sendCommand(command);
        // handle response here

    }

    public async login(username: string, password: string) {

        const command: LoginCommand = {
            prefix: "auth/",
            type: "login",
            method: "POST",
            payload: {
                username: username,
                password: password,
            }
        }
        const response = await this.sendCommand(command);
        // handle response here

    }

    public async refresh() {

        const command: RefreshCommand = {
            prefix: "auth/",
            type: "refresh",
            method: "POST",
        }
        const response = await this.sendCommand(command);
        // handle response here
    }

    public async logout() {

        const command: LogoutCommand = {
            prefix: "auth/",
            type: "logout",
            method: "POST",
        }
        const response = await this.sendCommand(command);
        // handle response here
    }

    public async whoami() {
        const command: WhoAmICommand = {
            prefix: "",
            method: "GET",
            type: "whoami"
        }

        const response = await this.sendCommand(command);
        // handle response here
    }

    public async timeleft() {
        const command: TimeLeftCommand = {
            prefix: "",
            method: "GET",
            type: "time-left"
        }

        const response = await this.sendCommand(command);
        // handle response here
    }

    private async sendCommand(command: RestAPICommand): Promise<any> {
        try {
            const url = `http://${MnauConfig.ip}:${MnauConfig.port}/api/${command.prefix}${command.type}`

            const options: RequestInit = {
                method: command.method
            }
            
            options.headers = { "Content-Type": "application/json" };
            if (command.payload) {
                options.body = JSON.stringify(command.payload);
            }

            console.log("Sending command:", JSON.stringify(command));
            const response = await fetch(url, options);

            return response
        } catch (err) {
            console.error("Login error:", err);
        }

    }
}
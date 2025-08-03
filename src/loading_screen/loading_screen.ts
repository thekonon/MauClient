import { Application, Container, Graphics, Text, TextStyle } from "pixi.js";
import { GameSettings } from "../game_settings";

export class LoadingScreen extends Container {
    app: Application

    mainPlayer: string;
    connectedPlayers: string[];

    public on_register_player: ((playerName: string, ip: string, port: string) => void) | null = null;

    constructor(app: Application) {
        super();
        this.app = app;
        this.mainPlayer = ""
        this.connectedPlayers = [];
    }

    public show() {
        this.app.stage.addChild(this);
        this.draw_loading_screen();
        this.update_connected_player()
    }

    public hide() {
        document.getElementById("loginMenu")?.remove();
        this.app.stage.removeChild(this);
    }


    public draw_loading_screen() {
        // Draw background
        const topX = GameSettings.get_loading_screen_top_x();
        const topY = GameSettings.get_loading_screen_top_y();
        const width = GameSettings.get_loading_screen_width();
        const height = GameSettings.get_loading_screen_height();

        const background = new Graphics();
        background.roundRect(
            topX,
            topY,
            width,
            height,
            GameSettings.loading_screen_round_edge
        ).fill(0xde3249);
        this.addChild(background);

        // Draw text
        const style = new TextStyle({
            fontFamily: 'Impact',
            fontSize: 100,
            fontWeight: 'bold',
        });
        const text = new Text({ text: 'MňauMňauGame', style });
        text.position.x = GameSettings.get_mid_x() - text.getSize().width / 2;
        text.position.y = topY + 5;
        this.addChild(text);

        // Form styled to match PIXI background
        const uiContainer = document.createElement('div');
        uiContainer.id = "loginMenu";
        uiContainer.classList.add('login-menu');

        uiContainer.style.left = `${topX}px`;
        uiContainer.style.top = `${topY}px`;
        uiContainer.style.width = `${width}px`;
        uiContainer.style.height = `${height}px`;

        uiContainer.innerHTML = `
            <div class="input-row">
                <label for="playerName">Player Name:</label>
                <input type="text" id="playerName" class="form-input">
            </div>
            <div class="input-row">
                <label for="playerName" >IP: </label>
                <input type="text" id="IP" class="form-input" value="localhost">
            </div>
            <div class="input-row">
                <label for="playerName">PORT: </label>
                <input type="text" id="PORT" class="form-input" value="8080">
            </div>
            <button id="connectButton" class="connect-button">
                Connect to lobby!
            </button>

            <div id="connectedPlayersListLabel">Connected Players:</div>
            <div id="connectedPlayersList">
                <em>No players connected yet.</em>
            </div>
        `;
        document.body.appendChild(uiContainer);

        const connectButton = document.getElementById('connectButton') as HTMLButtonElement;
        connectButton.addEventListener('click', () => {
            const playerNameInput = document.getElementById('playerName') as HTMLInputElement;
            const IPInput = document.getElementById('IP') as HTMLInputElement;
            const PORTInput = document.getElementById('PORT') as HTMLInputElement;
            const playerName = playerNameInput.value.trim();
            const ip = IPInput.value.trim();
            const port = PORTInput.value.trim();

            if (playerName === '') {
                alert('Please enter a player name.');
                return;
            }

            if (ip === '') {
                alert('Kindof strange ip, don\'t you think?');
                return;
            }

            if (port === '') {
                alert('Kindof strange port, don\'t you think?');
                return;
            }
            this.mainPlayer = playerName
            this.on_register_player?.(playerName, ip, port);
        });
    }

    public get_players_list(): string[] {
        var listWithoutMainPlayer = this.connectedPlayers;
        listWithoutMainPlayer = listWithoutMainPlayer.filter(item => item != this.getMainPlayer())
        return listWithoutMainPlayer;
    }

    public getMainPlayer(): string{
        return this.mainPlayer;
    }

    public add_player_to_list(player: string) {
        if (this.connectedPlayers.length > 4) {
            throw Error("This client supports maximum of 5 players");
        }
        this.connectedPlayers.push(player);
        this.update_connected_player();
    }

    public update_player_list(playerList: string[]) {
        if (playerList.length > 5) {
            throw Error("This client supports maximum of 5 players");
        }
        this.connectedPlayers = playerList;
        this.update_connected_player();
    }

    private update_connected_player() {
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
        }

        // Add each player as a line
        this.connectedPlayers.forEach(player => {
            const div = document.createElement("div");
            if(player == this.mainPlayer){
                div.textContent = `🟢 ${player} - current user`;
            }
            else{
                div.textContent = `🟢 ${player}`;
            }
            div.style.color = "black";
            div.style.marginBottom = "5px";
            container.appendChild(div);
        });
    }

}
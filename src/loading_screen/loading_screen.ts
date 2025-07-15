import { Application, Container, Graphics, Text, TextStyle } from "pixi.js";
import { GameSettings } from "../game_settings";

export class LoadingScreen extends Container {
    app: Application
    game_settings: GameSettings;

    connected_player: string[];

    public on_register_player: ((playerName: string) => void) | null = null;

    constructor(app: Application, game_settings: GameSettings) {
        super();
        this.app = app;
        this.game_settings = game_settings;
        this.connected_player = ["Pepa", "Wojta"];

        this.draw_loading_screen();
        this.add_loading_screen();
        this.update_connected_player()
    }

    public draw_loading_screen() {
        // Draw background
        const topX = this.game_settings.get_loading_screen_top_x();
        const topY = this.game_settings.get_loading_screen_top_y();
        const width = this.game_settings.get_loading_screen_width();
        const height = this.game_settings.get_loading_screen_height();

        const background = new Graphics();
        background.roundRect(
            topX,
            topY,
            width,
            height,
            this.game_settings.loading_screen_round_edge
        ).fill(0xde3249);
        this.addChild(background);

        // Draw text
        const style = new TextStyle({
            fontFamily: 'Impact',
            fontSize: 100,
            fontWeight: 'bold',
        });
        const text = new Text({ text: 'MňauMňauGame', style });
        text.position.x = this.game_settings.get_mid_x() - text.getSize().width / 2;
        text.position.y = topY + 5;
        this.addChild(text);

        // Form styled to match PIXI background
        const uiContainer = document.createElement('div');
        uiContainer.id = "loginMenu"
        uiContainer.style.position = 'absolute';
        uiContainer.style.left = `${topX}px`;
        uiContainer.style.top = `${topY}px`;
        uiContainer.style.width = `${width}px`;
        uiContainer.style.height = `${height}px`;

        uiContainer.style.display = 'flex';
        uiContainer.style.flexDirection = 'column';
        uiContainer.style.justifyContent = 'center';
        uiContainer.style.alignItems = 'center';

        uiContainer.innerHTML = `
            <label for="playerName" style="font-size: 20px; margin-bottom: 10px;">Player Name:</label>
            <input type="text" id="playerName"
                style="width: 200px; height: 35px; font-size: 18px; padding: 5px 10px; border: 2px solid #ccc; border-radius: 8px; margin-bottom: 20px;">

            <button id="startGameButton" class="start-button">
                Start Game!
            </button>

            <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Connected Players:</div>
            <div id="connectedPlayersList"
                style="
                    width: 220px;
                    height: 120px;
                    border: 2px solid #ccc;
                    border-radius: 8px;
                    padding: 10px;
                    background: #f9f9f9;
                    overflow-y: auto;
                    font-size: 16px;
                    color: black;
                    line-height: 1.4;
                ">
                <em>No players connected yet.</em>
            </div>
        `;
        document.body.appendChild(uiContainer);

        // ✅ Add callback for Start Game button
        const startButton = document.getElementById('startGameButton') as HTMLButtonElement;
        startButton.addEventListener('click', () => {
            const playerNameInput = document.getElementById('playerName') as HTMLInputElement;
            const player_name = playerNameInput.value.trim();

            if (player_name === '') {
                alert('Please enter a player name.');
                return;
            }

            console.log('Start Game button pressed. Player name:', player_name);
            this.on_register_player?.(player_name);
            // ✅ Your custom logic here:
            // this.start_game_with_name?.(playerName);  // Call your own method if exists
        });
    }

    public add_player_to_list(player: string){
        this.connected_player.push(player);
        this.update_connected_player();
    }

    public update_player_list(player_list: string[]){
        this.connected_player = player_list;
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

        if (this.connected_player.length === 0) {
            container.innerHTML = `<em style="color: #555;">No players connected yet.</em>`;
            return;
        }

        // Add each player as a line
        this.connected_player.forEach(player => {
            const div = document.createElement("div");
            div.textContent = `🟢 ${player}`;
            div.style.color = "black";
            div.style.marginBottom = "4px";
            container.appendChild(div);

            console.log("Connected:", player); // Optional debug log
        });
    }

    public end_loading_screen(){
        const container = document.getElementById("loginMenu");
        container?.remove()
        this.app.stage.removeChild(this);
    }

    private add_loading_screen() {
        this.app.stage.addChild(this);
    }
}
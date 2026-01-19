import { describe, it, expect, beforeEach, vi } from "vitest";
import { LoadingScreen } from "../../src/loadingScreen/loadingScreen";
import { eventBus } from "../../src/EventBus";
import { MainPlayer, Player } from "../../src/loadingScreen/player";

describe("LoadingScreen class", () => {
    let loadingScreen: LoadingScreen;

    const mockDiv = () => {
        const el = document.createElement("div");
        el.style.display = "";
        el.classList.add = vi.fn();
        el.classList.remove = vi.fn();
        return el;
    };

    const mockInput = () => {
        const input = document.createElement("input") as HTMLInputElement;
        input.disabled = false;
        return input;
    };

    const mockButton = () => {
        const button = document.createElement("button") as HTMLButtonElement;
        button.disabled = false;
        button.classList.add = vi.fn();
        button.classList.remove = vi.fn();
        return button;
    };

    beforeEach(() => {
        // Clear DOM
        document.body.innerHTML = `
      <div id="loginMenu"></div>
      <div id="connectedPlayersList"></div>
      <div id="connectionInfo"></div>
      <input id="playerName" />
      <input id="lobbyName" />
      <button id="connectButton"></button>
      <button id="createLobbyButton"></button>
      <button id="createPrivateLobbyButton"></button>
      <button id="reconnectButton"></button>
      <button id="readyButton"></button>
      <button id="settingsBtn"></button>
      <button id="profileBtn"></button>
    `;

        // Mock eventBus emit/on/off
        vi.spyOn(eventBus, "emit").mockImplementation(() => { });
        vi.spyOn(eventBus, "on").mockImplementation(() => { });
        vi.spyOn(eventBus, "off").mockImplementation(() => { });

        loadingScreen = new LoadingScreen();
    });

    it("should initialize with default values", () => {
        expect(loadingScreen.mainPlayer).toBeInstanceOf(MainPlayer);
        expect(loadingScreen.connectedPlayers).toEqual([]);
        expect(loadingScreen.settingsMenu).toBeDefined();
        expect(loadingScreen.loginMenu).toBeDefined();
    });

    it("should add a player to the list", () => {
        (loadingScreen as any).addPlayerToList("Alice");
        const players = loadingScreen.getPlayersList();
        expect(players).toContain("Alice");
    });

    it("should remove a player from the list", () => {
        (loadingScreen as any).addPlayerToList("Alice");
        (loadingScreen as any).removePlayerFromList("Alice");
        const players = loadingScreen.getPlayersList();
        expect(players).not.toContain("Alice");
    });

    it("should toggle ready button state", () => {
        const readyButton = document.getElementById("readyButton")!;
        loadingScreen.toggleReadyButtonReady();
        expect(readyButton.classList.contains("ready")).toBe(true);

        loadingScreen.toggleReadyButtonReady();
        expect(readyButton.classList.contains("ready")).toBe(false);
    });

    it("show method should display loginMenu", () => {
        loadingScreen.show();
        const loginMenu = document.getElementById("loginMenu")!;
        expect(loginMenu.style.display).toBe("block");
    });

    it("hide method should hide loginMenu", () => {
        loadingScreen.hide();
        const loginMenu = document.getElementById("loginMenu")!;
        expect(loginMenu.style.display).toBe("none");
    });

    it("readyPlayerMessage should update player ready state", () => {
        loadingScreen.mainPlayer.name = "Bob";

        // Call private via 'any'
        (loadingScreen as any).readyPlayerMessage("Bob", true);
        expect(loadingScreen.mainPlayer.isReady).toBe(true);

        (loadingScreen as any).readyPlayerMessage("Bob", false);
        expect(loadingScreen.mainPlayer.isReady).toBe(false);
    });
});

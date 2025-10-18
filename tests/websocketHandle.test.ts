// WebSocketHandle.test.ts
import { vi, describe, it, expect, beforeEach } from "vitest";
import { WebSocketHandle } from "../src/WebSocketHandle";


let websocket: WebSocketHandle;
let createSocketSpy: ReturnType<typeof vi.spyOn>;
let sendSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
    // Create instance
    websocket = new WebSocketHandle();

    // Mock private createSocket method
    createSocketSpy = vi.spyOn(websocket as any, "createSocket").mockImplementation(() => {
        return {
            addEventListener: vi.fn(),
            send: vi.fn(),
            close: vi.fn(),
        } as unknown as WebSocket;
    });

    sendSpy = vi.spyOn(websocket as any, "send").mockImplementation(() => { })
});
describe("Websocket assigment tests", () => {
    it("assign ip/port correctly", async () => {
        const ip: string = "192.168.16";
        const port = "1234";
        websocket.setIPPort(ip, port);
        expect(websocket.ip).toBe(ip)
        expect(websocket.port).toBe(port)
    });
    it("throw error if ip is empty", async () => {
        const ip: string = "";
        const port = "1234";
        expect(() => websocket.setIPPort(ip, port)).toThrowError();
    });
    it("throw error if port is empty", async () => {
        const ip: string = "123";
        const port = "";
        expect(() => websocket.setIPPort(ip, port)).toThrowError();
    });
    it("assign userName correctly ", async () => {
        const userName = "TestKonon"
        websocket.setUser(userName)
        expect(websocket.userName).toBe(userName)
    })
    it("fail if userName is too long", async () => {
        const userName = "123456789123456789123456789"

        expect(() => websocket.setUser(userName)).toThrowError()
    })
    it("fail if userName, IP or port is not specified", () => {
        expect(
            () => { websocket.createConnection() }
        ).toThrow("UserName must be set first")
        websocket.setUser("TestUser")
        expect(
            () => { websocket.createConnection() }
        ).toThrow("IP must be set first")
    })
    it("create a valid url when you have user, ip and port", () => {
        const userName = "Konon";
        const ip = "192";
        const port = "8080";
        websocket.setUser(userName)
        websocket.setIPPort(ip, port)

        websocket.createConnection()
        expect(websocket.getUrl()).toBe("ws://192:8080/game?user=Konon")
        expect(createSocketSpy).toHaveBeenCalled()
    })
    it("call sent command with correct control command", () => {
        websocket.sendReadyCommand(true)
        expect(sendSpy).toHaveBeenCalledWith(
            JSON.stringify({
                requestType: "CONTROL",
                control: { controlType: "READY" },
            })
        );
        websocket.sendReadyCommand(false)
        expect(sendSpy).toHaveBeenCalledWith(
            JSON.stringify({
                requestType: "CONTROL",
                control: { controlType: "UNREADY" },
            })
        );
    })
})
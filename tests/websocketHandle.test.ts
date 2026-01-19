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
    it("assign userName correctly ", async () => {
        const userName = "TestKonon"
        websocket.setUser(userName)
        expect(websocket.user.name).toBe(userName)
    })
    it("fail if userName is too long", async () => {
        const userName = "123456789123456789123456789"

        expect(() => websocket.setUser(userName)).toThrowError()
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
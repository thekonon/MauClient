export class WebSocketHandle {
    private socket: WebSocket;
    private readonly url: string;

    constructor(url = "ws://localhost:8765") {
        this.url = url;
        this.socket = this.createSocket();
    }

    private createSocket(): WebSocket {
        const socket = new WebSocket(this.url);

        socket.addEventListener("open", () => {
            console.log("WebSocket connected");
            socket.send("Hello from browser!");
            this.onOpen();
        });

        socket.addEventListener("message", (event) => {
            console.log("Received from WS:", event.data);
            this.onMessage(event.data);
        });

        socket.addEventListener("error", (error) => {
            console.error("WebSocket error:", error);
            this.onError(error);
        });

        socket.addEventListener("close", () => {
            console.log("WebSocket disconnected");
            this.onClose();
        });

        return socket;
    }

    // Call this to manually send a message
    public send(data: string): void {
        if (this.socket.readyState === WebSocket.OPEN) {
            console.log("Sending data")
            this.socket.send(data);
        } else {
            console.warn("WebSocket not open. Cannot send:", data);
        }
    }

    // Event hooks (can be overridden or assigned externally)
    public onMessage(data: string): void {
        console.log(data);
    }
    public onOpen(): void {}
    public onClose(): void {}
    public onError(error: Event): void {}

    // Optional: add reconnect, disconnect, etc.
}

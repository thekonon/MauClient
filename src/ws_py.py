# websocket_server.py
import asyncio
import websockets
import random

connected = set()

types = ["C", "D", "H", "S"]
values = ["7", "8", "9", "J", "Q", "K", "A"]


async def handler(websocket):
    connected.add(websocket)
    try:
        async for message in websocket:
            print(f"Received from client: {message}")
            # Echo back or broadcast to all clients
            for conn in connected:
                # await conn.send(f"Server got: {message}")
                if message == "Draw a card please":
                    await conn.send(f"Draw:{random.choice(types)}{random.choice(values)}")
                
    finally:
        connected.remove(websocket)

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        await asyncio.Future()  # run forever

asyncio.run(main())

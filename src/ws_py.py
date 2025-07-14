# websocket_server.py
import asyncio
import websockets
import random
import json

connected = set()

types = ["C", "D", "H", "S"]
values = ["7", "8", "9", "J", "Q", "K", "A"]


async def handler(websocket):
    connected.add(websocket)
    try:
        async for message in websocket:
            print(f"Received from client: {message}")
            # Echo back or broadcast to all clients
            json_dict = dict()
            try:
                json_dict = json.loads(message)
                print(json_dict)
            except:
                pass
            if json_dict.get("TYPE", None) == "DRAW":
                print("Correct type - drawing")
                for conn in connected:
                    command = '{{"TYPE": "DRAW", "cards": [{{"type": "{}", "color": "{}"}},{{"type": "{}", "color": "{}"}}]}}'.format(random.choice(types), random.choice(values), random.choice(types), random.choice(values))
                    print("sending command: "+command)
                    await conn.send(command)
                
    finally:
        connected.remove(websocket)

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        await asyncio.Future()  # run forever

asyncio.run(main())

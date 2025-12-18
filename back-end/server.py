import asyncio
import websockets
import re
import base64
import json

async def save_fingerpint_image(encoded_str: str):
    match = re.match(r'data:image/(png|jpeg|jpg|bmp);base64,(.*)', encoded_str)
    if match:
        image_format = match.group(1)
        image_data = match.group(2)
    else:
        image_data = encoded_str

    image_bytes = base64.b64decode(image_data)

    with open(f'test.{image_format}', 'wb') as f:
        f.write(image_bytes)

connected = set()

async def handler(ws):
    connected.add(ws)

    ip, port = ws.remote_address
    print(f"Client connected: {ip}:{port}")

    try:
        async for msg in ws:
            print("Received:", msg)

            data = json.loads(msg)

            if "data" in data and "fingerprint" in data["data"]:
                await save_fingerpint_image(data['data']['fingerprint'])

            if "file" in data:
                for c in connected: 
                    #if c != ws:
                    await c.send(data['file'])

    except Exception as e:
        print("Error:", e)

    finally:
        connected.remove(ws)

async def main():
    async with websockets.serve(handler, "0.0.0.0", 8000):
        print("Server started on LAN")
        await asyncio.Future()

asyncio.run(main())
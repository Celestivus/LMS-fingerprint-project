let socket: WebSocket | null = null;

export function connectWS(serverIp: string) {
    if (socket) return socket;

    socket = new WebSocket(`ws://${serverIp}:8000`);

    socket.onopen = () => {
        console.log("WebSocket connected");
    };

    socket.onclose = () => {
        console.log("WebSocket disconnected");
        socket = null;
    };

    socket.onerror = (err) => {
        console.error("WebSocket error:", err);
    };

    socket.onmessage = (event) => {
        console.log("Received:", event.data);
    };

    return socket;
}

export function getWS() {
    return socket;
}

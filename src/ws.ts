let socket: WebSocket | null = null;
const listeners: Array<(ev: MessageEvent) => void> = [];

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
        for (const l of listeners) {
            try { l(event); } catch (e) { console.error(e); }
        }
    };

    return socket;
}

export function getWS() {
    return socket;
}

export function addMessageListener(fn: (ev: MessageEvent) => void) {
    listeners.push(fn);
}

export function removeMessageListener(fn: (ev: MessageEvent) => void) {
    const idx = listeners.indexOf(fn);
    if (idx !== -1) listeners.splice(idx, 1);
}
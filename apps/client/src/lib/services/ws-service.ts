import type { DockerContainer } from "../types/docker";
import { SingletonBase } from "../utils/singleton";
import { EventsSubject, type SubjectCallback } from "../utils/subject";

interface WebSocketEvents {
    containers: DockerContainer[];
}

enum WebSocketStatus {
    CONNECTING = "CONNECTING",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
}

export class WebSocketService extends SingletonBase<WebSocketService>() {
    private eventsSubject = new EventsSubject<WebSocketEvents>();
    private status: WebSocketStatus = WebSocketStatus.CLOSED;
    private ws: WebSocket | null = null;

    private constructor() {
        super();
    }

    init() {
        if (this.status === WebSocketStatus.OPEN) {
            console.warn("WebSocket connection already established");
            return;
        }
        if (this.status === WebSocketStatus.CONNECTING) {
            console.warn("WebSocket connection is already in progress");
            return;
        }
        
        this.status = WebSocketStatus.CONNECTING;
        console.debug("Connecting to WebSocket server...");

        const ws = new WebSocket('ws://localhost:8080/ws');

        ws.onopen = () => {
            this.status = WebSocketStatus.OPEN;
            console.debug("WebSocket connection opened");
            this.ws = ws;
        };

        ws.onmessage = (event) => {
            const message = this.parseWebSocketMessage(event);

            if (message) {
                console.debug("WebSocket event received: ", message.eventName, message.eventData);
                this.eventsSubject.emit(message.eventName, message.eventData);
            }
        };

        ws.onclose = () => {
            this.status = WebSocketStatus.CLOSED;
            console.debug("WebSocket connection closed");
            this.ws = null;
        };
    }

    subscribe<K extends keyof WebSocketEvents>(event: K, callback: SubjectCallback<WebSocketEvents[K]>) {
        this.eventsSubject.subscribe(event, callback);
    }

    unsubscribe<K extends keyof WebSocketEvents>(event: K, callback: SubjectCallback<WebSocketEvents[K]>) {
        this.eventsSubject.unsubscribe(event, callback);
    }

    private parseWebSocketMessage(event: MessageEvent) {
        const data = JSON.parse(event.data);
        
        if (!data.event) {
            console.error("Invalid message format: ", data);
            return;
        }

        const eventName = data.event as keyof WebSocketEvents;
        const eventData = data.data as WebSocketEvents[typeof eventName];

        return { eventName, eventData };
    }
}
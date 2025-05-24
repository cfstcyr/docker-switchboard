import type { DockerContainer } from "../types/docker";
import { SingletonBase } from "../utils/singleton";
import { EventsSubject, type SubjectCallback } from "../utils/subject";
import { APIService } from "./api-service";

interface WebSocketEvents {
    containers: DockerContainer[];
}

enum WebSocketStatus {
    CONNECTING = "CONNECTING",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
}

export class WebSocketService extends SingletonBase<WebSocketService>() {
    readonly events = new EventsSubject<WebSocketEvents>({
        containers: [],
    });
    private status: WebSocketStatus = WebSocketStatus.CLOSED;

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

        const ws = new WebSocket(APIService.instance.url("/ws"));

        ws.onopen = () => {
            this.status = WebSocketStatus.OPEN;
            console.debug("WebSocket connection opened");
        };

        ws.onmessage = (event) => {
            const message = this.parseWebSocketMessage(event);

            if (message) {
                console.debug("WebSocket event received: ", message.eventName, message.eventData);
                this.events.emit(message.eventName, message.eventData);
            }
        };

        ws.onclose = () => {
            this.status = WebSocketStatus.CLOSED;
            console.debug("WebSocket connection closed");
        };
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
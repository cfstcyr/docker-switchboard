import type { DockerContainer } from "../types/docker";
import { SingletonBase } from "../utils/singleton";
import { EventsSubject, SubjectWithState, type SubjectCallback } from "../utils/subject";
import { APIService } from "./api-service";

interface WebSocketEvents {
    containers: DockerContainer[];
}

export enum WebSocketStatus {
    CONNECTING = "CONNECTING",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    ERROR = "ERROR",
}

export class WebSocketService extends SingletonBase<WebSocketService>() {
    readonly events = new EventsSubject<WebSocketEvents>({
        containers: [],
    });
    readonly status = new SubjectWithState<WebSocketStatus>(WebSocketStatus.CLOSED);

    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 15;
    private readonly reconnectDelay = 1000; // ms
    private ws?: WebSocket;

    private constructor() {
        super();
    }

    init() {
        if (this.status.getState() === WebSocketStatus.OPEN) {
            console.warn("WebSocket connection already established");
            return;
        }
        if (this.status.getState() === WebSocketStatus.CONNECTING) {
            console.warn("WebSocket connection is already in progress");
            return;
        }

        this.connect();
    }

    private connect() {
        this.status.emit(WebSocketStatus.CONNECTING);
        console.debug("Connecting to WebSocket server...");

        this.ws = new WebSocket(APIService.instance.url("/ws"));

        this.ws.onopen = () => {
            this.status.emit(WebSocketStatus.OPEN);
            this.reconnectAttempts = 0;
            console.debug("WebSocket connection opened");
        };

        this.ws.onmessage = (event) => {
            const message = this.parseWebSocketMessage(event);

            if (message) {
                console.debug("WebSocket event received: ", message.eventName, message.eventData);
                this.events.emit(message.eventName, message.eventData);
            }
        };

        this.ws.onclose = () => {
            this.status.emit(WebSocketStatus.CLOSED);
            this.events.resetAll();
            console.debug("WebSocket connection closed");
            this.tryReconnect();
        };

        this.ws.onerror = (err) => {
            console.error("WebSocket error:", err);
            this.ws?.close();
        };
    }

    private tryReconnect() {
        this.status.emit(WebSocketStatus.CONNECTING);
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.debug(`Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay);
        } else {
            this.status.emit(WebSocketStatus.ERROR);
            console.error("Max WebSocket reconnect attempts reached.");
        }
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
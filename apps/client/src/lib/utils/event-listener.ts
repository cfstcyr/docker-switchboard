export type EventListenerCallback<T, K extends keyof T = keyof T> = (event: K, data: T[K]) => void;
export type EventListenerCallbackWithoutEvent<T, K extends keyof T = keyof T> = (data: T[K]) => void;

export class EventListener<T> {
    private listeners: EventListenerCallback<T>[] = [];
    private eventListeners: { [K in keyof T]?: EventListenerCallbackWithoutEvent<T>[] } = {};

    subscribe(listener: EventListenerCallback<T>): void {
        this.listeners.push(listener);
    }

    subscribeToEvent(event: keyof T, listener: EventListenerCallbackWithoutEvent<T>): void {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event]!.push(listener);
    }

    unsubscribe(listener: EventListenerCallback<T>): void {
        this.listeners = this.listeners.filter((l) => l !== listener);
    }

    unsubscribeFromEvent(event: keyof T, listener: EventListenerCallbackWithoutEvent<T>): void {
        if (this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event]!.filter((l) => l !== listener);
        }
    }

    emit<K extends keyof T>(event: K, data: T[K]): void {
        for (const listener of this.listeners) {
            listener(event, data);
        }
        if (this.eventListeners[event]) {
            for (const listener of this.eventListeners[event]!) {
                listener(data);
            }
        }
    }
}
export type SubjectCallback<T> = (data: T) => void;

export class Subject<T> {
    private observers: SubjectCallback<T>[] = [];

    subscribe(observer: SubjectCallback<T>): void {
        this.observers.push(observer);
    }

    unsubscribe(observer: SubjectCallback<T>): void {
        this.observers = this.observers.filter((obs) => obs !== observer);
    }

    emit(data: T): void {
        for (const observer of this.observers) {
            observer(data);
        }
    }

    clear(): void {
        this.observers = [];
    }
}

export class SubjectWithState<T> extends Subject<T> {
    private state: T | undefined;

    getState(): T | undefined {
        return this.state;
    }

    subscribe(observer: SubjectCallback<T>): void {
        if (this.state !== undefined) {
            observer(this.state);
        }
        super.subscribe(observer);
    }

    emit(data: T): void {
        this.state = data;
        super.emit(data);
    }
}

export class EventsSubject<T> {
    private subjects: { [K in keyof T]: SubjectWithState<T[K]> } = {} as { [K in keyof T]: SubjectWithState<T[K]> };

    subscribe<K extends keyof T>(event: K, observer: SubjectCallback<T[K]>): void {
        if (!this.subjects[event]) {
            this.subjects[event] = new SubjectWithState<T[K]>();
        }
        this.subjects[event].subscribe(observer);
    }

    unsubscribe<K extends keyof T>(event: K, observer: SubjectCallback<T[K]>): void {
        if (this.subjects[event]) {
            this.subjects[event].unsubscribe(observer);
        }
    }

    emit<K extends keyof T>(event: K, data: T[K]): void {
        if (!this.subjects[event]) {
            this.subjects[event] = new SubjectWithState<T[K]>();
        }
        this.subjects[event].emit(data);
    }

    clear<K extends keyof T>(event: K): void {
        if (this.subjects[event]) {
            this.subjects[event].clear();
        }
    }

    clearAll(): void {
        for (const key in this.subjects) {
            this.subjects[key].clear();
        }
    }
}
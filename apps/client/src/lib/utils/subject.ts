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
    private initialState: T;
    private state: T;

    constructor(initialState: T) {
        super();
        this.initialState = initialState;
        this.state = initialState;
    }

    getState(): T {
        return this.state;
    }

    subscribe(observer: SubjectCallback<T>): void {
        observer(this.state);
        super.subscribe(observer);
    }

    emit(data: T): void {
        this.state = data;
        super.emit(data);
    }

    reset(): void {
        this.state = this.initialState;
        super.emit(this.state);
    }
}

export class EventsSubject<T> {
    readonly initialState: T;
    private subjects: { [K in keyof T]: SubjectWithState<T[K]> } = {} as { [K in keyof T]: SubjectWithState<T[K]> };
    
    constructor(initialState: T) {
        this.initialState = initialState;
    }

    subscribe<K extends keyof T>(event: K, observer: SubjectCallback<T[K]>): void {
        if (!this.subjects[event]) {
            this.subjects[event] = new SubjectWithState<T[K]>(this.initialState[event]);
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
            this.subjects[event] = new SubjectWithState<T[K]>(this.initialState[event]);
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

    reset<K extends keyof T>(event: K): void {
        if (this.subjects[event]) {
            this.subjects[event].reset();
        }
    }

    resetAll(): void {
        for (const key in this.subjects) {
            this.subjects[key].reset();
        }
    }
}
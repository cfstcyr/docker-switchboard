export function SingletonBase<T>() {
    return class SingletonBase {
        private static _instance: T | null = null

        protected constructor() {}

        public static getInstance(): T {
            if (!this._instance) {
                this._instance = new this() as T
                ;(this._instance as SingletonBase).initialize()
            }

            return this._instance
        }

        public static get instance(): T {
            return this.getInstance()
        }

        protected initialize(): void {}
    }
}

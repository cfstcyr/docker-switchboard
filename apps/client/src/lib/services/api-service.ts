import { SingletonBase } from '../utils/singleton'

export class APIService extends SingletonBase<APIService>() {
    readonly baseUrl: string

    private constructor() {
        super()
        this.baseUrl =
            import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
    }

    url(input: string) {
        return `${this.baseUrl}${input.startsWith('/') ? '' : '/'}${input}`
    }

    fetch(input: string, options: RequestInit = {}) {
        return fetch(this.url(input), options)
    }
}

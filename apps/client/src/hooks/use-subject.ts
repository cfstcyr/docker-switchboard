import type { SubjectWithState, EventsSubject } from '@/lib/utils/subject'
import { useEffect, useState } from 'preact/hooks'

export function useSubjectWithState<T>(subject: SubjectWithState<T>) {
    const [state, setState] = useState(subject.getState())

    useEffect(() => {
        subject.subscribe(setState)
        return () => subject.unsubscribe(setState)
    }, [subject])

    return state
}

export function useEventsSubject<T, K extends keyof T>(
    subject: EventsSubject<T>,
    event: K
) {
    const [state, setState] = useState(subject.initialState[event])

    useEffect(() => {
        subject.subscribe(event, setState)
        return () => subject.unsubscribe(event, setState)
    }, [subject, event])

    return state
}

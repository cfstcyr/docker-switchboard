import { useSubjectWithState } from '@/hooks/use-subject'
import { WebSocketService, WebSocketStatus } from '@/lib/services/ws-service'
import { Loader2 } from 'lucide-preact'
import { type ComponentChildren, type JSX } from 'preact'

type Props = {
    children: ComponentChildren
} & JSX.HTMLAttributes<HTMLDivElement>

export function WsPortal({ children, ...props }: Props) {
    const wsState = useSubjectWithState(WebSocketService.instance.status)

    return (
        <div {...props}>
            {wsState === WebSocketStatus.OPEN ? (
                children
            ) : wsState === WebSocketStatus.CONNECTING ? (
                <p className="flex gap-2">
                    Connecting to WebSocket server{' '}
                    <Loader2 className="motion-safe:animate-spin " />
                </p>
            ) : wsState === WebSocketStatus.CLOSED ? (
                <p className="text-dim text-center">
                    WebSocket connection closed
                </p>
            ) : wsState === WebSocketStatus.ERROR ? (
                <p className="text-dim text-center">
                    WebSocket connection error
                </p>
            ) : (
                <p className="text-dim text-center">Unknown WebSocket state</p>
            )}
        </div>
    )
}

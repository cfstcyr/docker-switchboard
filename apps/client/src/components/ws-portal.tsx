import { useSubjectWithState } from '@/hooks/use-subject'
import { WebSocketService, WebSocketStatus } from '@/lib/services/ws-service'
import clsx from 'clsx'
import { Loader2 } from 'lucide-preact'
import type { ComponentChildren, JSX } from 'preact'

interface Props {
    children: ComponentChildren
    messageProps?: JSX.HTMLAttributes<HTMLDivElement>
}

export function WsPortal({
    children,
    messageProps: { className, ...messageProps } = {},
}: Props) {
    const wsState = useSubjectWithState(WebSocketService.instance.status)

    function Message({ message }: { message: ComponentChildren }) {
        return (
            <div
                className={clsx(
                    'text-dim flex items-center justify-center select-none',
                    className
                )}
                {...messageProps}
            >
                <p>{message}</p>
            </div>
        )
    }

    switch (wsState) {
        case WebSocketStatus.OPEN:
            return <>{children}</>
        case WebSocketStatus.CONNECTING:
            return (
                <Message
                    message={
                        <span className="flex gap-2">
                            Connecting to WebSocket server{' '}
                            <Loader2 className="motion-safe:animate-spin " />
                        </span>
                    }
                />
            )
        case WebSocketStatus.CLOSED:
            return <Message message="WebSocket connection closed" />
        case WebSocketStatus.ERROR:
            return <Message message="WebSocket connection error" />
        default:
            return <Message message="Unknown WebSocket state" />
    }
}

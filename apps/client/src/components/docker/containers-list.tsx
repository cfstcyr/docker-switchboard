import { WebSocketService } from '@/lib/services/ws-service'
import { useEffect, useState } from 'preact/hooks'
import { ContainerItem } from './container-item'
import { useEventsSubject } from '@/hooks/use-subject'
import { RefreshCcw } from 'lucide-preact'
import { APIService } from '@/lib/services/api-service'
import { WsPortal } from '../ws-portal'

export function ContainersList() {
    const [updatedOn, setUpdatedOn] = useState(new Date())
    const containers = useEventsSubject(
        WebSocketService.instance.events,
        'containers'
    )

    useEffect(() => {
        setUpdatedOn(new Date())
    }, [containers])

    function update() {
        return APIService.instance.fetch('/docker/containers/update', {
            method: 'POST',
        })
    }

    return (
        <WsPortal className="px-4 py-12 pb-12 h-full">
            <div className="max-w-md mx-auto space-y-4">
                <div className="space-y-4">
                    {containers.map((container) => (
                        <ContainerItem
                            key={container.id}
                            container={container}
                        />
                    ))}
                </div>

                <div
                    className="text-sm text-dim flex items-center justify-end space-x-2"
                    key="updated-on"
                >
                    <p>
                        Last updated:{' '}
                        <time dateTime={updatedOn.toISOString()}>
                            {updatedOn.toLocaleString()}
                        </time>
                    </p>
                    <button
                        onClick={update}
                        className="hover:text-text transition-colors"
                    >
                        <RefreshCcw size={16} />
                    </button>
                </div>
            </div>
        </WsPortal>
    )
}

import type { DockerContainer } from '@/lib/types/docker'
import { APIService } from '@/lib/services/api-service'
import { useCallback, useState } from 'preact/hooks'
import { Toggle } from '../toggle'

interface Props {
    container: DockerContainer
}

export function ContainerItem({ container }: Props) {
    const [loading, setLoading] = useState(false)

    const handleClick = useCallback(() => {
        setLoading(true)

        let response: Promise<Response>
        if (container.state === 'running') {
            response = APIService.instance.fetch(
                `/docker/containers/stop?id=${container.id}`,
                { method: 'POST' }
            )
        } else {
            response = APIService.instance.fetch(
                `/docker/containers/start?id=${container.id}`,
                { method: 'POST' }
            )
        }

        return response.finally(() => setLoading(false))
    }, [container.id, container.state])

    return (
        <button
            className="container-item group/docker-container w-full text-left disabled:pointer-events-none data-[loading=true]:opacity-70 transition-opacity"
            onClick={handleClick}
            disabled={loading}
            data-state={container.state}
            data-loading={loading}
            data-running={container.state === 'running'}
        >
            <div
                style={{ gridArea: 'status' }}
                className="flex items-center justify-center"
            >
                <div
                    className={`
                        size-3 rounded-full
                        group-data-[state=running]/docker-container:bg-success
                        group-data-[state=stopped]/docker-container:bg-red-500
                        group-data-[state=paused]/docker-container:bg-yellow-500
                        group-data-[state=exited]/docker-container:bg-gray-500
                        group-data-[state=restarting]/docker-container:bg-blue-500
                        group-data-[state=removing]/docker-container:bg-orange-500
                        bg-gray-200
                    `}
                ></div>
            </div>
            <h3
                style={{ gridArea: 'title' }}
                className="overflow-hidden text-ellipsis group-data-[running=false]/docker-container:text-dim"
            >
                {container.name}
            </h3>
            <div
                style={{ gridArea: 'actions' }}
                className="h-full flex items-center"
            >
                <Toggle checked={container.state === 'running'} />
            </div>
        </button>
    )
}

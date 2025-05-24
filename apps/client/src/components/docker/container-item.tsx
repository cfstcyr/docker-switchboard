import type { DockerContainer } from "@/lib/types/docker";
import { CopyButton } from "@/components/copy-button";
import { Loader2, Pause, Play, ToggleLeft, ToggleRight } from "lucide-preact";
import { APIService } from "@/lib/services/api-service";
import { useCallback, useState } from "preact/hooks";
import { Toggle } from "../toggle";

interface Props {
    container: DockerContainer;
}

export function ContainerItem({ container }: Props) {
    const [loading, setLoading] = useState(false);

    const handleClick = useCallback(() => {
        setLoading(true);

        let response: Promise<Response>;
        if (container.state === "running") {
            response = APIService.instance.fetch(`/docker/containers/stop?id=${container.id}`, { method: "POST" });
        } else {
            response = APIService.instance.fetch(`/docker/containers/start?id=${container.id}`, { method: "POST" });
        }

        return response.finally(() => setLoading(false));
    }, [container.id, container.state]);

    return (
        <li
            class="container-item group/docker-container"
            data-state={container.state}
            data-loading={loading}
        >
            <div
                style={{gridArea: 'status'}}
                class="flex items-center justify-center"
            >
                <div
                    class={`
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
            <h3 style={{gridArea: 'title'}} className="overflow-hidden text-ellipsis">{container.name}</h3>
            {/* <p
                style={{gridArea: 'subtitle'}}
                class="text-xs opacity-55 overflow-hidden text-ellipsis flex items-center gap-1"
            >
                <CopyButton text={container.id} size={12}>{container.id}</CopyButton>
            </p> */}
            <div style={{gridArea: 'actions'}} class="h-full">
                <button
                    class="glass h-full min-h-10 p-2 disabled:pointer-events-none group-data-[loading=true]/docker-container:opacity-55"
                    onClick={handleClick}
                    disabled={loading}
                >
                    <Toggle checked={container.state === "running"} />
                </button>
            </div>
        </li>
    )
}
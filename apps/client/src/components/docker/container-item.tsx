import type { DockerContainer } from "@/lib/types/docker";
import { CopyButton } from "@/components/copy-button";
import { Play } from "lucide-preact";

interface Props {
    container: DockerContainer;
}

export function ContainerItem({ container }: Props) {
    return (
        <li
            class="container-item group/docker-container"
            data-state={container.state}
        >
            <div
                style={{gridArea: 'status'}}
                class="flex items-center justify-center"
            >
                <div
                    class={`
                        size-3 rounded-full
                        group-data-[state=running]/docker-container:bg-green-500
                        group-data-[state=stopped]/docker-container:bg-red-500
                        group-data-[state=paused]/docker-container:bg-yellow-500
                        group-data-[state=exited]/docker-container:bg-gray-500
                        group-data-[state=restarting]/docker-container:bg-blue-500
                        group-data-[state=removing]/docker-container:bg-orange-500
                        bg-gray-200
                    `}
                ></div>
            </div>
            <h3 style={{gridArea: 'title'}}>{container.name}</h3>
            <p
                style={{gridArea: 'subtitle'}}
                class="text-xs opacity-55 overflow-hidden text-ellipsis flex items-center gap-1"
            >
                <CopyButton text={container.id} size={12}>{container.id}</CopyButton>
            </p>
            <div style={{gridArea: 'actions'}}>
                <button class="glass p-2">
                    <Play size={16} />
                </button>
            </div>
        </li>
    )
}
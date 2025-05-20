import { WebSocketService } from "@/lib/services/ws-service";
import { useEffect, useState } from "preact/hooks";
import type { DockerContainer } from '@/lib/types/docker';
import { Copy, Play } from "lucide-preact";
import { CopyButton } from "../copy-button";
    

export function ContainersList() {
    const [containers, setContainers] = useState<DockerContainer[]>([]);

    const handleContainersUpdate = (containers: DockerContainer[]) => {
        setContainers(containers);
        console.log('Containers updated:', containers);
    };

    useEffect(() => {
        WebSocketService.instance.subscribe('containers', handleContainersUpdate);
        return () => WebSocketService.instance.unsubscribe('containers', handleContainersUpdate);
    }, [handleContainersUpdate]);

    return (
        <ul class="m-4 space-y-4">
            {containers.map((container) => (
                <li key={container.id} class="container-item">
                    <div
                        style={{gridArea: 'status'}}
                        class="flex items-center justify-center"
                    >
                        <div class="size-3 bg-green-500 rounded-full"></div>
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
            ))}
        </ul>
    );
}
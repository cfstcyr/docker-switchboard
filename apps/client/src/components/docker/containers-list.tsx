import { WebSocketService } from "@/lib/services/ws-service";
import { useEffect, useState } from "preact/hooks";
import type { DockerContainer } from '@/lib/types/docker';
import { ContainerItem } from "./container-item";
    

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
                <ContainerItem key={container.id} container={container} />
            ))}
        </ul>
    );
}
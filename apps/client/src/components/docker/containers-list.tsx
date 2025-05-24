import { WebSocketService, WebSocketStatus } from "@/lib/services/ws-service";
import { useEffect, useState } from "preact/hooks";
import { ContainerItem } from "./container-item";
import { useEventsSubject, useSubjectWithState } from "@/hooks/use-subject";
import { RefreshCcw } from "lucide-preact";
import { APIService } from "@/lib/services/api-service";
import { WsPortal } from "../ws-portal";
    

export function ContainersList() {
    const [updatedOn, setUpdatedOn] = useState(new Date());
    const wsState = useSubjectWithState(WebSocketService.instance.status);
    const containers = useEventsSubject(WebSocketService.instance.events, 'containers');

    useEffect(() => {
        setUpdatedOn(new Date());
    }, [containers]);

    function update() {
        return APIService.instance.fetch("/docker/containers/update", { method: "POST" })
    }

    return (
        <div class="p-4 space-y-4 h-full">
            <WsPortal messageProps={{ className: "h-full w-full" }}>
                <>
                    <ul class="space-y-4">
                        {containers.map((container) => (
                            <ContainerItem key={container.id} container={container} />
                        ))}
                    </ul>

                    <div class="text-sm text-dim flex items-center justify-end space-x-2">
                        <p>Last updated: <time datetime={updatedOn.toISOString()}>{updatedOn.toLocaleString()}</time></p>
                        <button onClick={update} class="hover:text-text transition-colors"><RefreshCcw size={16} /></button>
                    </div>
                </>
            </WsPortal>
        </div>
    );
}
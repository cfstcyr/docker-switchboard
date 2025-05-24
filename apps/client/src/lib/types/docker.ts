export type DockerContainerState = 'running' | 'stopped' | 'paused' | 'exited' | 'created' | 'restarting' | 'removing' | 'dead';

export interface DockerContainer {
    id: string;
    name: string;
    state: DockerContainerState;
}

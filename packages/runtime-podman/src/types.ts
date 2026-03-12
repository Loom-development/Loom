export interface CommandResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  code: number;
}

export interface PodmanCapabilities {
  available: boolean;
  version?: string;
  rootless: boolean;
  machine: {
    supported: boolean;
    running: boolean;
  };
}

export interface ContainerSummary {
  name: string;
  state: string;
  running: boolean;
  health?: string;
  image: string;
}
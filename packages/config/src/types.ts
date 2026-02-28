export type LoomServiceType = "node" | "php" | "python" | "postgres" | "redis" | string;

export interface LoomService {
  type: LoomServiceType;
  image: string;
  entrypoint?: string;
  command?: string;
  workdir?: string;
  ports?: string[];
  volumes?: string[];
  env?: Record<string, string>;
  dependsOn?: string[];
  healthcheck?: {
    command: string;
    intervalSeconds?: number;
    timeoutSeconds?: number;
    retries?: number;
    startPeriodSeconds?: number;
  };
}

export interface LoomRoute {
  host: string;
  service: string;
  port: number;
  https?: boolean;
}

export interface LoomTask {
  service: string;
  command: string;
}

export interface LoomConfig {
  version: number;
  name: string;
  runtime: {
    engine: "podman";
    rootless: boolean;
    machine?: {
      managed: boolean;
    };
  };
  services: Record<string, LoomService>;
  routes?: LoomRoute[];
  tasks?: Record<string, LoomTask>;
}

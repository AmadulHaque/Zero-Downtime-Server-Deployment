
export enum DeploymentStage {
  INITIAL = 0,
  PREPARATION = 1,
  TRAFFIC_ROUTING = 2,
  PARALLEL_STATE = 3,
  FAILURE_SIMULATION = 4,
  FINAL_STATE = 5
}

export enum ServerStatus {
  ACTIVE = 'active',
  HEALTH_CHECK = 'health_check',
  DRAINING = 'draining',
  IDLE = 'idle',
  FAILED = 'failed',
  DECOMMISSIONED = 'decommissioned'
}

export interface Server {
  id: string;
  version: string;
  status: ServerStatus;
  trafficPercentage: number;
}

export interface SimulationState {
  stage: DeploymentStage;
  servers: Server[];
  totalTraffic: number;
  logs: string[];
}

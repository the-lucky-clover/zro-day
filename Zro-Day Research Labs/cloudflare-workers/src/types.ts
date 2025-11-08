// Environment interface for Cloudflare Workers
export interface Env {
  TASK_QUEUE: DurableObjectNamespace
  NODE_REGISTRY: DurableObjectNamespace
  RESULTS_CACHE: KVNamespace
  JWT_SECRET: string
  DEBUG?: string
}

// Task interfaces
export interface DistributedTask {
  id: string
  type: 'threat_analysis' | 'packet_inspection' | 'ml_training' | 'data_processing'
  workload: any
  priority: 'low' | 'normal' | 'high' | 'critical'
  status: 'queued' | 'processing' | 'completed' | 'failed'
  createdAt: number
  assignedNode?: string
  progress?: number
  result?: any
}

// Network node interfaces
export interface NetworkNode {
  id: string
  location: string
  type: 'browser' | 'server' | 'edge' | 'mobile'
  capabilities: string[]
  status: 'online' | 'offline'
  lastSeen: number
  load: number
  tasksProcessed: number
  uptime: number
}

// Task distribution interfaces
export interface TaskDistributionRequest {
  task: DistributedTask
  nodes?: string[]
  deadline?: number
}

export interface TaskDistributionResult {
  taskId: string
  nodes: string[]
  estimated_completion: number
}

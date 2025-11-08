import { json, error } from 'itty-router'
import { Env } from '../types'

export async function handleTaskQueue(request: Request): Promise<Response> {
  try {
    const env = (request as any).env as Env

    // Get the task queue durable object
    const taskQueueId = env.TASK_QUEUE.idFromName('global-queue')
    const taskQueue = env.TASK_QUEUE.get(taskQueueId)

    // Get queue status
    const response = await taskQueue.fetch(request.url, {
      method: 'GET'
    })

    const queueStats = await response.json()

    // Get node registry for network status
    const nodeRegistryId = env.NODE_REGISTRY.idFromName('global-registry')
    const nodeRegistry = env.NODE_REGISTRY.get(nodeRegistryId)

    const nodeResponse = await nodeRegistry.fetch(request.url, {
      method: 'GET'
    })

    const networkStats = await nodeResponse.json()

    return json({
      success: true,
      queue: {
        active_tasks: queueStats.active || 0,
        pending_tasks: queueStats.pending || 0,
        completed_tasks: queueStats.completed || 0,
        failed_tasks: queueStats.failed || 0,
        average_completion_time: queueStats.avg_completion_time || 0
      },
      network: {
        total_nodes: networkStats.total_nodes || 0,
        active_nodes: networkStats.active_nodes || 0,
        total_compute_power: networkStats.compute_power || 0,
        regions: networkStats.regions || []
      },
      system_health: {
        queue_efficiency: calculateEfficiency(queueStats),
        network_coverage: calculateCoverage(networkStats),
        overall_status: determineOverallStatus(queueStats, networkStats)
      }
    })

  } catch (err) {
    console.error('Queue status error:', err)
    return error(500, 'Failed to retrieve queue status')
  }
}

function calculateEfficiency(queueStats: any): number {
  const total = (queueStats.active || 0) + (queueStats.pending || 0) +
                (queueStats.completed || 0) + (queueStats.failed || 0)
  if (total === 0) return 100

  const successful = (queueStats.completed || 0)
  return Math.round((successful / total) * 100)
}

function calculateCoverage(networkStats: any): number {
  const total = networkStats.total_nodes || 0
  const active = networkStats.active_nodes || 0

  if (total === 0) return 0
  return Math.round((active / total) * 100)
}

function determineOverallStatus(queueStats: any, networkStats: any): string {
  const efficiency = calculateEfficiency(queueStats)
  const coverage = calculateCoverage(networkStats)

  if (efficiency > 90 && coverage > 80) return 'excellent'
  if (efficiency > 70 && coverage > 60) return 'good'
  if (efficiency > 50 && coverage > 40) return 'moderate'
  return 'degraded'
}

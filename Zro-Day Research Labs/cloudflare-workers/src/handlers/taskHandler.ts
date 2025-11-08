import { json, error } from 'itty-router'
import { Env } from '../types'

export async function handleDistributedTask(request: Request): Promise<Response> {
  try {
    const env = (request as any).env as Env

    const body = await request.json() as any
    const { task, workload, priority = 'normal' } = body

    if (!task || !workload) {
      return error(400, 'Missing required fields: task, workload')
    }

    // Get the task queue durable object
    const taskQueueId = env.TASK_QUEUE.idFromName('global-queue')
    const taskQueue = env.TASK_QUEUE.get(taskQueueId)

    // Distribute task to queue
    const response = await taskQueue.fetch(request.url, {
      method: 'POST',
      body: JSON.stringify({
        action: 'distribute',
        task,
        workload,
        priority
      })
    })

    const result = await response.json()

    return json({
      success: true,
      taskId: result.taskId,
      nodes: result.nodes,
      estimated_completion: result.estimated_completion
    })

  } catch (err) {
    console.error('Task distribution error:', err)
    return error(500, 'Task distribution failed')
  }
}

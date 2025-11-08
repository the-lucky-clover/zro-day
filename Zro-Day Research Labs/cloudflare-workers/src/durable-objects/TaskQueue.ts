import { DurableObject } from 'cloudflare:workers'
import { DistributedTask, TaskDistributionResult } from '../types'

export class DistributedTaskQueue extends DurableObject {
  private tasks: Map<string, DistributedTask> = new Map()
  private nodeAssignments: Map<string, string[]> = new Map()

  async handleSession(websocket: WebSocket, env: any) {
    websocket.accept()

    websocket.addEventListener('message', async (event) => {
      try {
        const message = JSON.parse(event.data as string)
        await this.handleMessage(message, websocket, env)
      } catch (error) {
        websocket.send(JSON.stringify({ error: 'Invalid message format' }))
      }
    })
  }

  async handleMessage(message: any, websocket?: WebSocket, env?: any) {
    const { action, task, workload, priority } = message

    switch (action) {
      case 'distribute':
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const distributedTask: DistributedTask = {
          id: taskId,
          type: task?.type || 'data_processing',
          workload,
          priority: priority || 'normal',
          status: 'queued',
          createdAt: Date.now()
        }

        this.tasks.set(taskId, distributedTask)

        // Distribute to available nodes (in real implementation, would query node registry)
        const availableNodes = await this.getAvailableNodes(env)
        const assignedNodes = this.assignTaskToNodes(distributedTask, availableNodes)

        const result: TaskDistributionResult = {
          taskId,
          nodes: assignedNodes,
          estimated_completion: this.estimateCompletionTime(distributedTask, assignedNodes.length)
        }

        // Update task status
        distributedTask.status = 'processing'
        distributedTask.assignedNode = assignedNodes[0]

        if (websocket) {
          websocket.send(JSON.stringify(result))
        }

        return result

      default:
        if (websocket) {
          websocket.send(JSON.stringify({ error: 'Unknown action' }))
        }
    }
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'POST') {
      const message = await request.json()
      const result = await this.handleMessage(message, undefined, (this as any).env)
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (request.method === 'GET') {
      // Return queue statistics
      const stats = {
        active: Array.from(this.tasks.values()).filter(t => t.status === 'processing').length,
        pending: Array.from(this.tasks.values()).filter(t => t.status === 'queued').length,
        completed: Array.from(this.tasks.values()).filter(t => t.status === 'completed').length,
        failed: Array.from(this.tasks.values()).filter(t => t.status === 'failed').length,
        avg_completion_time: this.calculateAverageCompletionTime(),
        total_tasks: this.tasks.size
      }

      return new Response(JSON.stringify(stats), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response('Method not allowed', { status: 405 })
  }

  private async getAvailableNodes(env: any): Promise<string[]> {
    // In a real implementation, this would query the node registry DO
    // For demo purposes, returning mock nodes
    return ['node-us-east-1', 'node-eu-west-1', 'node-ap-southeast-1']
  }

  private assignTaskToNodes(task: DistributedTask, availableNodes: string[]): string[] {
    // Simple assignment logic - assign to best available node
    const assignedCount = task.priority === 'critical' ? 3 :
                         task.priority === 'high' ? 2 : 1

    return availableNodes.slice(0, assignedCount)
  }

  private estimateCompletionTime(task: DistributedTask, nodeCount: number): number {
    // Base time estimation in milliseconds
    const baseTime = task.workload?.size ? task.workload.size * 100 : 30000 // 30 seconds base

    // Adjust for priority
    const priorityMultiplier = task.priority === 'critical' ? 0.5 :
                              task.priority === 'high' ? 0.75 : 1.0

    // Adjust for node count (parallelization benefit)
    const parallelizationFactor = Math.min(nodeCount * 0.8, 1)

    return Math.round(baseTime * priorityMultiplier / parallelizationFactor)
  }

  private calculateAverageCompletionTime(): number {
    const completedTasks = Array.from(this.tasks.values())
      .filter(t => t.status === 'completed')

    if (completedTasks.length === 0) return 0

    const totalTime = completedTasks.reduce((sum, task) => {
      return sum + (Date.now() - task.createdAt)
    }, 0)

    return Math.round(totalTime / completedTasks.length)
  }
}

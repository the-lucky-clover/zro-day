import { json, error } from 'itty-router'
import { Env, NetworkNode } from '../types'

export async function handleNodeRegistration(request: Request): Promise<Response> {
  try {
    const env = (request as any).env as Env

    const body = await request.json() as any
    const { nodeId, location, type, capabilities } = body

    if (!nodeId || !location || !type || !capabilities) {
      return error(400, 'Missing required fields: nodeId, location, type, capabilities')
    }

    // Generate node data
    const node: NetworkNode = {
      id: nodeId,
      location,
      type: type as 'browser' | 'server' | 'edge' | 'mobile',
      capabilities: Array.isArray(capabilities) ? capabilities : [],
      status: 'online',
      lastSeen: Date.now(),
      load: 0,
      tasksProcessed: 0,
      uptime: 0
    }

    // Get the node registry durable object
    const nodeRegistryId = env.NODE_REGISTRY.idFromName('global-registry')
    const nodeRegistry = env.NODE_REGISTRY.get(nodeRegistryId)

    // Register node
    const response = await nodeRegistry.fetch(request.url, {
      method: 'POST',
      body: JSON.stringify({
        action: 'register',
        node
      })
    })

    const result = await response.json()

    return json({
      success: true,
      nodeId: nodeId,
      status: 'registered',
      assigned_compute_units: result.compute_units || 1
    })

  } catch (err) {
    console.error('Node registration error:', err)
    return error(500, 'Node registration failed')
  }
}

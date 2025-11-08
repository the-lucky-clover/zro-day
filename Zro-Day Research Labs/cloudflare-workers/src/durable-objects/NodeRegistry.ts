import { DurableObject } from 'cloudflare:workers'
import { NetworkNode } from '../types'

export class NodeRegistry extends DurableObject {
  private nodes: Map<string, NetworkNode> = new Map()

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
    const { action, node } = message

    switch (action) {
      case 'register':
        const result = await this.registerNode(node)

        if (websocket) {
          websocket.send(JSON.stringify(result))
        }

        return result

      case 'heartbeat':
        await this.updateNodeHeartbeat(node.id)

        if (websocket) {
          websocket.send(JSON.stringify({ status: 'acknowledged' }))
        }

        return { status: 'acknowledged' }

      case 'update_load':
        await this.updateNodeLoad(node.id, node.load)

        if (websocket) {
          websocket.send(JSON.stringify({ status: 'updated' }))
        }

        return { status: 'updated' }

      default:
        if (websocket) {
          websocket.send(JSON.stringify({ error: 'Unknown action' }))
        }
    }
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method === 'POST') {
      const message = await request.json()
      const result = await this.handleMessage(message)
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (request.method === 'GET') {
      // Return network statistics
      const activeNodes = Array.from(this.nodes.values())
        .filter(node => node.status === 'online')

      const regions = this.getRegionalDistribution()
      const computePower = this.calculateTotalComputePower()

      const stats = {
        total_nodes: this.nodes.size,
        active_nodes: activeNodes.length,
        regions,
        compute_power: computePower,
        node_types: this.getNodeTypeDistribution(),
        average_load: this.calculateAverageLoad(),
        uptime_stats: this.getUptimeStats()
      }

      return new Response(JSON.stringify(stats), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response('Method not allowed', { status: 405 })
  }

  private async registerNode(nodeData: NetworkNode): Promise<any> {
    // Generate compute units based on node capabilities and type
    const computeUnits = this.calculateComputeUnits(nodeData)

    const node: NetworkNode = {
      ...nodeData,
      lastSeen: Date.now(),
      status: 'online',
      load: 0,
      tasksProcessed: 0,
      uptime: 0
    }

    this.nodes.set(node.id, node)

    return {
      nodeId: node.id,
      status: 'registered',
      compute_units: computeUnits,
      assigned_region: this.assignRegion(node.location)
    }
  }

  private async updateNodeHeartbeat(nodeId: string) {
    const node = this.nodes.get(nodeId)
    if (node) {
      node.lastSeen = Date.now()
      node.status = 'online'
      node.uptime += 1 // minutes
    }
  }

  private async updateNodeLoad(nodeId: string, load: number) {
    const node = this.nodes.get(nodeId)
    if (node) {
      node.load = Math.max(0, Math.min(100, load))
      node.lastSeen = Date.now()
    }
  }

  private calculateComputeUnits(node: NetworkNode): number {
    let units = 1

    // Base units by type
    switch (node.type) {
      case 'server':
        units = 10
        break
      case 'edge':
        units = 5
        break
      case 'browser':
        units = 2
        break
      case 'mobile':
        units = 1
        break
    }

    // Bonus for capabilities
    if (node.capabilities.includes('gpu')) units *= 2
    if (node.capabilities.includes('ml')) units *= 1.5
    if (node.capabilities.includes('crypto')) units *= 1.2

    return Math.round(units)
  }

  private assignRegion(location: string): string {
    // Simple region assignment based on location keywords
    if (location.toLowerCase().includes('us') || location.toLowerCase().includes('america')) {
      return 'us-east-1'
    }
    if (location.toLowerCase().includes('eu') || location.toLowerCase().includes('europe')) {
      return 'eu-west-1'
    }
    if (location.toLowerCase().includes('asia') || location.toLowerCase().includes('ap')) {
      return 'ap-southeast-1'
    }
    return 'global'
  }

  private getRegionalDistribution(): Record<string, number> {
    const regions: Record<string, number> = {}

    for (const node of this.nodes.values()) {
      const region = this.assignRegion(node.location)
      regions[region] = (regions[region] || 0) + 1
    }

    return regions
  }

  private calculateTotalComputePower(): number {
    return Array.from(this.nodes.values())
      .filter(node => node.status === 'online')
      .reduce((total, node) => total + this.calculateComputeUnits(node), 0)
  }

  private getNodeTypeDistribution(): Record<string, number> {
    const types: Record<string, number> = {}

    for (const node of this.nodes.values()) {
      types[node.type] = (types[node.type] || 0) + 1
    }

    return types
  }

  private calculateAverageLoad(): number {
    const activeNodes = Array.from(this.nodes.values())
      .filter(node => node.status === 'online')

    if (activeNodes.length === 0) return 0

    const totalLoad = activeNodes.reduce((sum, node) => sum + node.load, 0)
    return Math.round(totalLoad / activeNodes.length)
  }

  private getUptimeStats(): { average: number; total: number } {
    const activeNodes = Array.from(this.nodes.values())
      .filter(node => node.status === 'online')

    if (activeNodes.length === 0) {
      return { average: 0, total: 0 }
    }

    const totalUptime = activeNodes.reduce((sum, node) => sum + node.uptime, 0)
    const averageUptime = totalUptime / activeNodes.length

    return {
      average: Math.round(averageUptime),
      total: totalUptime
    }
  }
}

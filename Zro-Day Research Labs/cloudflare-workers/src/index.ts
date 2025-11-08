import { Router, json, error } from 'itty-router'
import { handleDistributedTask } from './handlers/taskHandler'
import { handleNodeRegistration } from './handlers/nodeHandler'
import { handleTaskQueue } from './handlers/queueHandler'
import { Env } from './types'

const router = Router()

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle CORS preflight
router.options('*', () => new Response(null, { headers: corsHeaders }))

// Task distribution endpoints
router.post('/api/tasks/distribute', handleDistributedTask)
router.post('/api/nodes/register', handleNodeRegistration)
router.get('/api/queue/status', handleTaskQueue)

// Contact form endpoint (development - replace with Resend/Email service)
router.post('/api/contact', async (request) => {
  try {
    // Log contact form submission (development mode)
    const contactData = await request.json()
    console.log('Contact form submission:', contactData)

    return json({
      success: true,
      message: 'Contact form received successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return error(500, 'Failed to process contact form')
  }
})


// Health check
router.get('/health', () => new Response(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
}))

// Catch-all for 404s
router.all('*', () => new Response(JSON.stringify({ error: 'Not Found' }), {
  status: 404,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
}))

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Add env to request for handlers
      (request as any).env = env

      const response = await router.handle(request)

      // Add CORS headers to all responses
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response
    } catch (error) {
      console.error('Worker error:', error)
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }
}

// Export Durable Objects
export { DistributedTaskQueue } from './durable-objects/TaskQueue'
export { NodeRegistry } from './durable-objects/NodeRegistry'

// Type definitions
export interface Env {
  TASK_QUEUE: DurableObjectNamespace
  NODE_REGISTRY: DurableObjectNamespace
  RESULTS_CACHE: KVNamespace
  JWT_SECRET: string
  DEBUG?: string
}

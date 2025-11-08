var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-8S35aR/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// node_modules/itty-router/index.mjs
var e = /* @__PURE__ */ __name(({ base: e2 = "", routes: t = [], ...o2 } = {}) => ({ __proto__: new Proxy({}, { get: /* @__PURE__ */ __name((o3, s2, r2, n2) => "handle" == s2 ? r2.fetch : (o4, ...a) => t.push([s2.toUpperCase?.(), RegExp(`^${(n2 = (e2 + o4).replace(/\/+(\/|$)/g, "$1")).replace(/(\/?\.?):(\w+)\+/g, "($1(?<$2>*))").replace(/(\/?\.?):(\w+)/g, "($1(?<$2>[^$1/]+?))").replace(/\./g, "\\.").replace(/(\/?)\*/g, "($1.*)?")}/*$`), a, n2]) && r2, "get") }), routes: t, ...o2, async fetch(e3, ...o3) {
  let s2, r2, n2 = new URL(e3.url), a = e3.query = { __proto__: null };
  for (let [e4, t2] of n2.searchParams) a[e4] = a[e4] ? [].concat(a[e4], t2) : t2;
  for (let [a2, c2, i2, l2] of t) if ((a2 == e3.method || "ALL" == a2) && (r2 = n2.pathname.match(c2))) {
    e3.params = r2.groups || {}, e3.route = l2;
    for (let t2 of i2) if (null != (s2 = await t2(e3.proxy ?? e3, ...o3))) return s2;
  }
} }), "e");
var o = /* @__PURE__ */ __name((e2 = "text/plain; charset=utf-8", t) => (o2, { headers: s2 = {}, ...r2 } = {}) => void 0 === o2 || "Response" === o2?.constructor.name ? o2 : new Response(t ? t(o2) : o2, { headers: { "content-type": e2, ...s2.entries ? Object.fromEntries(s2) : s2 }, ...r2 }), "o");
var s = o("application/json; charset=utf-8", JSON.stringify);
var r = /* @__PURE__ */ __name((e2) => ({ 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found", 500: "Internal Server Error" })[e2] || "Unknown Error", "r");
var n = /* @__PURE__ */ __name((e2 = 500, t) => {
  if (e2 instanceof Error) {
    const { message: o2, ...s2 } = e2;
    e2 = e2.status || 500, t = { error: o2 || r(e2), ...s2 };
  }
  return t = { status: e2, ..."object" == typeof t ? t : { error: t || r(e2) } }, s(t, { status: e2 });
}, "n");
var c = o("text/plain; charset=utf-8", String);
var i = o("text/html");
var l = o("image/jpeg");
var p = o("image/png");
var d = o("image/webp");

// src/handlers/taskHandler.ts
async function handleDistributedTask(request) {
  try {
    const env = request.env;
    const body = await request.json();
    const { task, workload, priority = "normal" } = body;
    if (!task || !workload) {
      return n(400, "Missing required fields: task, workload");
    }
    const taskQueueId = env.TASK_QUEUE.idFromName("global-queue");
    const taskQueue = env.TASK_QUEUE.get(taskQueueId);
    const response = await taskQueue.fetch(request.url, {
      method: "POST",
      body: JSON.stringify({
        action: "distribute",
        task,
        workload,
        priority
      })
    });
    const result = await response.json();
    return s({
      success: true,
      taskId: result.taskId,
      nodes: result.nodes,
      estimated_completion: result.estimated_completion
    });
  } catch (err) {
    console.error("Task distribution error:", err);
    return n(500, "Task distribution failed");
  }
}
__name(handleDistributedTask, "handleDistributedTask");

// src/handlers/nodeHandler.ts
async function handleNodeRegistration(request) {
  try {
    const env = request.env;
    const body = await request.json();
    const { nodeId, location, type, capabilities } = body;
    if (!nodeId || !location || !type || !capabilities) {
      return n(400, "Missing required fields: nodeId, location, type, capabilities");
    }
    const node = {
      id: nodeId,
      location,
      type,
      capabilities: Array.isArray(capabilities) ? capabilities : [],
      status: "online",
      lastSeen: Date.now(),
      load: 0,
      tasksProcessed: 0,
      uptime: 0
    };
    const nodeRegistryId = env.NODE_REGISTRY.idFromName("global-registry");
    const nodeRegistry = env.NODE_REGISTRY.get(nodeRegistryId);
    const response = await nodeRegistry.fetch(request.url, {
      method: "POST",
      body: JSON.stringify({
        action: "register",
        node
      })
    });
    const result = await response.json();
    return s({
      success: true,
      nodeId,
      status: "registered",
      assigned_compute_units: result.compute_units || 1
    });
  } catch (err) {
    console.error("Node registration error:", err);
    return n(500, "Node registration failed");
  }
}
__name(handleNodeRegistration, "handleNodeRegistration");

// src/handlers/queueHandler.ts
async function handleTaskQueue(request) {
  try {
    const env = request.env;
    const taskQueueId = env.TASK_QUEUE.idFromName("global-queue");
    const taskQueue = env.TASK_QUEUE.get(taskQueueId);
    const response = await taskQueue.fetch(request.url, {
      method: "GET"
    });
    const queueStats = await response.json();
    const nodeRegistryId = env.NODE_REGISTRY.idFromName("global-registry");
    const nodeRegistry = env.NODE_REGISTRY.get(nodeRegistryId);
    const nodeResponse = await nodeRegistry.fetch(request.url, {
      method: "GET"
    });
    const networkStats = await nodeResponse.json();
    return s({
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
    });
  } catch (err) {
    console.error("Queue status error:", err);
    return n(500, "Failed to retrieve queue status");
  }
}
__name(handleTaskQueue, "handleTaskQueue");
function calculateEfficiency(queueStats) {
  const total = (queueStats.active || 0) + (queueStats.pending || 0) + (queueStats.completed || 0) + (queueStats.failed || 0);
  if (total === 0) return 100;
  const successful = queueStats.completed || 0;
  return Math.round(successful / total * 100);
}
__name(calculateEfficiency, "calculateEfficiency");
function calculateCoverage(networkStats) {
  const total = networkStats.total_nodes || 0;
  const active = networkStats.active_nodes || 0;
  if (total === 0) return 0;
  return Math.round(active / total * 100);
}
__name(calculateCoverage, "calculateCoverage");
function determineOverallStatus(queueStats, networkStats) {
  const efficiency = calculateEfficiency(queueStats);
  const coverage = calculateCoverage(networkStats);
  if (efficiency > 90 && coverage > 80) return "excellent";
  if (efficiency > 70 && coverage > 60) return "good";
  if (efficiency > 50 && coverage > 40) return "moderate";
  return "degraded";
}
__name(determineOverallStatus, "determineOverallStatus");

// src/durable-objects/TaskQueue.ts
import { DurableObject } from "cloudflare:workers";
var DistributedTaskQueue = class extends DurableObject {
  static {
    __name(this, "DistributedTaskQueue");
  }
  tasks = /* @__PURE__ */ new Map();
  nodeAssignments = /* @__PURE__ */ new Map();
  async handleSession(websocket, env) {
    websocket.accept();
    websocket.addEventListener("message", async (event) => {
      try {
        const message = JSON.parse(event.data);
        await this.handleMessage(message, websocket, env);
      } catch (error) {
        websocket.send(JSON.stringify({ error: "Invalid message format" }));
      }
    });
  }
  async handleMessage(message, websocket, env) {
    const { action, task, workload, priority } = message;
    switch (action) {
      case "distribute":
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const distributedTask = {
          id: taskId,
          type: task?.type || "data_processing",
          workload,
          priority: priority || "normal",
          status: "queued",
          createdAt: Date.now()
        };
        this.tasks.set(taskId, distributedTask);
        const availableNodes = await this.getAvailableNodes(env);
        const assignedNodes = this.assignTaskToNodes(distributedTask, availableNodes);
        const result = {
          taskId,
          nodes: assignedNodes,
          estimated_completion: this.estimateCompletionTime(distributedTask, assignedNodes.length)
        };
        distributedTask.status = "processing";
        distributedTask.assignedNode = assignedNodes[0];
        if (websocket) {
          websocket.send(JSON.stringify(result));
        }
        return result;
      default:
        if (websocket) {
          websocket.send(JSON.stringify({ error: "Unknown action" }));
        }
    }
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "POST") {
      const message = await request.json();
      const result = await this.handleMessage(message, void 0, this.env);
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (request.method === "GET") {
      const stats = {
        active: Array.from(this.tasks.values()).filter((t) => t.status === "processing").length,
        pending: Array.from(this.tasks.values()).filter((t) => t.status === "queued").length,
        completed: Array.from(this.tasks.values()).filter((t) => t.status === "completed").length,
        failed: Array.from(this.tasks.values()).filter((t) => t.status === "failed").length,
        avg_completion_time: this.calculateAverageCompletionTime(),
        total_tasks: this.tasks.size
      };
      return new Response(JSON.stringify(stats), {
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response("Method not allowed", { status: 405 });
  }
  async getAvailableNodes(env) {
    return ["node-us-east-1", "node-eu-west-1", "node-ap-southeast-1"];
  }
  assignTaskToNodes(task, availableNodes) {
    const assignedCount = task.priority === "critical" ? 3 : task.priority === "high" ? 2 : 1;
    return availableNodes.slice(0, assignedCount);
  }
  estimateCompletionTime(task, nodeCount) {
    const baseTime = task.workload?.size ? task.workload.size * 100 : 3e4;
    const priorityMultiplier = task.priority === "critical" ? 0.5 : task.priority === "high" ? 0.75 : 1;
    const parallelizationFactor = Math.min(nodeCount * 0.8, 1);
    return Math.round(baseTime * priorityMultiplier / parallelizationFactor);
  }
  calculateAverageCompletionTime() {
    const completedTasks = Array.from(this.tasks.values()).filter((t) => t.status === "completed");
    if (completedTasks.length === 0) return 0;
    const totalTime = completedTasks.reduce((sum, task) => {
      return sum + (Date.now() - task.createdAt);
    }, 0);
    return Math.round(totalTime / completedTasks.length);
  }
};

// src/durable-objects/NodeRegistry.ts
import { DurableObject as DurableObject2 } from "cloudflare:workers";
var NodeRegistry = class extends DurableObject2 {
  static {
    __name(this, "NodeRegistry");
  }
  nodes = /* @__PURE__ */ new Map();
  async handleSession(websocket, env) {
    websocket.accept();
    websocket.addEventListener("message", async (event) => {
      try {
        const message = JSON.parse(event.data);
        await this.handleMessage(message, websocket, env);
      } catch (error) {
        websocket.send(JSON.stringify({ error: "Invalid message format" }));
      }
    });
  }
  async handleMessage(message, websocket, env) {
    const { action, node } = message;
    switch (action) {
      case "register":
        const result = await this.registerNode(node);
        if (websocket) {
          websocket.send(JSON.stringify(result));
        }
        return result;
      case "heartbeat":
        await this.updateNodeHeartbeat(node.id);
        if (websocket) {
          websocket.send(JSON.stringify({ status: "acknowledged" }));
        }
        return { status: "acknowledged" };
      case "update_load":
        await this.updateNodeLoad(node.id, node.load);
        if (websocket) {
          websocket.send(JSON.stringify({ status: "updated" }));
        }
        return { status: "updated" };
      default:
        if (websocket) {
          websocket.send(JSON.stringify({ error: "Unknown action" }));
        }
    }
  }
  async fetch(request) {
    if (request.method === "POST") {
      const message = await request.json();
      const result = await this.handleMessage(message);
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (request.method === "GET") {
      const activeNodes = Array.from(this.nodes.values()).filter((node) => node.status === "online");
      const regions = this.getRegionalDistribution();
      const computePower = this.calculateTotalComputePower();
      const stats = {
        total_nodes: this.nodes.size,
        active_nodes: activeNodes.length,
        regions,
        compute_power: computePower,
        node_types: this.getNodeTypeDistribution(),
        average_load: this.calculateAverageLoad(),
        uptime_stats: this.getUptimeStats()
      };
      return new Response(JSON.stringify(stats), {
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response("Method not allowed", { status: 405 });
  }
  async registerNode(nodeData) {
    const computeUnits = this.calculateComputeUnits(nodeData);
    const node = {
      ...nodeData,
      lastSeen: Date.now(),
      status: "online",
      load: 0,
      tasksProcessed: 0,
      uptime: 0
    };
    this.nodes.set(node.id, node);
    return {
      nodeId: node.id,
      status: "registered",
      compute_units: computeUnits,
      assigned_region: this.assignRegion(node.location)
    };
  }
  async updateNodeHeartbeat(nodeId) {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.lastSeen = Date.now();
      node.status = "online";
      node.uptime += 1;
    }
  }
  async updateNodeLoad(nodeId, load) {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.load = Math.max(0, Math.min(100, load));
      node.lastSeen = Date.now();
    }
  }
  calculateComputeUnits(node) {
    let units = 1;
    switch (node.type) {
      case "server":
        units = 10;
        break;
      case "edge":
        units = 5;
        break;
      case "browser":
        units = 2;
        break;
      case "mobile":
        units = 1;
        break;
    }
    if (node.capabilities.includes("gpu")) units *= 2;
    if (node.capabilities.includes("ml")) units *= 1.5;
    if (node.capabilities.includes("crypto")) units *= 1.2;
    return Math.round(units);
  }
  assignRegion(location) {
    if (location.toLowerCase().includes("us") || location.toLowerCase().includes("america")) {
      return "us-east-1";
    }
    if (location.toLowerCase().includes("eu") || location.toLowerCase().includes("europe")) {
      return "eu-west-1";
    }
    if (location.toLowerCase().includes("asia") || location.toLowerCase().includes("ap")) {
      return "ap-southeast-1";
    }
    return "global";
  }
  getRegionalDistribution() {
    const regions = {};
    for (const node of this.nodes.values()) {
      const region = this.assignRegion(node.location);
      regions[region] = (regions[region] || 0) + 1;
    }
    return regions;
  }
  calculateTotalComputePower() {
    return Array.from(this.nodes.values()).filter((node) => node.status === "online").reduce((total, node) => total + this.calculateComputeUnits(node), 0);
  }
  getNodeTypeDistribution() {
    const types = {};
    for (const node of this.nodes.values()) {
      types[node.type] = (types[node.type] || 0) + 1;
    }
    return types;
  }
  calculateAverageLoad() {
    const activeNodes = Array.from(this.nodes.values()).filter((node) => node.status === "online");
    if (activeNodes.length === 0) return 0;
    const totalLoad = activeNodes.reduce((sum, node) => sum + node.load, 0);
    return Math.round(totalLoad / activeNodes.length);
  }
  getUptimeStats() {
    const activeNodes = Array.from(this.nodes.values()).filter((node) => node.status === "online");
    if (activeNodes.length === 0) {
      return { average: 0, total: 0 };
    }
    const totalUptime = activeNodes.reduce((sum, node) => sum + node.uptime, 0);
    const averageUptime = totalUptime / activeNodes.length;
    return {
      average: Math.round(averageUptime),
      total: totalUptime
    };
  }
};

// src/index.ts
var router = e();
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
router.options("*", () => new Response(null, { headers: corsHeaders }));
router.post("/api/tasks/distribute", handleDistributedTask);
router.post("/api/nodes/register", handleNodeRegistration);
router.get("/api/queue/status", handleTaskQueue);
router.get("/health", () => new Response(JSON.stringify({ status: "healthy", timestamp: (/* @__PURE__ */ new Date()).toISOString() }), {
  headers: { ...corsHeaders, "Content-Type": "application/json" }
}));
router.all("*", () => new Response(JSON.stringify({ error: "Not Found" }), {
  status: 404,
  headers: { ...corsHeaders, "Content-Type": "application/json" }
}));
var src_default = {
  async fetch(request, env, ctx) {
    try {
      request.env = env;
      const response = await router.handle(request);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    } catch (error) {
      console.error("Worker error:", error);
      return new Response(JSON.stringify({
        error: "Internal Server Error",
        message: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};

// ../../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e2) {
      console.error("Failed to drain the unused request body.", e2);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e2) {
  return {
    name: e2?.name,
    message: e2?.message ?? String(e2),
    stack: e2?.stack,
    cause: e2?.cause === void 0 ? void 0 : reduceError(e2.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e2) {
    const error = reduceError(e2);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-8S35aR/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-8S35aR/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  DistributedTaskQueue,
  NodeRegistry,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map

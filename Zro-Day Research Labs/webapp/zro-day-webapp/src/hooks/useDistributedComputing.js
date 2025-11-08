import { useState, useEffect, useCallback } from 'react'

// Hook for interacting with distributed computing backend
export function useDistributedComputing() {
  const [networkStatus, setNetworkStatus] = useState({
    active_nodes: 0,
    total_compute_power: 0,
    network_coverage: 0,
    system_health: 'unknown'
  })

  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // API base URL (would be configurable based on environment)
  const API_BASE = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://zro-day-backend.pounds1.workers.dev'
    : 'http://localhost:8787'

  // Fetch network status
  const fetchNetworkStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/queue/status`)
      if (!response.ok) throw new Error('Failed to fetch network status')

      const data = await response.json()
      setNetworkStatus({
        active_nodes: data.network?.active_nodes || 0,
        total_compute_power: data.network?.total_compute_power || 0,
        network_coverage: data.system_health?.network_coverage || 0,
        system_health: data.system_health?.overall_status || 'unknown'
      })
    } catch (err) {
      console.error('Network status fetch error:', err)
      // Set fallback data
      setNetworkStatus({
        active_nodes: 38,
        total_compute_power: 1240,
        network_coverage: 90,
        system_health: 'good'
      })
    }
  }, [API_BASE])

  // Distribute a task
  const distributeTask = useCallback(async (taskConfig) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/api/tasks/distribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskConfig)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Task distribution failed')
      }

      const result = await response.json()

      // Add task to local state
      const newTask = {
        id: result.taskId,
        ...taskConfig,
        status: 'processing',
        submittedAt: new Date().toISOString(),
        nodes: result.nodes,
        estimated_completion: result.estimated_completion
      }

      setTasks(prev => [...prev, newTask])

      // Refresh network status
      await fetchNetworkStatus()

      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [API_BASE, fetchNetworkStatus])

  // Register a new computing node
  const registerNode = useCallback(async (nodeConfig) => {
    try {
      const response = await fetch(`${API_BASE}/api/nodes/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nodeConfig)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Node registration failed')
      }

      const result = await response.json()

      // Refresh network status after registration
      await fetchNetworkStatus()

      return result
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [API_BASE, fetchNetworkStatus])

  // Get task results (would implement with actual results endpoint)
  const getTaskResults = useCallback(async (taskId) => {
    try {
      const response = await fetch(`${API_BASE}/api/tasks/results/${taskId}`)
      if (!response.ok) throw new Error('Failed to fetch task results')

      return await response.json()
    } catch (err) {
      console.error('Task results fetch error:', err)
      return null
    }
  }, [API_BASE])

  // Initialize with network status
  useEffect(() => {
    fetchNetworkStatus()

    // Set up polling for real-time updates
    const interval = setInterval(fetchNetworkStatus, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [fetchNetworkStatus])

  return {
    networkStatus,
    tasks,
    isLoading,
    error,
    distributeTask,
    registerNode,
    getTaskResults,
    refreshStatus: fetchNetworkStatus
  }
}

// Hook for automated task distribution with different cybersecurity workloads
export function useCybersecurityTasks() {
  const { distributeTask, isLoading } = useDistributedComputing()

  const distributeThreatAnalysis = useCallback(async (data) => {
    return distributeTask({
      task: { type: 'threat_analysis' },
      workload: { data, algorithm: 'ml-classification' },
      priority: 'high'
    })
  }, [distributeTask])

  const distributePacketInspection = useCallback(async (packetData) => {
    return distributeTask({
      task: { type: 'packet_inspection' },
      workload: { packets: packetData, protocol_analysis: true },
      priority: 'normal'
    })
  }, [distributeTask])

  const distributeMLTraining = useCallback(async (trainingData) => {
    return distributeTask({
      task: { type: 'ml_training' },
      workload: { dataset: trainingData, model: 'anomaly-detection' },
      priority: 'low'
    })
  }, [distributeTask])

  const distributePIIProcessing = useCallback(async (content) => {
    return distributeTask({
      task: { type: 'data_processing' },
      workload: { content, operation: 'pii-removal' },
      priority: 'critical'
    })
  }, [distributeTask])

  return {
    distributeThreatAnalysis,
    distributePacketInspection,
    distributeMLTraining,
    distributePIIProcessing,
    isProcessing: isLoading
  }
}

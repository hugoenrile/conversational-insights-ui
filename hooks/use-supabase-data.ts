'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  customerService, 
  conversationService, 
  insightService, 
  dashboardService,
  realtimeService 
} from '@/lib/supabase/services'
import { toast } from 'sonner'

// Generic hook for data fetching with loading and error states
export function useSupabaseQuery<T>(
  queryFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await queryFn()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error(`Failed to fetch data: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Customer hooks
export function useCustomers(filters?: Parameters<typeof customerService.getAll>[0]) {
  return useSupabaseQuery(
    () => customerService.getAll(filters),
    [filters]
  )
}

export function useCustomer(id: string) {
  return useSupabaseQuery(
    () => customerService.getById(id),
    [id]
  )
}

export function useCustomerHealthMetrics() {
  return useSupabaseQuery(() => customerService.getHealthMetrics())
}

export function useCustomerCounts() {
  return useSupabaseQuery(() => customerService.getCustomerCounts())
}

// Conversation hooks
export function useConversations(filters?: Parameters<typeof conversationService.getAll>[0]) {
  return useSupabaseQuery(
    () => conversationService.getAll(filters),
    [filters]
  )
}

export function useConversation(id: string) {
  return useSupabaseQuery(
    () => conversationService.getById(id),
    [id]
  )
}

// Insight hooks
export function useInsights(filters?: Parameters<typeof insightService.getAll>[0]) {
  return useSupabaseQuery(
    () => insightService.getAll(filters),
    [filters]
  )
}

export function useInsight(id: string) {
  return useSupabaseQuery(
    () => insightService.getById(id),
    [id]
  )
}

export function useInsightTopics() {
  return useSupabaseQuery(() => insightService.getTopics())
}

export function useInsightCategories() {
  return useSupabaseQuery(() => insightService.getCategories())
}


// Dashboard hooks
export function useDashboardKPIs() {
  return useSupabaseQuery(() => dashboardService.getKPIs())
}

export function useRecentInsights(limit?: number) {
  return useSupabaseQuery(
    () => dashboardService.getRecentInsights(limit),
    [limit]
  )
}

export function useInsightsByCategory() {
  return useSupabaseQuery(() => dashboardService.getInsightsByCategory())
}

// Real-time hooks
export function useRealtimeInsights() {
  const [insights, setInsights] = useState<any[]>([])

  useEffect(() => {
    const channel = realtimeService.subscribeToInsights((payload) => {
      console.log('Insight change:', payload)
      // Handle real-time updates
      if (payload.eventType === 'INSERT') {
        setInsights(prev => [payload.new, ...prev])
        toast.success('New insight generated!')
      } else if (payload.eventType === 'UPDATE') {
        setInsights(prev => 
          prev.map(insight => 
            insight.id === payload.new.id ? payload.new : insight
          )
        )
      } else if (payload.eventType === 'DELETE') {
        setInsights(prev => 
          prev.filter(insight => insight.id !== payload.old.id)
        )
      }
    })

    return () => {
      channel.unsubscribe()
    }
  }, [])

  return insights
}

export function useRealtimeConversations() {
  const [conversations, setConversations] = useState<any[]>([])

  useEffect(() => {
    const channel = realtimeService.subscribeToConversations((payload) => {
      console.log('Conversation change:', payload)
      if (payload.eventType === 'INSERT') {
        setConversations(prev => [payload.new, ...prev])
        toast.success('New conversation recorded!')
      } else if (payload.eventType === 'UPDATE') {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === payload.new.id ? payload.new : conv
          )
        )
      }
    })

    return () => {
      channel.unsubscribe()
    }
  }, [])

  return conversations
}



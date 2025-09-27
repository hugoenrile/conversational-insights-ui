import { supabase } from './config'
import type { Database } from './types'

type Customer = Database['public']['Tables']['customers']['Row']
type Conversation = Database['public']['Tables']['conversations']['Row']
type Insight = Database['public']['Tables']['insights']['Row']
type Action = Database['public']['Tables']['actions']['Row']

// Customer Services
export const customerService = {
  async getAll(filters?: {
    status?: string
    tier?: string
    industry?: string
    search?: string
  }) {
    let query = supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    if (filters?.tier && filters.tier !== 'all') {
      query = query.eq('tier', filters.tier)
    }
    if (filters?.industry && filters.industry !== 'all') {
      query = query.eq('industry', filters.industry)
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        conversations:conversations(*),
        insights:insights(*),
        actions:actions(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getHealthMetrics() {
    const { data, error } = await supabase
      .from('customer_health_metrics')
      .select('*')
      .order('health_score', { ascending: false })

    if (error) throw error
    return data
  },

  async getCustomerCounts() {
    // Get conversation counts per customer
    const { data: conversationCounts, error: convError } = await supabase
      .from('conversations')
      .select('customer_id')
      .not('customer_id', 'is', null)

    if (convError) throw convError

    // Get insight counts per customer
    const { data: insightCounts, error: insightError } = await supabase
      .from('insights')
      .select('customer_id')
      .not('customer_id', 'is', null)

    if (insightError) throw insightError

    // Count conversations per customer
    const conversationCountMap = new Map<string, number>()
    conversationCounts.forEach(conv => {
      const customerId = conv.customer_id
      conversationCountMap.set(customerId, (conversationCountMap.get(customerId) || 0) + 1)
    })

    // Count insights per customer
    const insightCountMap = new Map<string, number>()
    insightCounts.forEach(insight => {
      const customerId = insight.customer_id
      insightCountMap.set(customerId, (insightCountMap.get(customerId) || 0) + 1)
    })

    return {
      conversationCounts: conversationCountMap,
      insightCounts: insightCountMap
    }
  }
}

// Conversation Services
export const conversationService = {
  async getAll(filters?: {
    type?: string
    status?: string
    priority?: string
    customerId?: string
    search?: string
    dateFrom?: string
    dateTo?: string
  }) {
    let query = supabase
      .from('conversations')
      .select(`
        *,
        customer:customers(name, industry)
      `)
      .order('created_at', { ascending: false })

    if (filters?.type && filters.type !== 'all') {
      query = query.eq('type', filters.type)
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    if (filters?.priority && filters.priority !== 'all') {
      query = query.eq('priority', filters.priority)
    }
    if (filters?.customerId) {
      query = query.eq('customer_id', filters.customerId)
    }
    if (filters?.search) {
      query = query.or(`subject.ilike.%${filters.search}%,summary.ilike.%${filters.search}%`)
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        customer:customers(*),
        insights:insights(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getInsightsSummary() {
    const { data, error } = await supabase
      .from('conversation_insights_summary')
      .select('*')

    if (error) throw error
    return data
  },

}

// Insight Services
export const insightService = {
  async getAll(filters?: {
    category?: string
    urgency?: number
    confidence?: number
    customerId?: string
    conversationId?: string
    search?: string
    searchTerms?: string[] // New: for OR logic search
    dateFrom?: string
    dateTo?: string
  }) {
    let query = supabase
      .from('insights')
      .select(`
        *,
        customer:customers(name, industry),
        conversation:conversations(type, created_at)
      `)
      .order('created_at', { ascending: false })

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }
    if (filters?.urgency) {
      query = query.gte('urgency_score', filters.urgency)
    }
    if (filters?.confidence) {
      query = query.gte('confidence_score', filters.confidence)
    }
    if (filters?.customerId) {
      query = query.eq('customer_id', filters.customerId)
    }
    if (filters?.conversationId) {
      query = query.eq('conversation_id', filters.conversationId)
    }
    if (filters?.search) {
      query = query.ilike('text', `%${filters.search}%`)
    }
    // OR logic for multiple search terms - searches in both text and topics
    if (filters?.searchTerms && filters.searchTerms.length > 0) {
      // Create OR conditions for each search term
      const orConditions = filters.searchTerms.map(term => 
        `text.ilike.%${term}%,topics.cs.{${term}}`
      ).join(',')
      query = query.or(orConditions)
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('insights')
      .select(`
        *,
        customer:customers(*),
        conversation:conversations(*),
        actions:actions(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getTopics() {
    const { data, error } = await supabase
      .from('insights')
      .select('topics')
      .not('topics', 'is', null)

    if (error) throw error
    
    // Flatten and count topics
    const topicCounts = new Map<string, number>()
    data.forEach(row => {
      row.topics?.forEach((topic: string) => {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1)
      })
    })

    return Array.from(topicCounts.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('insights')
      .select('category')
      .not('category', 'is', null)

    if (error) throw error

    // Count categories
    const categoryCounts = new Map<string, number>()
    data.forEach(row => {
      if (row.category) {
        categoryCounts.set(row.category, (categoryCounts.get(row.category) || 0) + 1)
      }
    })

    return Array.from(categoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
  },

}


// Dashboard Services
export const dashboardService = {
  async getKPIs() {
    const [customers, conversations, insights] = await Promise.all([
      supabase.from('customers').select('id, status').eq('status', 'active'),
      supabase.from('conversations').select('id, type').eq('type', 'call'),
      supabase.from('insights').select('id')
    ])

    if (customers.error) throw customers.error
    if (conversations.error) throw conversations.error
    if (insights.error) throw insights.error

    return {
      activeCustomers: customers.data?.length || 0,
      totalCalls: conversations.data?.length || 0,
      totalInsights: insights.data?.length || 0
    }
  },

  async getRecentInsights(limit = 5) {
    const { data, error } = await supabase
      .from('insights')
      .select(`
        *,
        customer:customers(name, industry),
        conversation:conversations(type, created_at)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  async getInsightsByCategory() {
    const { data, error } = await supabase
      .from('insights')
      .select('category')
      .not('category', 'is', null)

    if (error) throw error

    const categoryCounts = new Map<string, number>()
    data.forEach(row => {
      if (row.category) {
        categoryCounts.set(row.category, (categoryCounts.get(row.category) || 0) + 1)
      }
    })

    return Array.from(categoryCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }
}

// Real-time subscriptions
export const realtimeService = {
  subscribeToInsights(callback: (payload: any) => void) {
    return supabase
      .channel('insights-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'insights' }, 
        callback
      )
      .subscribe()
  },

  subscribeToConversations(callback: (payload: any) => void) {
    return supabase
      .channel('conversations-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'conversations' }, 
        callback
      )
      .subscribe()
  },

  subscribeToCustomers(callback: (payload: any) => void) {
    return supabase
      .channel('customers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customers' }, 
        callback
      )
      .subscribe()
  },

  subscribeToActions(callback: (payload: any) => void) {
    return supabase
      .channel('actions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'actions' }, 
        callback
      )
      .subscribe()
  }
}

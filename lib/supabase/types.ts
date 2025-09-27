export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          name: string
          industry: string | null
          size: 'startup' | 'small' | 'medium' | 'enterprise' | null
          tier: 'free' | 'pro' | 'enterprise' | null
          status: 'active' | 'inactive' | 'churned' | 'prospect' | null
          health_score: number | null
          revenue: number | null
          location: Json | null
          contact_info: Json | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          industry?: string | null
          size?: 'startup' | 'small' | 'medium' | 'enterprise' | null
          tier?: 'free' | 'pro' | 'enterprise' | null
          status?: 'active' | 'inactive' | 'churned' | 'prospect' | null
          health_score?: number | null
          revenue?: number | null
          location?: Json | null
          contact_info?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          industry?: string | null
          size?: 'startup' | 'small' | 'medium' | 'enterprise' | null
          tier?: 'free' | 'pro' | 'enterprise' | null
          status?: 'active' | 'inactive' | 'churned' | 'prospect' | null
          health_score?: number | null
          revenue?: number | null
          location?: Json | null
          contact_info?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          customer_id: string | null
          type: 'call' | 'email' | 'chat' | 'meeting' | null
          channel: string | null
          direction: 'inbound' | 'outbound' | null
          raw_transcript: string | null
          raw_metadata: Json | null
          processed_transcript: string | null
          summary: string | null
          subject: string | null
          participants: Json | null
          duration_minutes: number | null
          sentiment_score: number | null
          priority: 'low' | 'medium' | 'high' | 'urgent' | null
          status: 'completed' | 'scheduled' | 'cancelled' | null
          scheduled_at: string | null
          started_at: string | null
          ended_at: string | null
          created_at: string
          updated_at: string
          search_vector: unknown | null
        }
        Insert: {
          id?: string
          customer_id?: string | null
          type?: 'call' | 'email' | 'chat' | 'meeting' | null
          channel?: string | null
          direction?: 'inbound' | 'outbound' | null
          raw_transcript?: string | null
          raw_metadata?: Json | null
          processed_transcript?: string | null
          summary?: string | null
          subject?: string | null
          participants?: Json | null
          duration_minutes?: number | null
          sentiment_score?: number | null
          priority?: 'low' | 'medium' | 'high' | 'urgent' | null
          status?: 'completed' | 'scheduled' | 'cancelled' | null
          scheduled_at?: string | null
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          type?: 'call' | 'email' | 'chat' | 'meeting' | null
          channel?: string | null
          direction?: 'inbound' | 'outbound' | null
          raw_transcript?: string | null
          raw_metadata?: Json | null
          processed_transcript?: string | null
          summary?: string | null
          subject?: string | null
          participants?: Json | null
          duration_minutes?: number | null
          sentiment_score?: number | null
          priority?: 'low' | 'medium' | 'high' | 'urgent' | null
          status?: 'completed' | 'scheduled' | 'cancelled' | null
          scheduled_at?: string | null
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_health_metrics"
            referencedColumns: ["id"]
          }
        ]
      }
      insights: {
        Row: {
          id: string
          conversation_id: string | null
          customer_id: string | null
          category: 'pain_point' | 'opportunity' | 'objection' | 'request' | 'issue' | 'success' | 'update' | null
          subcategory: string | null
          text: string
          confidence_score: number | null
          topics: string[] | null
          entities: Json | null
          sentiment_score: number | null
          urgency_score: number | null
          potential_revenue: number | null
          risk_level: 'low' | 'medium' | 'high' | 'critical' | null
          actionable: boolean | null
          model_version: string | null
          processing_timestamp: string
          human_verified: boolean | null
          human_feedback: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          conversation_id?: string | null
          customer_id?: string | null
          category?: 'pain_point' | 'opportunity' | 'objection' | 'request' | 'issue' | 'success' | 'update' | null
          subcategory?: string | null
          text: string
          confidence_score?: number | null
          topics?: string[] | null
          entities?: Json | null
          sentiment_score?: number | null
          urgency_score?: number | null
          potential_revenue?: number | null
          risk_level?: 'low' | 'medium' | 'high' | 'critical' | null
          actionable?: boolean | null
          model_version?: string | null
          processing_timestamp?: string
          human_verified?: boolean | null
          human_feedback?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string | null
          customer_id?: string | null
          category?: 'pain_point' | 'opportunity' | 'objection' | 'request' | 'issue' | 'success' | 'update' | null
          subcategory?: string | null
          text?: string
          confidence_score?: number | null
          topics?: string[] | null
          entities?: Json | null
          sentiment_score?: number | null
          urgency_score?: number | null
          potential_revenue?: number | null
          risk_level?: 'low' | 'medium' | 'high' | 'critical' | null
          actionable?: boolean | null
          model_version?: string | null
          processing_timestamp?: string
          human_verified?: boolean | null
          human_feedback?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insights_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insights_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation_insights_summary"
            referencedColumns: ["conversation_id"]
          },
          {
            foreignKeyName: "insights_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insights_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_health_metrics"
            referencedColumns: ["id"]
          }
        ]
      }
      actions: {
        Row: {
          id: string
          insight_id: string | null
          customer_id: string | null
          title: string
          description: string | null
          type: 'follow_up' | 'escalation' | 'opportunity' | 'research' | null
          priority: 'low' | 'medium' | 'high' | 'urgent' | null
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | null
          assigned_to: string | null
          due_date: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          insight_id?: string | null
          customer_id?: string | null
          title: string
          description?: string | null
          type?: 'follow_up' | 'escalation' | 'opportunity' | 'research' | null
          priority?: 'low' | 'medium' | 'high' | 'urgent' | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | null
          assigned_to?: string | null
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          insight_id?: string | null
          customer_id?: string | null
          title?: string
          description?: string | null
          type?: 'follow_up' | 'escalation' | 'opportunity' | 'research' | null
          priority?: 'low' | 'medium' | 'high' | 'urgent' | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | null
          assigned_to?: string | null
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "actions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_health_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_insight_id_fkey"
            columns: ["insight_id"]
            isOneToOne: false
            referencedRelation: "insights"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      customer_health_metrics: {
        Row: {
          id: string | null
          name: string | null
          health_score: number | null
          tier: 'free' | 'pro' | 'enterprise' | null
          status: 'active' | 'inactive' | 'churned' | 'prospect' | null
          total_conversations: number | null
          conversations_last_30d: number | null
          avg_sentiment: number | null
          total_insights: number | null
          pain_points: number | null
          opportunities: number | null
          last_interaction: string | null
        }
        Relationships: []
      }
      conversation_insights_summary: {
        Row: {
          conversation_id: string | null
          customer_id: string | null
          type: 'call' | 'email' | 'chat' | 'meeting' | null
          sentiment_score: number | null
          insight_count: number | null
          categories: ('pain_point' | 'opportunity' | 'objection' | 'request' | 'issue' | 'success' | 'update')[] | null
          avg_confidence: number | null
          max_urgency: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      action_status_enum: 'pending' | 'in_progress' | 'completed' | 'cancelled'
      action_type_enum: 'follow_up' | 'escalation' | 'opportunity' | 'research'
      audit_action_enum: 'insert' | 'update' | 'delete'
      conversation_direction_enum: 'inbound' | 'outbound'
      conversation_status_enum: 'completed' | 'scheduled' | 'cancelled'
      conversation_type_enum: 'call' | 'email' | 'chat' | 'meeting'
      customer_size_enum: 'startup' | 'small' | 'medium' | 'enterprise'
      customer_status_enum: 'active' | 'inactive' | 'churned' | 'prospect'
      customer_tier_enum: 'free' | 'pro' | 'enterprise'
      insight_category_enum: 'pain_point' | 'opportunity' | 'objection' | 'request' | 'issue' | 'success' | 'update'
      job_status_enum: 'pending' | 'processing' | 'completed' | 'failed'
      priority_enum: 'low' | 'medium' | 'high' | 'urgent'
      processing_job_type_enum: 'transcription' | 'nlp' | 'insight_extraction'
      risk_level_enum: 'low' | 'medium' | 'high' | 'critical'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

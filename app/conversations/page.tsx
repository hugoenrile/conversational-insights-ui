"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useConversations } from "@/hooks/use-supabase-data";
import { DataTable } from "@/components/data-table";
import { conversationColumns } from "./columns";
import { ConversationFilters } from "@/components/filters/conversation-filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Clock, 
  Users, 
  Calendar,
  Tag,
  TrendingUp,
  Filter,
  X
} from "lucide-react";

const AnimatedNumber = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easeOutCubic * value);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

export default function ConversationsPage() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  // Memoize filters to prevent unnecessary re-renders
  const conversationFilters = useMemo(() => ({
    type: typeFilter || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  }), [typeFilter, statusFilter, priorityFilter]);

  // Supabase data hooks
  const { data: conversationsData, loading: conversationsLoading, error: conversationsError } = useConversations(conversationFilters);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const sentiment = searchParams.get('sentiment');
    const priority = searchParams.get('priority');
    
    if (type) setTypeFilter(type);
    if (status) setStatusFilter(status);
    if (sentiment) setSentimentFilter(sentiment);
    if (priority) setPriorityFilter(priority);
  }, [searchParams]);

  const enrichedConversations = useMemo(() => {
    if (!conversationsData) return [];
    
    return conversationsData.map((conversation: any) => ({
      id: conversation.id,
      type: conversation.type,
      subject: conversation.subject,
      summary: conversation.summary,
      date: conversation.created_at,
      status: conversation.status,
      priority: conversation.priority,
      sentiment_score: conversation.sentiment_score,
      duration_minutes: conversation.duration_minutes,
      customerName: conversation.customer?.name || 'Unknown',
      customerIndustry: conversation.customer?.industry || 'Unknown',
      insightCount: 0, // Will be calculated separately if needed
      participants: conversation.participants || [],
      // Add missing properties for compatibility
      customerId: conversation.customer_id,
      sentiment: (conversation.sentiment_score > 0 ? 'positive' : conversation.sentiment_score < 0 ? 'negative' : 'neutral') as 'positive' | 'negative' | 'neutral',
      tags: [],
      duration: conversation.duration_minutes,
    }));
  }, [conversationsData]);

  const filteredConversations = useMemo(() => {
    return enrichedConversations.filter((conv) => {
      if (typeFilter && conv.type !== typeFilter) return false;
      if (statusFilter && conv.status !== statusFilter) return false;
      if (sentimentFilter && conv.sentiment_score !== sentimentFilter) return false;
      if (priorityFilter && conv.priority !== priorityFilter) return false;
      return true;
    });
  }, [enrichedConversations, typeFilter, statusFilter, sentimentFilter, priorityFilter]);

  const selectedConv = selectedConversation 
    ? enrichedConversations.find((c) => c.id === selectedConversation)
    : null;

  const selectedInsights: any[] = []; // Simplified for now - can be enhanced later

  const stats = useMemo(() => {
    if (!conversationsData) return { total: 0, completed: 0, scheduled: 0, avgDuration: 0 };
    
    const total = conversationsData.length;
    const completed = conversationsData.filter((c: any) => c.status === 'completed').length;
    const scheduled = conversationsData.filter((c: any) => c.status === 'scheduled').length;
    const totalDuration = conversationsData
      .filter((c: any) => c.duration_minutes)
      .reduce((sum: number, c: any) => sum + (c.duration_minutes || 0), 0);
    const avgDuration = totalDuration / conversationsData.filter((c: any) => c.duration_minutes).length || 0;

    return { total, completed, scheduled, avgDuration };
  }, [conversationsData]);

  const activeFilters = [
    typeFilter ? { label: `Type: ${typeFilter}`, onRemove: () => setTypeFilter(null) } : null,
    statusFilter ? { label: `Status: ${statusFilter}`, onRemove: () => setStatusFilter(null) } : null,
    sentimentFilter ? { label: `Sentiment: ${sentimentFilter}`, onRemove: () => setSentimentFilter(null) } : null,
    priorityFilter ? { label: `Priority: ${priorityFilter}`, onRemove: () => setPriorityFilter(null) } : null,
  ].filter(Boolean);

  const clearAllFilters = () => {
    setTypeFilter(null);
    setStatusFilter(null);
    setSentimentFilter(null);
    setPriorityFilter(null);
  };


  if (conversationsError) {
    return (
      <div className="p-6 space-y-6 bg-background">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">📞 Conversations</h1>
          <p className="text-muted-foreground">Unable to load conversations</p>
        </div>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <span>⚠️</span>
              <span>Failed to load conversations data</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

    return (
    <div className="p-6 space-y-6 bg-background">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">📞 Conversations</h1>
        <p className="text-muted-foreground">Manage and analyze your customer conversations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <MessageSquare className="h-4 w-4" />
                </motion.div>
                Total Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {mounted ? <AnimatedNumber value={stats.total} duration={1500} /> : stats.total}
              </div>
              <p className="text-xs text-muted-foreground mt-1">💬 All conversations</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border hover:shadow-lg transition-all bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <TrendingUp className="h-4 w-4" />
                </motion.div>
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mounted ? <AnimatedNumber value={stats.completed} duration={1800} /> : stats.completed}
              </div>
              <p className="text-xs text-muted-foreground mt-1">✅ Successfully finished</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border hover:shadow-lg transition-all bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Calendar className="h-4 w-4" />
                </motion.div>
                Scheduled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {mounted ? <AnimatedNumber value={stats.scheduled} duration={2000} /> : stats.scheduled}
              </div>
              <p className="text-xs text-muted-foreground mt-1">📅 Upcoming meetings</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border hover:shadow-lg transition-all bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 15, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Clock className="h-4 w-4" />
                </motion.div>
                Avg Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {mounted ? <AnimatedNumber value={Math.round(stats.avgDuration)} duration={2200} /> : Math.round(stats.avgDuration)}m
              </div>
              <p className="text-xs text-muted-foreground mt-1">⏱️ Average time</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: conversationsLoading ? 0.7 : 1, 
          y: 0 
        }}
        transition={{ duration: 0.3 }}
      >
        <ConversationFilters
          typeFilter={typeFilter}
          statusFilter={statusFilter}
          sentimentFilter={sentimentFilter}
          priorityFilter={priorityFilter}
          onTypeChange={setTypeFilter}
          onStatusChange={setStatusFilter}
          onSentimentChange={setSentimentFilter}
          onPriorityChange={setPriorityFilter}
        />
      </motion.div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {activeFilters.map((filter, idx) => (
            <span
              key={idx}
              className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm"
            >
              {filter?.label}
              <button
                onClick={filter?.onRemove}
                className="text-blue-600 hover:text-blue-900"
              >
                <X size={14} />
              </button>
            </span>
          ))}
          <button
            onClick={clearAllFilters}
            className="ml-2 flex items-center gap-2 bg-red-100 text-red-700 px-2 py-0.5 rounded text-sm hover:bg-red-200"
          >
            Clear all
            <span className="bg-red-600 text-white rounded-full px-2 py-0.5 text-xs">
              {activeFilters.length}
            </span>
          </button>
        </div>
      )}

      <motion.div 
        className="text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Showing <motion.span
          key={filteredConversations.length}
          initial={{ scale: 1.2, color: "#3b82f6" }}
          animate={{ scale: 1, color: "#64748b" }}
          transition={{ duration: 0.3 }}
        >
          {filteredConversations.length}
        </motion.span> of {enrichedConversations.length} conversations
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <Card className="border hover:shadow-md transition-shadow relative">
          {conversationsLoading && (
            <div className="absolute inset-0 bg-white/60 dark:bg-black/60 rounded-lg flex items-center justify-center z-10">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-muted-foreground">Updating conversations...</span>
              </div>
            </div>
          )}
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <DataTable
                columns={conversationColumns}
                data={filteredConversations}
                onRowClick={(row) => setSelectedConversation(row.id)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog
        open={!!selectedConversation}
        onOpenChange={() => setSelectedConversation(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedConv && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedConv.type === 'call' && <Phone className="h-5 w-5" />}
                  {selectedConv.type === 'email' && <Mail className="h-5 w-5" />}
                  {selectedConv.type === 'chat' && <MessageSquare className="h-5 w-5" />}
                  {selectedConv.subject}
                </DialogTitle>
                <DialogDescription>
                  Conversation with {selectedConv.customerName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Conversation Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Customer</div>
                    <div className="font-medium">{selectedConv.customerName}</div>
                    <div className="text-sm text-muted-foreground">{selectedConv.customerIndustry}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedConv.date).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}
                    </div>
                  </div>
                  
                  {selectedConv.duration && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Duration</div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {selectedConv.duration}m
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Participants</div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {selectedConv.participants.length}
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className={
                    selectedConv.status === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedConv.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {selectedConv.status.charAt(0).toUpperCase() + selectedConv.status.slice(1)}
                  </Badge>
                  
                  <Badge variant="secondary" className={
                    selectedConv.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                    selectedConv.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {selectedConv.sentiment === 'positive' ? '😊' : selectedConv.sentiment === 'negative' ? '😞' : '😐'} {selectedConv.sentiment}
                  </Badge>
                  
                  <Badge variant="secondary" className={
                    selectedConv.priority === 'high' ? 'bg-red-100 text-red-800' :
                    selectedConv.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {selectedConv.priority} Priority
                  </Badge>
                </div>

                {/* Summary */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Summary</h3>
                  <p className="text-sm leading-relaxed">{selectedConv.summary}</p>
                </div>

                {/* Participants */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Participants</h3>
                  <div className="space-y-1">
                    {selectedConv.participants && selectedConv.participants.length > 0 ? (
                      selectedConv.participants.map((participant: any, idx: number) => (
                        <div key={idx} className="text-sm flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span className="font-medium">{participant?.name || 'Unknown'}</span>
                          <span className="text-muted-foreground">({participant?.role || 'participant'})</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No participants listed</div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedConv.tags.map((tag: string, idx: number) => (
                      <Badge key={tag} variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Related Insights */}
                {selectedInsights.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Related Insights ({selectedInsights.length})
                    </h3>
                    <div className="space-y-3">
                        {selectedInsights.map((insight: any, idx: number) => (
                        <div key={insight.id} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{insight.category}</Badge>
                            {insight.topics?.map((topic: string, topicIdx: number) => (
                              <Badge key={topic} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm">{insight.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={() => setSelectedConversation(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      </div>
    );
  }
  
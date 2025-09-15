"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { conversations, customers, insights } from "@/lib/mock-data";
import { DataTable } from "@/components/data-table";
import { conversationColumns } from "./columns";
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
    return conversations.map((conversation) => {
      const customer = customers.find((c) => c.id === conversation.customerId);
      const conversationInsights = insights.filter((i) => i.conversationId === conversation.id);
      
      return {
        ...conversation,
        customerName: customer?.name || "Unknown",
        customerIndustry: customer?.industry || "Unknown",
        insightCount: conversationInsights.length,
      };
    });
  }, []);

  const filteredConversations = useMemo(() => {
    return enrichedConversations.filter((conv) => {
      if (typeFilter && conv.type !== typeFilter) return false;
      if (statusFilter && conv.status !== statusFilter) return false;
      if (sentimentFilter && conv.sentiment !== sentimentFilter) return false;
      if (priorityFilter && conv.priority !== priorityFilter) return false;
      return true;
    });
  }, [enrichedConversations, typeFilter, statusFilter, sentimentFilter, priorityFilter]);

  const selectedConv = selectedConversation 
    ? enrichedConversations.find((c) => c.id === selectedConversation)
    : null;

  const selectedInsights = selectedConversation
    ? insights.filter((i) => i.conversationId === selectedConversation)
    : [];

  const stats = useMemo(() => {
    const total = conversations.length;
    const completed = conversations.filter(c => c.status === 'completed').length;
    const scheduled = conversations.filter(c => c.status === 'scheduled').length;
    const totalDuration = conversations
      .filter(c => c.duration)
      .reduce((sum, c) => sum + (c.duration || 0), 0);
    const avgDuration = totalDuration / conversations.filter(c => c.duration).length || 0;

    return { total, completed, scheduled, avgDuration };
  }, []);

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
        className="flex flex-wrap gap-2 items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Filter className="h-4 w-4" />
          </motion.div>
          Filters:
        </div>
        
        <motion.select
          value={typeFilter || ""}
          onChange={(e) => setTypeFilter(e.target.value || null)}
          className="border rounded px-2 py-1 text-sm transition-all hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          whileFocus={{ scale: 1.02 }}
        >
          <option value="">All Types</option>
          <option value="call">Call</option>
          <option value="email">Email</option>
          <option value="chat">Chat</option>
        </motion.select>

        <motion.select
          value={statusFilter || ""}
          onChange={(e) => setStatusFilter(e.target.value || null)}
          className="border rounded px-2 py-1 text-sm transition-all hover:border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
          whileFocus={{ scale: 1.02 }}
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="scheduled">Scheduled</option>
          <option value="cancelled">Cancelled</option>
        </motion.select>

        <motion.select
          value={sentimentFilter || ""}
          onChange={(e) => setSentimentFilter(e.target.value || null)}
          className="border rounded px-2 py-1 text-sm transition-all hover:border-purple-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          whileFocus={{ scale: 1.02 }}
        >
          <option value="">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </motion.select>

        <motion.select
          value={priorityFilter || ""}
          onChange={(e) => setPriorityFilter(e.target.value || null)}
          className="border rounded px-2 py-1 text-sm transition-all hover:border-orange-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          whileFocus={{ scale: 1.02 }}
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </motion.select>
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
          animate={{ scale: 1, color: "inherit" }}
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
        <DataTable
          columns={conversationColumns}
          data={filteredConversations}
          onRowClick={(row) => setSelectedConversation(row.id)}
        />
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
                    {selectedConv.participants.map((participant, idx) => (
                      <div key={idx} className="text-sm flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        {participant}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedConv.tags.map((tag) => (
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
                      {selectedInsights.map((insight) => (
                        <div key={insight.id} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{insight.category}</Badge>
                            {insight.topics?.map((topic) => (
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
  
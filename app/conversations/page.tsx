"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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

export default function ConversationsPage() {
  const searchParams = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.scheduled}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avgDuration)}m</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          Filters:
        </div>
        
        <select
          value={typeFilter || ""}
          onChange={(e) => setTypeFilter(e.target.value || null)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">All Types</option>
          <option value="call">Call</option>
          <option value="email">Email</option>
          <option value="chat">Chat</option>
        </select>

        <select
          value={statusFilter || ""}
          onChange={(e) => setStatusFilter(e.target.value || null)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="scheduled">Scheduled</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={sentimentFilter || ""}
          onChange={(e) => setSentimentFilter(e.target.value || null)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>

        <select
          value={priorityFilter || ""}
          onChange={(e) => setPriorityFilter(e.target.value || null)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

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
                onClick={filter.onRemove}
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

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredConversations.length} of {enrichedConversations.length} conversations
      </div>

      {/* Conversations Table */}
      <DataTable
        columns={conversationColumns}
        data={filteredConversations}
        onRowClick={(row) => setSelectedConversation(row.id)}
      />

      {/* Conversation Details Dialog */}
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
  
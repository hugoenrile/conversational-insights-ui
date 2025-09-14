"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { insights, conversations, customers } from "@/lib/mock-data";
import { DataTable } from "@/components/data-table";
import { columns as baseColumns } from "./columns";
import { CategoryFilter } from "./filters";
import { DateFilter } from "./date-filter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, TrendingUp, Users, Calendar, Target } from "lucide-react";

function highlight(text: string, terms: string[]) {
  if (!terms.length) return text;
  const regex = new RegExp(`(${terms.join("|")})`, "gi");
  return text.split(regex).map((part, idx) =>
    regex.test(part) ? (
      <mark key={idx} className="bg-yellow-200">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function InsightsPage() {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchTerms, setSearchTerms] = useState<string[]>([]);

  const enriched = useMemo(() => {
    return insights
      .map((insight) => {
        const conversation = conversations.find(
          (c) => c.id === insight.conversationId
        );
        const customer = customers.find(
          (c) => c.id === conversation?.customerId
        );
        return {
          ...insight,
          customerName: customer?.name ?? "Unknown",
          customerIndustry: customer?.industry ?? "Unknown",
          conversationType: conversation?.type ?? "-",
          conversationDate: conversation?.date ?? "-",
        };
      })
      .filter((i) => {
        if (category && i.category !== category) return false;
        if (startDate && new Date(i.conversationDate) < startDate) return false;
        if (endDate && new Date(i.conversationDate) > endDate) return false;
        if (searchTerms.length > 0) {
          const haystack = `${i.customerName} ${i.conversationType} ${i.category} ${i.text} ${i.topics?.join(
            " "
          )}`;
          const match = searchTerms.every((term) =>
            haystack.toLowerCase().includes(term.toLowerCase())
          );
          if (!match) return false;
        }
        return true;
      });
  }, [category, startDate, endDate, searchTerms]);

  const categories = [...new Set(insights.map((i) => i.category))];

  const stats = useMemo(() => {
    const totalInsights = insights.length;
    const uniqueCustomers = new Set(enriched.map(i => i.customerName)).size;
    const categoryCounts = insights.reduce((acc, insight) => {
      acc[insight.category] = (acc[insight.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topCategory = Object.entries(categoryCounts).reduce((a, b) => 
      categoryCounts[a[0]] > categoryCounts[b[0]] ? a : b
    )[0];
    const recentInsights = insights.filter(i => {
      const conv = conversations.find(c => c.id === i.conversationId);
      if (!conv) return false;
      const daysDiff = Math.floor((new Date().getTime() - new Date(conv.date).getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    }).length;

    return { totalInsights, uniqueCustomers, topCategory, recentInsights };
  }, [enriched]);

  const columns = useMemo(() => {
    const topicColumn = {
      accessorKey: "topics",
      header: "Topics",
      cell: ({ row }: any) => {
        const topics: string[] = row.getValue("topics") || [];
        return (
          <div className="flex flex-wrap gap-1">
            {topics.map((t: string, idx: number) => (
              <span
                key={`${row.id}_${idx}`}
                className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs cursor-pointer hover:bg-gray-200"
                onClick={() => {
                  if (!searchTerms.includes(t)) {
                    setSearchTerms([...searchTerms, t]);
                  }
                }}
              >
                {t}
              </span>
            ))}
          </div>
        );
      },
    };

    return [
      ...baseColumns
        .filter((col) => col.accessorKey !== "topics")
        .map((col) => {
          if (col.accessorKey === "text") {
            return {
              ...col,
              cell: ({ row }: any) =>
                highlight(row.getValue("text"), searchTerms),
            };
          }
          return col;
        }),
      topicColumn,
    ];
  }, [searchTerms]);

  const selectedInsights = useMemo(() => {
    if (!selectedConversationId) return [];
    return enriched.filter((i) => i.conversationId === selectedConversationId);
  }, [selectedConversationId, enriched]);

  const activeFilters = [
    category
      ? { label: `Category: ${category}`, onRemove: () => setCategory(null) }
      : null,
    startDate
      ? {
          label: `Start: ${startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}`,
          onRemove: () => setStartDate(undefined),
        }
      : null,
    endDate
      ? {
          label: `End: ${endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}`,
          onRemove: () => setEndDate(undefined),
        }
      : null,
    ...searchTerms.map((term) => ({
      label: term,
      onRemove: () => setSearchTerms(searchTerms.filter((t) => t !== term)),
    })),
  ].filter(Boolean);

  const activeFiltersCount = activeFilters.length;

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchInput.trim() !== "") {
      e.preventDefault();
      const term = searchInput.trim();
      if (!searchTerms.includes(term)) {
        setSearchTerms([...searchTerms, term]);
      }
      setSearchInput("");
    }
  };

  const clearAllFilters = () => {
    setCategory(null);
    setStartDate(undefined);
    setEndDate(undefined);
    setSearchTerms([]);
  };

  return (
    <div className="p-6 space-y-6 bg-background">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">💡 Insights</h1>
        <p className="text-muted-foreground">Discover valuable insights from your customer conversations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInsights}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.uniqueCustomers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Top Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-green-600">{stats.topCategory}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.recentInsights}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <CategoryFilter
          categories={categories}
          selected={category}
          onSelect={setCategory}
        />
        <DateFilter label="Start Date" date={startDate} setDate={setStartDate} />
        <DateFilter label="End Date" date={endDate} setDate={setEndDate} />
        <input
          type="text"
          placeholder="Type and press Enter..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="border rounded px-2 py-1 max-w-xs"
        />
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
          {/* Clear all button with badge */}
          <button
            onClick={clearAllFilters}
            className="ml-2 flex items-center gap-2 bg-red-100 text-red-700 px-2 py-0.5 rounded text-sm hover:bg-red-200"
          >
            Clear all
            <span className="bg-red-600 text-white rounded-full px-2 py-0.5 text-xs">
              {activeFiltersCount}
            </span>
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {enriched.length} insights
        {(category || startDate || endDate || searchTerms.length > 0) && 
          ` (filtered from ${insights.length} total)`
        }
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={enriched}
        onRowClick={(row) => setSelectedConversationId(row.conversationId)}
      />

      {/* Dialog */}
      <Dialog
        open={!!selectedConversationId}
        onOpenChange={() => setSelectedConversationId(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedInsights[0] && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  💡 Conversation Insights
                </DialogTitle>
                <DialogDescription>
                  Insights from conversation with {selectedInsights[0].customerName}
                </DialogDescription>
              </DialogHeader>

              {/* Customer and Conversation Info */}
              <div className="space-y-2 pb-4 border-b">
                <div>
                  <strong>Customer:</strong>{" "}
                  <a href="/customers" className="underline text-blue-600 hover:text-blue-800">
                    {selectedInsights[0].customerName}
                  </a>
                  <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    {selectedInsights[0].customerIndustry}
                  </span>
                </div>
                <div>
                  <strong>Conversation:</strong>{" "}
                  <a href="/conversations" className="underline text-blue-600 hover:text-blue-800">
                    {selectedInsights[0].conversationType} on{" "}
                    {new Date(selectedInsights[0].conversationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Found {selectedInsights.length} insight{selectedInsights.length !== 1 ? 's' : ''} from this conversation
                </div>
                
                {selectedInsights.map((insight) => {
                  const categoryColors = {
                    "Pain Point": "bg-red-100 text-red-800",
                    "Opportunity": "bg-green-100 text-green-800",
                    "Objection": "bg-orange-100 text-orange-800",
                    "Request": "bg-blue-100 text-blue-800",
                    "Issue": "bg-red-100 text-red-800",
                    "Success": "bg-emerald-100 text-emerald-800",
                    "Update": "bg-indigo-100 text-indigo-800",
                  };
                  const categoryEmojis = {
                    "Pain Point": "😣",
                    "Opportunity": "🚀",
                    "Objection": "🤔",
                    "Request": "📝",
                    "Issue": "⚠️",
                    "Success": "🎉",
                    "Update": "📊",
                  };
                  
                  return (
                    <div key={insight.id} className="p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryColors[insight.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'}`}>
                          <span>{categoryEmojis[insight.category as keyof typeof categoryEmojis] || '💡'}</span>
                          {insight.category}
                        </div>
                        {insight.topics?.map((t, idx) => (
                          <span
                            key={`${insight.id}_${idx}`}
                            className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs cursor-pointer hover:bg-blue-100 hover:text-blue-800 transition-colors"
                            onClick={() => {
                              if (!searchTerms.includes(t)) {
                                setSearchTerms([...searchTerms, t]);
                              }
                              setSelectedConversationId(null);
                            }}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm leading-relaxed">{highlight(insight.text, searchTerms)}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setSelectedConversationId(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

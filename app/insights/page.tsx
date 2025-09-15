"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { insights, conversations, customers } from "@/lib/mock-data";
import { CelebrationAnimation, useSuccessAnimation } from "@/components/celebration-animation";
import { NoResultsFound } from "@/components/empty-state";
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

export default function InsightsPage() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { shouldCelebrate, celebrate, reset } = useSuccessAnimation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (searchInput) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 500);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [searchInput]);

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
        celebrate();
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

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border hover:shadow-lg transition-all bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <TrendingUp className="h-4 w-4" />
                </motion.div>
                Total Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {mounted ? <AnimatedNumber value={stats.totalInsights} duration={1500} /> : stats.totalInsights}
              </div>
              <p className="text-xs text-muted-foreground mt-1">💡 Discoveries made</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Users className="h-4 w-4" />
                </motion.div>
                Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {mounted ? <AnimatedNumber value={stats.uniqueCustomers} duration={1800} /> : stats.uniqueCustomers}
              </div>
              <p className="text-xs text-muted-foreground mt-1">👥 Unique customers</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border hover:shadow-lg transition-all bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 15, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Target className="h-4 w-4" />
                </motion.div>
                Top Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-sm font-bold text-green-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                🎯 {stats.topCategory}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1">Most frequent type</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border hover:shadow-lg transition-all bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-950/50 dark:to-pink-950/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Calendar className="h-4 w-4" />
                </motion.div>
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {mounted ? <AnimatedNumber value={stats.recentInsights} duration={2000} /> : stats.recentInsights}
              </div>
              <p className="text-xs text-muted-foreground mt-1">📅 Recent insights</p>
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
        <CategoryFilter
          categories={categories}
          selected={category}
          onSelect={setCategory}
        />
        <DateFilter label="Start Date" date={startDate} setDate={setStartDate} />
        <DateFilter label="End Date" date={endDate} setDate={setEndDate} />
        <motion.div className="relative max-w-xs">
          <motion.input
            type="text"
            placeholder="🔍 Type and press Enter..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="border rounded-lg px-3 py-2 w-full transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg"
            whileFocus={{ 
              scale: 1.02,
              boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
            }}
            initial={{ width: 200 }}
            animate={{ 
              width: searchInput ? 280 : 200,
              borderColor: searchInput ? "#3b82f6" : "#d1d5db"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
          <AnimatePresence>
            {isTyping && (
              <motion.div
                className="absolute right-8 top-1/2 transform -translate-y-1/2 flex space-x-1"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 bg-blue-500 rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            )}
            {searchInput && !isTyping && (
              <motion.div
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.button
                  onClick={() => setSearchInput("")}
                  className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {activeFilters.length > 0 && (
          <motion.div 
            className="flex flex-wrap gap-2 items-center"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeFilters.map((filter, idx) => (
              <motion.span
                key={idx}
                className="flex items-center gap-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1 rounded-full text-sm border border-blue-200 shadow-sm"
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.8, 
                  y: -10,
                  rotateX: 90
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  delay: idx * 0.05 
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)"
                }}
                layout
              >
                {filter?.label}
                <motion.button
                  onClick={filter?.onRemove}
                  className="text-blue-600 hover:text-blue-900"
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={14} />
                </motion.button>
              </motion.span>
            ))}
            <motion.button
              onClick={clearAllFilters}
              className="ml-2 flex items-center gap-2 bg-red-100 text-red-700 px-2 py-0.5 rounded text-sm hover:bg-red-200"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: activeFilters.length * 0.05 + 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear all
              <motion.span 
                className="bg-red-600 text-white rounded-full px-2 py-0.5 text-xs"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {activeFiltersCount}
              </motion.span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Showing <motion.span
          key={enriched.length}
          initial={{ scale: 1.2, color: "#3b82f6" }}
          animate={{ scale: 1, color: "inherit" }}
          transition={{ duration: 0.3 }}
        >
          {enriched.length}
        </motion.span> insights
        {(category || startDate || endDate || searchTerms.length > 0) && 
          ` (filtered from ${insights.length} total)`
        }
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        {enriched.length > 0 ? (
          <DataTable
            columns={columns}
            data={enriched}
            onRowClick={(row) => setSelectedConversationId(row.conversationId)}
          />
        ) : (
          <NoResultsFound 
            searchTerm={searchTerms.join(", ") || "your filters"}
            onClear={() => {
              setSearchTerms([]);
              setSearchInput("");
              setCategory(null);
              setStartDate(undefined);
              setEndDate(undefined);
            }}
          />
        )}
      </motion.div>

      <CelebrationAnimation 
        trigger={shouldCelebrate} 
        onComplete={reset}
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

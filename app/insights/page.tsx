"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useInsights, useInsightCategories, useInsightTopics } from "@/hooks/use-supabase-data";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { X, TrendingUp, Users, Calendar, Target, MessageSquare, Phone, Mail, Video, Lightbulb, ArrowRight, ChevronDown, Tag } from "lucide-react";

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

  // Memoize filters to prevent unnecessary re-renders
  const insightFilters = useMemo(() => ({
    category: category || undefined,
    // Use searchTerms for OR logic when we have multiple terms, otherwise use regular search
    ...(searchTerms.length > 1 
      ? { searchTerms: searchTerms }
      : { search: searchTerms.length === 1 ? searchTerms[0] : undefined }
    ),
    dateFrom: startDate?.toISOString(),
    dateTo: endDate?.toISOString()
  }), [category, searchTerms, startDate, endDate]);

  // Supabase data hooks
  const { data: insightsData, loading: insightsLoading, error: insightsError } = useInsights(insightFilters);
  
  const { data: categoriesData } = useInsightCategories();
  const { data: topicsData } = useInsightTopics();

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
    if (!insightsData) return [];
    
    return insightsData.map((insight: any) => ({
      id: insight.id,
      conversationId: insight.conversation_id,
      text: insight.text,
      category: insight.category,
      topics: insight.topics || [],
      customerName: insight.customer?.name || "Unknown",
      customerIndustry: insight.customer?.industry || "Unknown",
      conversationType: insight.conversation?.type || "-",
      conversationDate: insight.conversation?.created_at ? 
        new Date(insight.conversation.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'numeric', 
          day: 'numeric' 
        }) : "-",
      urgency_score: insight.urgency_score,
      confidence_score: insight.confidence_score,
      sentiment_score: insight.sentiment_score,
      potential_revenue: insight.potential_revenue,
      created_at: insight.created_at
    }));
  }, [insightsData]);

  const categories = useMemo(() => {
    if (!categoriesData) return [];
    return categoriesData.map((cat: any) => cat.category);
  }, [categoriesData]);

  const stats = useMemo(() => {
    if (!insightsData) return { totalInsights: 0, uniqueCustomers: 0, topCategory: 'N/A', recentInsights: 0 };
    
    const totalInsights = insightsData.length;
    const uniqueCustomers = new Set(insightsData.map((i: any) => i.customer?.name)).size;
    
    const categoryCounts = insightsData.reduce((acc: any, insight: any) => {
      if (insight.category) {
        acc[insight.category] = (acc[insight.category] || 0) + 1;
      }
      return acc;
    }, {});
    
    const topCategoryRaw = Object.keys(categoryCounts).length > 0 
      ? Object.entries(categoryCounts).reduce((a: any, b: any) => 
          categoryCounts[a[0]] > categoryCounts[b[0]] ? a : b
        )[0]
      : 'N/A';
    
    const topCategory = topCategoryRaw === 'N/A' 
      ? 'N/A' 
      : topCategoryRaw?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'N/A';
    
    const recentInsights = insightsData.filter((i: any) => {
      if (!i.created_at) return false;
      const daysDiff = Math.floor((new Date().getTime() - new Date(i.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    }).length;

    return { totalInsights, uniqueCustomers, topCategory, recentInsights };
  }, [insightsData]);

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
        .filter((col) => "accessorKey" in col && col.accessorKey !== "topics")
        .map((col) => {
          if ("accessorKey" in col && col.accessorKey === "text") {
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
      ? { label: `Category: ${category.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}`, onRemove: () => setCategory(null) }
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


  if (insightsError) {
    return (
      <div className="p-6 space-y-6 bg-background">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">💡 Insights</h1>
          <p className="text-muted-foreground">Unable to load insights</p>
        </div>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <span>⚠️</span>
              <span>Failed to load insights data</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        animate={{ 
          opacity: insightsLoading ? 0.7 : 1, 
          y: 0 
        }}
        transition={{ duration: 0.3 }}
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
          animate={{ scale: 1, color: "#64748b" }}
          transition={{ duration: 0.3 }}
        >
          {enriched.length}
        </motion.span> insights
        {(category || startDate || endDate || searchTerms.length > 0) && 
          ` (filtered from ${stats.totalInsights} total)`
        }
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        {enriched.length > 0 ? (
          <Card className="border hover:shadow-md transition-shadow relative">
            {insightsLoading && (
              <div className="absolute inset-0 bg-white/60 dark:bg-black/60 rounded-lg flex items-center justify-center z-10">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-muted-foreground">Updating insights...</span>
                </div>
              </div>
            )}
            <CardContent className="p-0">
              <div className="overflow-x-auto">
      <DataTable
        columns={columns}
        data={enriched}
        onRowClick={(row) => setSelectedConversationId(row.conversationId)}
                />
              </div>
            </CardContent>
          </Card>
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
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              {selectedInsights[0] && (
                <>
              <DialogHeader className="pb-6">
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    💡
                  </div>
                  Conversation Analysis
                </DialogTitle>
                <DialogDescription className="text-base">
                  Deep insights from your conversation with {selectedInsights[0].customerName}
            </DialogDescription>
          </DialogHeader>

              {/* Customer & Conversation Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Customer Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{selectedInsights[0].customerName}</span>
                      <Badge variant="secondary">{selectedInsights[0].customerIndustry}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Industry leader in {selectedInsights[0].customerIndustry?.toLowerCase()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Conversation Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      {selectedInsights[0].conversationType === 'call' && <Phone className="h-4 w-4 text-green-600" />}
                      {selectedInsights[0].conversationType === 'email' && <Mail className="h-4 w-4 text-blue-600" />}
                      {selectedInsights[0].conversationType === 'chat' && <MessageSquare className="h-4 w-4 text-purple-600" />}
                      {selectedInsights[0].conversationType === 'meeting' && <Video className="h-4 w-4 text-orange-600" />}
                      <span className="font-medium capitalize">{selectedInsights[0].conversationType}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(selectedInsights[0].conversationDate).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Insights Summary */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{selectedInsights.length}</div>
                      <div className="text-sm text-muted-foreground">Insights Found</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedInsights.some(i => i.confidence_score !== null && i.confidence_score !== undefined) 
                          ? Math.round(selectedInsights
                              .filter(i => i.confidence_score !== null && i.confidence_score !== undefined)
                              .reduce((acc, insight) => acc + insight.confidence_score, 0) / 
                              selectedInsights.filter(i => i.confidence_score !== null && i.confidence_score !== undefined).length * 100) + '%'
                          : 'N/A'
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Confidence</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedInsights.some(i => i.urgency_score !== null && i.urgency_score !== undefined)
                          ? Math.round(selectedInsights
                              .filter(i => i.urgency_score !== null && i.urgency_score !== undefined)
                              .reduce((acc, insight) => acc + insight.urgency_score, 0) / 
                              selectedInsights.filter(i => i.urgency_score !== null && i.urgency_score !== undefined).length)
                          : 'N/A'
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Urgency</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Insights */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Detailed Insights
                </h3>
                
                {selectedInsights.map((insight, index) => {
                  const categoryColors = {
                    "pain_point": "bg-red-100 text-red-800 border-red-200",
                    "opportunity": "bg-green-100 text-green-800 border-green-200",
                    "objection": "bg-orange-100 text-orange-800 border-orange-200",
                    "request": "bg-blue-100 text-blue-800 border-blue-200",
                    "issue": "bg-red-100 text-red-800 border-red-200",
                    "success": "bg-emerald-100 text-emerald-800 border-emerald-200",
                    "update": "bg-indigo-100 text-indigo-800 border-indigo-200",
                  };
                  
                  const categoryEmojis = {
                    "pain_point": "😣",
                    "opportunity": "🚀",
                    "objection": "🤔",
                    "request": "📝",
                    "issue": "⚠️",
                    "success": "🎉",
                    "update": "📊",
                  };

                  const displayCategory = insight.category?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown';
                  
                  return (
                    <Card key={insight.id} className={`border-l-4 ${categoryColors[insight.category as keyof typeof categoryColors]?.split(' ')[2] || 'border-gray-200'}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{categoryEmojis[insight.category as keyof typeof categoryEmojis] || '💡'}</span>
                            <span className="font-semibold">{displayCategory}</span>
                            <Badge variant="outline" className="text-xs">
                              #{index + 1}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {insight.confidence_score !== null && insight.confidence_score !== undefined && (
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(insight.confidence_score * 100)}% confidence
                              </Badge>
                            )}
                            {insight.urgency_score !== null && insight.urgency_score !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                Urgency: {insight.urgency_score}/10
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm leading-relaxed bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-gray-900 dark:text-gray-100">
                          {highlight(insight.text, searchTerms)}
                        </p>
                        
                        {insight.topics && insight.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs text-muted-foreground mr-2">Topics:</span>
                            {insight.topics.map((topic: string, idx: number) => (
                              <Badge
                      key={`${insight.id}_${idx}`}
                                variant="secondary"
                                className="text-xs cursor-pointer hover:bg-blue-100 hover:text-blue-800 transition-colors"
                      onClick={() => {
                                  if (!searchTerms.includes(topic)) {
                                    setSearchTerms([...searchTerms, topic]);
                        }
                                  setSelectedConversationId(null);
                      }}
                    >
                                #{topic}
                              </Badge>
                  ))}
                </div>
                        )}

                        {insight.potential_revenue && insight.potential_revenue > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Target className="h-4 w-4 text-green-600" />
                            <span className="text-muted-foreground">Potential Revenue:</span>
                            <span className="font-semibold text-green-600">
                              ${insight.potential_revenue.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Action Items */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <ArrowRight className="h-5 w-5 text-purple-600" />
                    Recommended Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedInsights.some(i => i.category === 'opportunity') && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-800 dark:text-green-200">Follow up on identified opportunities within 24 hours</span>
                      </div>
                    )}
                    {selectedInsights.some(i => i.category === 'issue' || i.category === 'pain_point') && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-red-800 dark:text-red-200">Address customer concerns and pain points immediately</span>
                      </div>
                    )}
                    {selectedInsights.some(i => i.category === 'request') && (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-blue-800 dark:text-blue-200">Process customer requests and provide timeline</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span className="text-sm text-gray-800 dark:text-gray-200">Schedule follow-up conversation to track progress</span>
                    </div>
          </div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Analysis completed • {selectedInsights.length} insights processed
                </div>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Find Related
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => {
                        // Find insights from same customer
                        const customerName = selectedInsights[0]?.customerName;
                        if (customerName && customerName !== "Unknown") {
                          setSearchInput(customerName);
                          setSearchTerms([customerName]);
                        }
                        setSelectedConversationId(null);
                      }}>
                        <Users className="h-4 w-4 mr-2" />
                        Same Customer Insights
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={() => {
                        // Find insights with same categories
                        const categories = [...new Set(selectedInsights.map(i => i.category).filter(Boolean))];
                        if (categories.length > 0) {
                          // Set category filter instead of search terms
                          const firstCategory = categories[0];
                          setCategory(firstCategory);
                          setSearchTerms([]);
                          setSearchInput('');
                        }
                        setSelectedConversationId(null);
                      }}>
                        <Tag className="h-4 w-4 mr-2" />
                        Same Category ({selectedInsights[0]?.category?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())})
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={() => {
                        // Find insights with any overlapping topics (OR logic)
                        const allTopics = selectedInsights.flatMap(i => i.topics || []);
                        const uniqueTopics = [...new Set(allTopics)];
                        if (uniqueTopics.length > 0) {
                          // Use only 1-2 most relevant topics for much broader search
                          const topTopics = uniqueTopics.slice(0, Math.min(2, uniqueTopics.length));
                          // Clear regular search and use OR logic for topics
                          setSearchInput('');
                          setSearchTerms(topTopics); // This will use OR logic in the service
                        }
                        setSelectedConversationId(null);
                      }}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Similar Topics (Any Match)
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={() => {
                        // Find insights from same conversation type
                        const conversationType = selectedInsights[0]?.conversationType;
                        if (conversationType && conversationType !== "-") {
                          // Search for insights from same conversation type (call, email, chat, meeting)
                          setSearchInput(conversationType);
                          setSearchTerms([conversationType]);
                        }
                        setSelectedConversationId(null);
                      }}>
                        {selectedInsights[0]?.conversationType === 'call' && <Phone className="h-4 w-4 mr-2" />}
                        {selectedInsights[0]?.conversationType === 'email' && <Mail className="h-4 w-4 mr-2" />}
                        {selectedInsights[0]?.conversationType === 'chat' && <MessageSquare className="h-4 w-4 mr-2" />}
                        {selectedInsights[0]?.conversationType === 'meeting' && <Video className="h-4 w-4 mr-2" />}
                        {(!selectedInsights[0]?.conversationType || selectedInsights[0]?.conversationType === "-") && <MessageSquare className="h-4 w-4 mr-2" />}
                        Same Conversation Type ({selectedInsights[0]?.conversationType?.charAt(0).toUpperCase() + selectedInsights[0]?.conversationType?.slice(1) || 'Unknown'})
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem onClick={() => {
                        // Clear all filters to see everything
                        setSearchTerms([]);
                        setSearchInput('');
                        setCategory(null);
                        setSelectedConversationId(null);
                      }}>
                        <X className="h-4 w-4 mr-2" />
                        Clear All Filters
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
            <Button onClick={() => setSelectedConversationId(null)}>
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

"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { SkeletonStats, SkeletonTable } from "@/components/ui/skeleton";
import { DataTable } from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { conversations, customers, insights } from "@/lib/mock-data";
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Lightbulb,
  TrendingUp,
  Users,
  Target,
  ArrowRight
} from "lucide-react";

export const dashboardColumns = [
  { 
    accessorKey: "customerName", 
    header: "Customer",
    cell: ({ row }: any) => (
      <div>
        <div className="font-medium">{row.getValue("customerName")}</div>
        <div className="text-sm text-muted-foreground">{row.original.customerIndustry}</div>
      </div>
    ),
  },
  { 
    accessorKey: "conversationType", 
    header: "Type",
    cell: ({ row }: any) => {
      const type = row.getValue("conversationType") as string;
      const icons = {
        call: <Phone className="h-3 w-3" />,
        email: <Mail className="h-3 w-3" />,
        chat: <MessageSquare className="h-3 w-3" />,
      };
      const colors = {
        call: "bg-green-100 text-green-800",
        email: "bg-blue-100 text-blue-800", 
        chat: "bg-purple-100 text-purple-800",
      };
      return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
          {icons[type as keyof typeof icons]}
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </div>
      );
    },
  },
  { 
    accessorKey: "date", 
    header: "Date",
    cell: ({ row }: any) => {
      const dateString = row.getValue("date") as string;
      return (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{dateString}</span>
        </div>
      );
    },
  },
  { 
    accessorKey: "category", 
    header: "Category",
    cell: ({ row }: any) => {
      const category = row.getValue("category") as string;
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
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryColors[category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'}`}>
          <span>{categoryEmojis[category as keyof typeof categoryEmojis] || '💡'}</span>
          {category}
        </div>
      );
    },
  },
  { 
    accessorKey: "text", 
    header: "Insight",
    cell: ({ row }: any) => (
      <div className="max-w-sm">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm leading-relaxed truncate">{row.getValue("text")}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "topics",
    header: "Topics",
    cell: ({ row }: any) => {
      const topics = row.getValue("topics") as string[] | undefined;
      return (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {topics?.slice(0, 2).map((t: string, idx: number) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {t}
            </Badge>
          ))}
          {topics && topics.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{topics.length - 2}
            </Badge>
          )}
        </div>
      );
    },
  },
];

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

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    setIsLoading(false);
    const lastDashboardVisit = sessionStorage.getItem('last-dashboard-visit');
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (!lastDashboardVisit || (now - parseInt(lastDashboardVisit)) > fiveMinutes) {
      toast.success("📊 Welcome back!", {
        description: "Your dashboard is ready",
        duration: 2000,
      });
      sessionStorage.setItem('last-dashboard-visit', now.toString());
    }
  }, []);

  const totalInsights = insights.length;
  const totalCustomers = useMemo(() => new Set(conversations.map((c) => c.customerId)).size, []);
  const totalCalls = useMemo(() => conversations.filter((c) => c.type === "call").length, []);

  const recentInsights = useMemo(() => {
    return [...insights]
      .slice(-5)
      .reverse()
      .map((insight) => {
        const conversation = conversations.find((c) => c.id === insight.conversationId);
        const customer = conversation
          ? customers.find((cust) => cust.id === conversation.customerId)
          : null;
        return {
          ...insight,
          conversationType: conversation?.type || "",
          date: conversation?.date || "",
          customerName: customer?.name || "",
          customerIndustry: customer?.industry || "",
        };
      });
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    insights.forEach((i) => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });
    return counts;
  }, []);

  const maxCount = Math.max(...Object.values(categoryCounts));

  if (isLoading) {
    return (
      <div className="p-6 space-y-8 bg-background">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">📊 Dashboard</h1>
          <p className="text-muted-foreground">Loading your conversational insights...</p>
        </div>
        <SkeletonStats />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-64 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <SkeletonTable rows={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-background">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">📊 Dashboard</h1>
        <p className="text-muted-foreground">Your conversational insights at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card 
            className="border hover:shadow-lg transition-all cursor-pointer hover:scale-105 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50"
            onClick={() => {
              router.push("/insights");
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <TrendingUp className="h-4 w-4" />
                </motion.div>
                Total Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {mounted ? <AnimatedNumber value={totalInsights} duration={1500} /> : totalInsights}
              </div>
              <p className="text-xs text-muted-foreground mt-1">💡 Actionable insights discovered</p>
              <motion.p 
                className="text-xs text-blue-600 mt-2 font-medium"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Click to explore →
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card 
            className="border hover:shadow-lg transition-all cursor-pointer hover:scale-105 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50"
            onClick={() => {
              router.push("/customers?status=active");
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                >
                  <Users className="h-4 w-4" />
                </motion.div>
                Active Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mounted ? <AnimatedNumber value={totalCustomers} duration={1800} /> : totalCustomers}
              </div>
              <p className="text-xs text-muted-foreground mt-1">👥 Customers engaged</p>
              <motion.p 
                className="text-xs text-green-600 mt-2 font-medium"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Click to view →
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card 
            className="border hover:shadow-lg transition-all cursor-pointer hover:scale-105 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50"
            onClick={() => {
              router.push("/conversations?type=call");
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 8, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                >
                  <Phone className="h-4 w-4" />
                </motion.div>
                Total Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {mounted ? <AnimatedNumber value={totalCalls} duration={2000} /> : totalCalls}
              </div>
              <p className="text-xs text-muted-foreground mt-1">📞 Voice conversations</p>
              <motion.p 
                className="text-xs text-purple-600 mt-2 font-medium"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Click to filter →
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <motion.span
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                💡
              </motion.span>
              Recent Insights
            </h2>
            <p className="text-sm text-muted-foreground">Latest discoveries from your conversations</p>
          </div>
          <motion.div 
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Showing {recentInsights.length} of {totalInsights} insights
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <Card className="border hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
            <DataTable
              columns={dashboardColumns}
              data={recentInsights}
              onRowClick={() => router.push("/insights")}
              showPagination={false}
            />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          className="flex justify-end mt-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
        >
          <motion.button
            onClick={() => router.push("/insights")}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View All Insights 
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowRight className="h-4 w-4" />
            </motion.div>
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <div className="mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <motion.span
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              📊
            </motion.span>
            Insights by Category
          </h2>
          <p className="text-sm text-muted-foreground">Distribution of insight types across conversations</p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.2 }}
        >
          <Card className="border hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                {Object.entries(categoryCounts).map(([category, count], index) => {
                  const widthPercent = (count / maxCount) * 100;
                  const categoryColors = {
                    "Pain Point": "bg-red-500",
                    "Opportunity": "bg-green-500",
                    "Objection": "bg-orange-500",
                    "Request": "bg-blue-500",
                    "Issue": "bg-red-500",
                    "Success": "bg-emerald-500",
                    "Update": "bg-indigo-500",
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
                    <motion.div 
                      key={category} 
                      className="flex items-center gap-3 group hover:bg-muted/50 p-2 rounded-lg transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 1.4 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-2 w-40">
                        <motion.span 
                          className="text-lg"
                          whileHover={{ scale: 1.3, rotate: 10 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {categoryEmojis[category as keyof typeof categoryEmojis] || '💡'}
                        </motion.span>
                        <span className="text-sm font-medium text-foreground">{category}</span>
                      </div>
                      <div className="bg-muted h-3 rounded-full flex-1 min-w-0 overflow-hidden">
                        <motion.div
                          className={`h-3 rounded-full ${categoryColors[category as keyof typeof categoryColors] || 'bg-muted-foreground'}`}
                          initial={{ width: 0, opacity: 0.7 }}
                          animate={{ 
                            width: mounted ? `${widthPercent}%` : 0,
                            opacity: 1
                          }}
                          transition={{ 
                            duration: 1.2, 
                            delay: 1.6 + index * 0.15,
                            ease: "easeOut"
                          }}
                          whileHover={{ 
                            filter: "brightness(1.1)",
                            boxShadow: "0 0 10px rgba(0,0,0,0.2)"
                          }}
                        />
                      </div>
                      <motion.div 
                        className="w-12 text-right"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.8 + index * 0.15 }}
                      >
                        <span className="text-sm font-bold text-foreground group-hover:text-blue-600 transition-colors">
                          {mounted ? <AnimatedNumber value={count} duration={800} /> : count}
                        </span>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
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

export default function DashboardPage() {
  const router = useRouter();

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

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">📊 Dashboard</h1>
        <p className="text-muted-foreground">Your conversational insights at a glance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card 
          className="border hover:shadow-md transition-all cursor-pointer hover:scale-105"
          onClick={() => router.push("/insights")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalInsights}</div>
            <p className="text-xs text-muted-foreground mt-1">💡 Actionable insights discovered</p>
            <p className="text-xs text-blue-600 mt-2 font-medium">Click to explore →</p>
          </CardContent>
        </Card>

        <Card 
          className="border hover:shadow-md transition-all cursor-pointer hover:scale-105"
          onClick={() => router.push("/customers?status=active")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">👥 Customers engaged</p>
            <p className="text-xs text-green-600 mt-2 font-medium">Click to view →</p>
          </CardContent>
        </Card>

        <Card 
          className="border hover:shadow-md transition-all cursor-pointer hover:scale-105"
          onClick={() => router.push("/conversations?type=call")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Total Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalCalls}</div>
            <p className="text-xs text-muted-foreground mt-1">📞 Voice conversations</p>
            <p className="text-xs text-purple-600 mt-2 font-medium">Click to filter →</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Insights Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              💡 Recent Insights
            </h2>
            <p className="text-sm text-muted-foreground">Latest discoveries from your conversations</p>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {recentInsights.length} of {totalInsights} insights
          </div>
        </div>
        
        <Card className="border">
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

        {/* Enhanced "See All Insights" link */}
        <div className="flex justify-end mt-4">
          <button
            onClick={() => router.push("/insights")}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            View All Insights 
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Insights by Category */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            📊 Insights by Category
          </h2>
          <p className="text-sm text-muted-foreground">Distribution of insight types across conversations</p>
        </div>
        
        <Card className="border">
          <CardContent className="p-6">
            <div className="space-y-4">
              {Object.entries(categoryCounts).map(([category, count]) => {
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
                  <div key={category} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 w-40">
                      <span className="text-lg">{categoryEmojis[category as keyof typeof categoryEmojis] || '💡'}</span>
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                    </div>
                    <div className="bg-gray-100 h-3 rounded-full flex-1 min-w-0">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${categoryColors[category as keyof typeof categoryColors] || 'bg-gray-500'}`}
                        style={{ width: `${widthPercent}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-right">
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

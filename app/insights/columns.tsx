"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Insight } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MessageSquare, Calendar, Lightbulb } from "lucide-react";

export const columns: ColumnDef<
  Insight & {
    customerName: string;
    conversationType: string;
    conversationDate: string;
    customerIndustry: string;
  }
>[] = [
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue("customerName")}</div>
        <div className="text-sm text-muted-foreground">{row.original.customerIndustry}</div>
      </div>
    ),
  },
  {
    accessorKey: "conversationType",
    header: "Conversation",
    cell: ({ row }) => {
      const type = row.getValue("conversationType") as string;
      const icons = {
        call: <Phone className="h-4 w-4" />,
        email: <Mail className="h-4 w-4" />,
        chat: <MessageSquare className="h-4 w-4" />,
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
    accessorKey: "conversationDate",
    header: "Date",
    cell: ({ row }) => {
      const dateString = row.getValue("conversationDate") as string;
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'numeric', 
        day: 'numeric' 
      });
      const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      return (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <div>
            <div className="font-medium text-sm">{formattedDate}</div>
            <div className="text-xs text-muted-foreground">{weekday}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
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
    accessorKey: "topics",
    header: "Topics",
    cell: ({ row }) => {
      const topics = row.getValue("topics") as string[] | undefined;
      return (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {topics?.slice(0, 2).map((t) => (
            <Badge key={t} variant="secondary" className="text-xs">
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
  {
    accessorKey: "text",
    header: "Insight",
    cell: ({ row }) => (
      <div className="max-w-md">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm leading-relaxed">{row.getValue("text")}</span>
        </div>
      </div>
    ),
  },
];

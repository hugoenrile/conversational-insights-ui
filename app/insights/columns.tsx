"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Insight } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MessageSquare, Video, Calendar, Lightbulb } from "lucide-react";

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
        call: <Phone className="h-3 w-3" />,
        email: <Mail className="h-3 w-3" />,
        chat: <MessageSquare className="h-3 w-3" />,
        meeting: <Video className="h-3 w-3" />,
      };
      const colors = {
        call: "bg-green-100 text-green-800",
        email: "bg-blue-100 text-blue-800", 
        chat: "bg-purple-100 text-purple-800",
        meeting: "bg-orange-100 text-orange-800",
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
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      
      const categoryColors = {
        "pain_point": "bg-red-100 text-red-800",
        "opportunity": "bg-green-100 text-green-800",
        "objection": "bg-orange-100 text-orange-800",
        "request": "bg-blue-100 text-blue-800",
        "issue": "bg-red-100 text-red-800",
        "success": "bg-emerald-100 text-emerald-800",
        "update": "bg-indigo-100 text-indigo-800",
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
      
      const displayCategory = category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
      
      return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryColors[category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'}`}>
          <span>{categoryEmojis[category as keyof typeof categoryEmojis] || '💡'}</span>
          {displayCategory}
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

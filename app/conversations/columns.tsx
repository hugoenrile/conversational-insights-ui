"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Conversation } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MessageSquare, Clock, Users } from "lucide-react";

export const conversationColumns: ColumnDef<
  Conversation & {
    customerName: string;
    customerIndustry: string;
    insightCount: number;
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
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
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
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[type as keyof typeof colors]}`}>
          {icons[type as keyof typeof icons]}
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const dateString = row.getValue("date") as string;
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'numeric', 
        day: 'numeric' 
      });
      const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      return (
        <div>
          <div className="font-medium">{formattedDate}</div>
          <div className="text-sm text-muted-foreground">{weekday}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => (
      <div className="max-w-xs">
        <div className="font-medium truncate">{row.getValue("subject")}</div>
        <div className="text-sm text-muted-foreground truncate">{row.original.summary}</div>
      </div>
    ),
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const duration = row.getValue("duration") as number | undefined;
      if (!duration || duration === 0) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="flex items-center gap-1 text-sm">
          <Clock className="h-3 w-3" />
          {duration}m
        </div>
      );
    },
  },
  {
    accessorKey: "participants",
    header: "Participants",
    cell: ({ row }) => {
      const participants = row.getValue("participants") as string[];
      return (
        <div className="flex items-center gap-1 text-sm">
          <Users className="h-3 w-3" />
          {participants.length}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const colors = {
        completed: "bg-green-100 text-green-800",
        scheduled: "bg-yellow-100 text-yellow-800",
        cancelled: "bg-red-100 text-red-800",
      };
      return (
        <Badge variant="secondary" className={colors[status as keyof typeof colors]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "sentiment",
    header: "Sentiment",
    cell: ({ row }) => {
      const sentiment = row.getValue("sentiment") as string;
      const colors = {
        positive: "bg-green-100 text-green-800",
        neutral: "bg-gray-100 text-gray-800",
        negative: "bg-red-100 text-red-800",
      };
      const emojis = {
        positive: "😊",
        neutral: "😐",
        negative: "😞",
      };
      return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[sentiment as keyof typeof colors]}`}>
          <span>{emojis[sentiment as keyof typeof emojis]}</span>
          {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
        </div>
      );
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;
      const colors = {
        high: "bg-red-100 text-red-800",
        medium: "bg-yellow-100 text-yellow-800",
        low: "bg-green-100 text-green-800",
      };
      return (
        <Badge variant="secondary" className={colors[priority as keyof typeof colors]}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "insightCount",
    header: "Insights",
    cell: ({ row }) => {
      const count = row.getValue("insightCount") as number;
      return (
        <div className="text-center">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            {count}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.getValue("tags") as string[];
      return (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{tags.length - 2}
            </Badge>
          )}
        </div>
      );
    },
  },
];

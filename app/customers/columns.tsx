"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Calendar,
  DollarSign,
  Heart,
  Users,
  Crown,
  Tag,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";

export const customerColumns: ColumnDef<
  Customer & {
    conversationCount: number;
    insightCount: number;
    lastConversationType?: string;
  }
>[] = [
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original;
      const sizeIcons = {
        startup: "🚀",
        small: "🏢",
        medium: "🏬",
        large: "🏭",
        enterprise: "🏛️"
      };
      
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{customer.name}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <span>{sizeIcons[customer.size]}</span>
                {customer.industry} • {customer.size}
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "contactPerson",
    header: "Contact",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="space-y-1">
          <div className="font-medium">{customer.contactPerson}</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <a href={`mailto:${customer.email}`} className="hover:text-blue-600">
                {customer.email}
              </a>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <a href={`tel:${customer.phone}`} className="hover:text-blue-600">
                  {customer.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusConfig = {
        active: { 
          color: "bg-green-100 text-green-800", 
          icon: <CheckCircle className="h-3 w-3" />,
          emoji: "✅"
        },
        inactive: { 
          color: "bg-gray-100 text-gray-800", 
          icon: <XCircle className="h-3 w-3" />,
          emoji: "⏸️"
        },
        prospect: { 
          color: "bg-blue-100 text-blue-800", 
          icon: <TrendingUp className="h-3 w-3" />,
          emoji: "🎯"
        },
        churned: { 
          color: "bg-red-100 text-red-800", 
          icon: <XCircle className="h-3 w-3" />,
          emoji: "❌"
        },
      };
      
      const config = statusConfig[status as keyof typeof statusConfig];
      
      return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
          <span>{config.emoji}</span>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      );
    },
  },
  {
    accessorKey: "tier",
    header: "Plan",
    cell: ({ row }) => {
      const tier = row.getValue("tier") as string;
      const tierConfig = {
        free: { color: "bg-gray-100 text-gray-800", emoji: "🆓" },
        basic: { color: "bg-blue-100 text-blue-800", emoji: "📦" },
        pro: { color: "bg-purple-100 text-purple-800", emoji: "⭐" },
        enterprise: { color: "bg-yellow-100 text-yellow-800", emoji: "👑" },
      };
      
      const config = tierConfig[tier as keyof typeof tierConfig];
      
      return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
          <span>{config.emoji}</span>
          {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </div>
      );
    },
  },
  {
    accessorKey: "health_score",
    header: "Health",
    cell: ({ row }) => {
      const healthScore = row.getValue("health_score") as number;
      
      let health: string;
      let config: { color: string; emoji: string };
      
      if (healthScore >= 80) {
        health = "excellent";
        config = { color: "bg-emerald-100 text-emerald-800", emoji: "💚" };
      } else if (healthScore >= 60) {
        health = "good";
        config = { color: "bg-green-100 text-green-800", emoji: "💛" };
      } else if (healthScore >= 40) {
        health = "at-risk";
        config = { color: "bg-orange-100 text-orange-800", emoji: "🧡" };
      } else {
        health = "critical";
        config = { color: "bg-red-100 text-red-800", emoji: "❤️" };
      }
      
      return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
          <span>{config.emoji}</span>
          <span className="font-medium">{healthScore}%</span>
          <span className="text-xs opacity-75">({health})</span>
        </div>
      );
    },
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) => {
      const revenue = row.getValue("revenue") as number | undefined;
      if (!revenue) return <span className="text-muted-foreground text-sm">-</span>;
      
      return (
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3 text-green-600" />
          <span className="font-medium text-green-600">
            ${revenue.toLocaleString()}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      const location = row.getValue("location") as any;
      
      // Handle JSON object location
      if (location && typeof location === 'object') {
        const locationStr = [location.city, location.state, location.country]
          .filter(Boolean)
          .join(', ');
        
        return (
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            {locationStr || 'Unknown'}
          </div>
        );
      }
      
      // Handle string location (fallback)
      return (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          {location || 'Unknown'}
        </div>
      );
    },
  },
  {
    accessorKey: "lastActivity",
    header: "Last Activity",
    cell: ({ row }) => {
      const lastActivityString = row.getValue("lastActivity") as string;
      const lastActivity = new Date(lastActivityString);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      
      const formattedDate = lastActivity.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'numeric', 
        day: 'numeric' 
      });
      
      return (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">{formattedDate}</div>
            <div className="text-xs text-muted-foreground">
              {daysDiff === 0 ? 'Today' : 
               daysDiff === 1 ? 'Yesterday' : 
               `${daysDiff} days ago`}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "conversationCount",
    header: "Conversations",
    cell: ({ row }) => {
      const count = row.getValue("conversationCount") as number;
      const lastType = row.original.lastConversationType;
      const typeEmojis = { call: "📞", email: "📧", chat: "💬" };
      
      return (
        <div className="text-center">
          <div className="flex items-center gap-1 justify-center">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {count}
            </span>
            {lastType && (
              <span className="text-xs">
                {typeEmojis[lastType as keyof typeof typeEmojis]}
              </span>
            )}
          </div>
        </div>
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
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            💡 {count}
          </span>
        </div>
      );
    },
  },
];

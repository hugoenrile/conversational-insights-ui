"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { customers, conversations, insights } from "@/lib/mock-data";
import { DataTable } from "@/components/data-table";
import { customerColumns } from "./columns";
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
  Users, 
  Building2, 
  DollarSign, 
  TrendingUp,
  Heart,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  MessageSquare,
  Lightbulb,
  Tag,
  Filter,
  X,
  ExternalLink,
  Crown,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export default function CustomersPage() {
  const searchParams = useSearchParams();
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [healthFilter, setHealthFilter] = useState<string | null>(null);
  const [sizeFilter, setSizeFilter] = useState<string | null>(null);

  useEffect(() => {
    const status = searchParams.get('status');
    const tier = searchParams.get('tier');
    const health = searchParams.get('health');
    const size = searchParams.get('size');
    
    if (status) setStatusFilter(status);
    if (tier) setTierFilter(tier);
    if (health) setHealthFilter(health);
    if (size) setSizeFilter(size);
  }, [searchParams]);

  const enrichedCustomers = useMemo(() => {
    return customers.map((customer) => {
      const customerConversations = conversations.filter((c) => c.customerId === customer.id);
      const customerInsights = insights.filter((i) => {
        const conversation = conversations.find((c) => c.id === i.conversationId);
        return conversation?.customerId === customer.id;
      });
      
      const lastConversation = customerConversations
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      return {
        ...customer,
        conversationCount: customerConversations.length,
        insightCount: customerInsights.length,
        lastConversationType: lastConversation?.type,
      };
    });
  }, []);

  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.revenue || 0), 0);
    const avgRevenue = totalRevenue / customers.filter(c => c.revenue).length || 0;
    const atRiskCustomers = customers.filter(c => c.health === 'at-risk' || c.health === 'critical').length;

    return { totalCustomers, activeCustomers, totalRevenue, avgRevenue, atRiskCustomers };
  }, []);

  const filteredCustomers = useMemo(() => {
    return enrichedCustomers.filter((customer) => {
      if (statusFilter && customer.status !== statusFilter) return false;
      if (tierFilter && customer.tier !== tierFilter) return false;
      if (healthFilter && customer.health !== healthFilter) return false;
      if (sizeFilter && customer.size !== sizeFilter) return false;
      return true;
    });
  }, [enrichedCustomers, statusFilter, tierFilter, healthFilter, sizeFilter]);

  const activeFilters = [
    statusFilter ? { label: `Status: ${statusFilter}`, onRemove: () => setStatusFilter(null) } : null,
    tierFilter ? { label: `Tier: ${tierFilter}`, onRemove: () => setTierFilter(null) } : null,
    healthFilter ? { label: `Health: ${healthFilter}`, onRemove: () => setHealthFilter(null) } : null,
    sizeFilter ? { label: `Size: ${sizeFilter}`, onRemove: () => setSizeFilter(null) } : null,
  ].filter(Boolean);

  const clearAllFilters = () => {
    setStatusFilter(null);
    setTierFilter(null);
    setHealthFilter(null);
    setSizeFilter(null);
  };

  return (
    <div className="p-6 space-y-6 bg-background">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">👥 Customers</h1>
        <p className="text-muted-foreground">Manage and analyze your customer relationships</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeCustomers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${(stats.totalRevenue / 1000).toFixed(0)}K</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${(stats.avgRevenue / 1000).toFixed(0)}K</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.atRiskCustomers}</div>
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
          value={statusFilter || ""}
          onChange={(e) => setStatusFilter(e.target.value || null)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="prospect">Prospect</option>
          <option value="churned">Churned</option>
        </select>

        <select
          value={tierFilter || ""}
          onChange={(e) => setTierFilter(e.target.value || null)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <select
          value={healthFilter || ""}
          onChange={(e) => setHealthFilter(e.target.value || null)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">All Health</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="at-risk">At Risk</option>
          <option value="critical">Critical</option>
        </select>

        <select
          value={sizeFilter || ""}
          onChange={(e) => setSizeFilter(e.target.value || null)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">All Sizes</option>
          <option value="startup">Startup</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="enterprise">Enterprise</option>
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
        Showing {filteredCustomers.length} of {enrichedCustomers.length} customers
      </div>

      {/* Customers Table */}
      <DataTable
        columns={customerColumns}
        data={filteredCustomers}
        onRowClick={(row) => setSelectedCustomer(row.id)}
      />
    </div>
  );
}
  
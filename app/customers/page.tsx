"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

export default function CustomersPage() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [healthFilter, setHealthFilter] = useState<string | null>(null);
  const [sizeFilter, setSizeFilter] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Users className="h-4 w-4" />
                </motion.div>
                Total Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {mounted ? <AnimatedNumber value={stats.totalCustomers} duration={1500} /> : stats.totalCustomers}
              </div>
              <p className="text-xs text-muted-foreground mt-1">👥 All customers</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border hover:shadow-lg transition-all bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <CheckCircle className="h-4 w-4" />
                </motion.div>
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mounted ? <AnimatedNumber value={stats.activeCustomers} duration={1800} /> : stats.activeCustomers}
              </div>
              <p className="text-xs text-muted-foreground mt-1">✅ Currently active</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border hover:shadow-lg transition-all bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <DollarSign className="h-4 w-4" />
                </motion.div>
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                ${mounted ? <AnimatedNumber value={Math.round(stats.totalRevenue / 1000)} duration={2000} /> : Math.round(stats.totalRevenue / 1000)}K
              </div>
              <p className="text-xs text-muted-foreground mt-1">💰 Total earnings</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border hover:shadow-lg transition-all bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 15, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <TrendingUp className="h-4 w-4" />
                </motion.div>
                Avg Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600">
                ${mounted ? <AnimatedNumber value={Math.round(stats.avgRevenue / 1000)} duration={2200} /> : Math.round(stats.avgRevenue / 1000)}K
              </div>
              <p className="text-xs text-muted-foreground mt-1">📊 Per customer</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border hover:shadow-lg transition-all bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <AlertTriangle className="h-4 w-4" />
                </motion.div>
                At Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {mounted ? <AnimatedNumber value={stats.atRiskCustomers} duration={2400} /> : stats.atRiskCustomers}
              </div>
              <p className="text-xs text-muted-foreground mt-1">⚠️ Need attention</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div 
        className="flex flex-wrap gap-2 items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Filter className="h-4 w-4" />
          </motion.div>
          Filters:
        </div>
        
        <motion.select
          value={statusFilter || ""}
          onChange={(e) => setStatusFilter(e.target.value || null)}
          className="border rounded px-2 py-1 text-sm transition-all hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          whileFocus={{ scale: 1.02 }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="prospect">Prospect</option>
          <option value="churned">Churned</option>
        </motion.select>

        <motion.select
          value={tierFilter || ""}
          onChange={(e) => setTierFilter(e.target.value || null)}
          className="border rounded px-2 py-1 text-sm transition-all hover:border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
          whileFocus={{ scale: 1.02 }}
        >
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </motion.select>

        <motion.select
          value={healthFilter || ""}
          onChange={(e) => setHealthFilter(e.target.value || null)}
          className="border rounded px-2 py-1 text-sm transition-all hover:border-purple-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          whileFocus={{ scale: 1.02 }}
        >
          <option value="">All Health</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="at-risk">At Risk</option>
          <option value="critical">Critical</option>
        </motion.select>

        <motion.select
          value={sizeFilter || ""}
          onChange={(e) => setSizeFilter(e.target.value || null)}
          className="border rounded px-2 py-1 text-sm transition-all hover:border-orange-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          whileFocus={{ scale: 1.02 }}
        >
          <option value="">All Sizes</option>
          <option value="startup">Startup</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="enterprise">Enterprise</option>
        </motion.select>
      </motion.div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {activeFilters.map((filter, idx) => (
            <span
              key={idx}
              className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm"
            >
              {filter?.label}
              <button
                onClick={filter?.onRemove}
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

      <motion.div 
        className="text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        Showing <motion.span
          key={filteredCustomers.length}
          initial={{ scale: 1.2, color: "#3b82f6" }}
          animate={{ scale: 1, color: "inherit" }}
          transition={{ duration: 0.3 }}
        >
          {filteredCustomers.length}
        </motion.span> of {enrichedCustomers.length} customers
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
      >
        <DataTable
          columns={customerColumns}
          data={filteredCustomers}
          onRowClick={(row) => setSelectedCustomer(row.id)}
        />
      </motion.div>
    </div>
  );
}
  
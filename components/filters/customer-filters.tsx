"use client";

import { GenericFilter } from "./generic-filter";

type CustomerFiltersProps = {
  statusFilter: string | null;
  tierFilter: string | null;
  sizeFilter: string | null;
  industryFilter: string | null;
  onStatusChange: (value: string | null) => void;
  onTierChange: (value: string | null) => void;
  onSizeChange: (value: string | null) => void;
  onIndustryChange: (value: string | null) => void;
};

export function CustomerFilters({
  statusFilter,
  tierFilter,
  sizeFilter,
  industryFilter,
  onStatusChange,
  onTierChange,
  onSizeChange,
  onIndustryChange,
}: CustomerFiltersProps) {
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "churned", label: "Churned" },
    { value: "prospect", label: "Prospect" },
  ];

  const tierOptions = [
    { value: "free", label: "Free" },
    { value: "pro", label: "Pro" },
    { value: "enterprise", label: "Enterprise" },
  ];

  const sizeOptions = [
    { value: "startup", label: "Startup" },
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "enterprise", label: "Enterprise" },
  ];

  const industryOptions = [
    { value: "technology", label: "Technology" },
    { value: "healthcare", label: "Healthcare" },
    { value: "finance", label: "Finance" },
    { value: "education", label: "Education" },
    { value: "retail", label: "Retail" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "consulting", label: "Consulting" },
    { value: "fintech", label: "Fintech" },
  ];

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <GenericFilter
        options={statusOptions}
        selected={statusFilter}
        onSelect={onStatusChange}
        placeholder="Filter by Status"
        label="Status"
      />
      <GenericFilter
        options={tierOptions}
        selected={tierFilter}
        onSelect={onTierChange}
        placeholder="Filter by Tier"
        label="Tier"
      />
      <GenericFilter
        options={sizeOptions}
        selected={sizeFilter}
        onSelect={onSizeChange}
        placeholder="Filter by Size"
        label="Size"
      />
      <GenericFilter
        options={industryOptions}
        selected={industryFilter}
        onSelect={onIndustryChange}
        placeholder="Filter by Industry"
        label="Industry"
      />
    </div>
  );
}

"use client";

import { GenericFilter } from "./generic-filter";

type ConversationFiltersProps = {
  typeFilter: string | null;
  statusFilter: string | null;
  sentimentFilter: string | null;
  priorityFilter: string | null;
  onTypeChange: (value: string | null) => void;
  onStatusChange: (value: string | null) => void;
  onSentimentChange: (value: string | null) => void;
  onPriorityChange: (value: string | null) => void;
};

export function ConversationFilters({
  typeFilter,
  statusFilter,
  sentimentFilter,
  priorityFilter,
  onTypeChange,
  onStatusChange,
  onSentimentChange,
  onPriorityChange,
}: ConversationFiltersProps) {
  const typeOptions = [
    { value: "call", label: "Call" },
    { value: "email", label: "Email" },
    { value: "chat", label: "Chat" },
    { value: "meeting", label: "Meeting" },
  ];

  const statusOptions = [
    { value: "completed", label: "Completed" },
    { value: "scheduled", label: "Scheduled" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const sentimentOptions = [
    { value: "positive", label: "Positive" },
    { value: "neutral", label: "Neutral" },
    { value: "negative", label: "Negative" },
  ];

  const priorityOptions = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <GenericFilter
        options={typeOptions}
        selected={typeFilter}
        onSelect={onTypeChange}
        placeholder="Filter by Type"
        label="Type"
      />
      <GenericFilter
        options={statusOptions}
        selected={statusFilter}
        onSelect={onStatusChange}
        placeholder="Filter by Status"
        label="Status"
      />
      <GenericFilter
        options={sentimentOptions}
        selected={sentimentFilter}
        onSelect={onSentimentChange}
        placeholder="Filter by Sentiment"
        label="Sentiment"
      />
      <GenericFilter
        options={priorityOptions}
        selected={priorityFilter}
        onSelect={onPriorityChange}
        placeholder="Filter by Priority"
        label="Priority"
      />
    </div>
  );
}

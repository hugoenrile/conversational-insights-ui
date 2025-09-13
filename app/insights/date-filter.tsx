"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

type DateFilterProps = {
  label: string;
  date: Date | undefined;
  setDate: (d: Date | undefined) => void;
};

export function DateFilter({ label, date, setDate }: DateFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {date ? `${label}: ${date.toLocaleDateString()}` : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
        {date && (
          <Button
            variant="ghost"
            className="w-full rounded-none"
            onClick={() => setDate(undefined)}
          >
            Clear
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}

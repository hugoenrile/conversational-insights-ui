"use client";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type FilterProps = {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
};

export function CategoryFilter({ categories, selected, onSelect }: FilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {selected ? `Category: ${selected}` : "Filter by Category"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onSelect(null)}>All</DropdownMenuItem>
        {categories.map((cat) => (
          <DropdownMenuItem key={cat} onClick={() => onSelect(cat)}>
            {cat}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

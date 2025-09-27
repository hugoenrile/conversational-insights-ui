"use client";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type GenericFilterProps = {
  options: Array<{ value: string; label: string }>;
  selected: string | null;
  onSelect: (value: string | null) => void;
  placeholder: string;
  label: string;
};

export function GenericFilter({ options, selected, onSelect, placeholder, label }: GenericFilterProps) {
  const selectedOption = options.find(opt => opt.value === selected);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {selectedOption ? `${label}: ${selectedOption.label}` : placeholder}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onSelect(null)}>All</DropdownMenuItem>
        {options.map((option) => (
          <DropdownMenuItem key={option.value} onClick={() => onSelect(option.value)}>
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

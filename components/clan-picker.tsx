"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { categoryTheme } from "@/lib/clan-categories";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Search } from "lucide-react";
import { useState } from "react";

export type PickerCategory = {
  _id: string;
  displayName: string;
  clans: { tag: string; name: string }[];
};

export function ClanPicker({
  categories,
  value,
  onChange,
  allLabel,
}: {
  categories: PickerCategory[];
  value: string;
  onChange: (tag: string) => void;
  /** Adds an entry for every clan; selecting it sets the value to "". */
  allLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const selected = categories
    .flatMap((c) => c.clans.map((clan) => ({ clan, category: c })))
    .find(({ clan }) => clan.tag === value);
  const SelectedIcon = categoryTheme(selected?.category.displayName ?? "").Icon;

  return (
    <DropdownMenu onOpenChange={(open) => !open && setQuery("")}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-xl border bg-background px-3.5 text-left text-sm shadow-xs transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-foreground/10 sm:w-72 dark:bg-input/30"
        >
          <SelectedIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate">
            {selected ? selected.clan.name : (allLabel ?? "Select a clan")}
          </span>
          {selected && (
            <span className="font-mono text-xs text-muted-foreground">
              {selected.clan.tag}
            </span>
          )}
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-xl p-0">
        <div className="border-b p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search clans"
              className="h-9 pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto p-1">
          {allLabel && !q && (
            <DropdownMenuItem
              onSelect={() => onChange("")}
              className="mb-1 gap-2 rounded-lg"
            >
              <span className="flex-1">{allLabel}</span>
              {value === "" && <Check className="size-3.5" />}
            </DropdownMenuItem>
          )}
          {categories.map((category) => {
            const clans = category.clans.filter(
              (clan) =>
                !q ||
                clan.name.toLowerCase().includes(q) ||
                clan.tag.toLowerCase().includes(q),
            );
            if (!clans.length) return null;
            const theme = categoryTheme(category.displayName);
            return (
              <div
                key={category._id}
                className="[&:not(:first-child)]:mt-1 [&:not(:first-child)]:border-t [&:not(:first-child)]:pt-1"
              >
                <DropdownMenuLabel className="sticky top-0 z-10 flex items-center gap-2 bg-popover px-2 py-2 text-xs font-medium">
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-md",
                      theme.tile,
                    )}
                  >
                    <theme.Icon className="size-3" />
                  </span>
                  {category.displayName}
                  <span className="ml-auto font-normal tabular-nums text-muted-foreground">
                    {clans.length}
                  </span>
                </DropdownMenuLabel>
                {clans.map((clan) => (
                  <DropdownMenuItem
                    key={clan.tag}
                    onSelect={() => onChange(clan.tag)}
                    className="gap-2 rounded-lg"
                  >
                    <span className="min-w-0 flex-1 truncate">{clan.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {clan.tag}
                    </span>
                    {clan.tag === value && <Check className="size-3.5" />}
                  </DropdownMenuItem>
                ))}
              </div>
            );
          })}
          {categories.every((c) =>
            c.clans.every(
              (clan) =>
                q &&
                !clan.name.toLowerCase().includes(q) &&
                !clan.tag.toLowerCase().includes(q),
            ),
          ) && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No clans match.
            </p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

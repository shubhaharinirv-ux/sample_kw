"use client";

import React, { ChangeEvent, ReactNode, useState, useRef } from "react";
import {
  ChevronDown,
  Filter,
  Search as SearchIcon,
  RefreshCw,
  Plus,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/components/ui/popover";
import { useKeyboardEscape, useFocusTrap } from "@/shared/hooks/useKeyboardNavigation";

interface FilterBarProps {
  // allow using FilterBar as a simple top bar (e.g. only back arrow)
  leftControl?: ReactNode;
  hideSearch?: boolean;
  hideFilters?: boolean;
  /** Defaults to hideFilters when not set. Pass false to show reset independently. */
  hideReset?: boolean;
  hideNew?: boolean;
  hideActions?: boolean;
  // disable individual controls while still rendering them (for UI consistency)
  disableSearch?: boolean;
  disableFilters?: boolean;
  disableReset?: boolean;
  search?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: () => void;
  searchPlaceholder?: string;
  filterContent?: ReactNode;
  filtersActive?: boolean;
  onClear?: () => void;
  onFiltersApply?: () => void;
  onFiltersReset?: () => void;
  filterContentClassName?: string;
  onNewClick?: () => void;
  newLabel?: string;
  /** Rendered in the slot just before the filter/reset buttons (after New). */
  rightControl?: ReactNode;
  /** Replaces the filter popover button slot when hideFilters is true. */
  filterSlotControl?: ReactNode;
}

export default function FilterBar({
  leftControl,
  search = "",
  onSearchChange,
  onSearch,
  filterContent,
  filtersActive = false,
  onClear,
  onNewClick,
  newLabel = "New",
  searchPlaceholder = "Search keywords...",
  filterContentClassName = "w-[250px] p-4 space-y-4",
  rightControl,
  filterSlotControl,
  hideSearch = false,
  hideFilters = false,
  hideReset,
  hideNew = false,
  hideActions = false,
  disableSearch = false,
  disableFilters = false,
  disableReset = false,
  onFiltersApply,
  onFiltersReset,
}: FilterBarProps) {
  // hideReset inherits hideFilters unless explicitly overridden
  const shouldHideReset = hideReset ?? hideFilters;

  const [openFilters, setOpenFilters] = useState(false);
  const filterContentRef = useRef<HTMLDivElement>(null);

  // Close filters on Escape
  useKeyboardEscape(() => setOpenFilters(false), openFilters);

  // Trap focus in filter popover when open
  useFocusTrap(filterContentRef as React.RefObject<HTMLElement>, openFilters);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value);
  };

  const handleFilterButtonKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    if (e.key === "ArrowDown" || e.key === " ") {
      e.preventDefault();
      setOpenFilters(true);
    }
  };

  return (
    <div className="w-full p-4 border-b bg-white flex items-center gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {leftControl && <div className="shrink-0">{leftControl}</div>}

        {!hideSearch && (
          <div className={`flex items-center w-72 max-w-full border border-gray-200 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white h-9 ${disableSearch ? "opacity-50 pointer-events-none" : ""}`}>
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSearch?.();
                }
              }}
              disabled={disableSearch}
              className="h-full border-0 rounded-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-3 text-sm"
            />
            <Button
              onClick={() => onSearch?.()}
              disabled={disableSearch}
              className="h-9 rounded-none px-3 bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0 flex items-center justify-center text-sm transition duration-150 ease-out active:scale-[0.98]"
              aria-label="Search"
            >
              <SearchIcon className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Right: New + Filters + Reset */}
      <div className="ml-auto flex items-center gap-2">
        {rightControl && <div className="shrink-0">{rightControl}</div>}
        {!hideNew && !hideActions && (
          <Button
            onClick={() => onNewClick?.()}
            className="h-9 px-3 w-32 rounded-md flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white justify-center text-sm transition duration-150 ease-out active:scale-[0.98]"
            aria-label={newLabel}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">{newLabel}</span>
          </Button>
        )}

        {hideFilters && filterSlotControl && (
          <div className="shrink-0">{filterSlotControl}</div>
        )}
        {!hideFilters && (
          <Popover open={disableFilters ? false : openFilters} onOpenChange={disableFilters ? undefined : setOpenFilters}>
            <PopoverTrigger asChild>
              <Button
                variant={filtersActive ? "default" : "outline"}
                disabled={disableFilters}
                className={`h-9 px-3 rounded-md flex items-center gap-1 text-sm transition duration-150 ease-out active:scale-[0.98] ${
                  filtersActive
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : ""
                }`}
                onKeyDown={handleFilterButtonKeyDown}
                aria-expanded={openFilters}
                aria-label="Open filters"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline text-sm" />
                <span
                  className={`ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-xs font-semibold transition ${
                    filtersActive
                      ? "bg-white/20 text-white opacity-100"
                      : "opacity-0"
                  }`}
                >
                  *
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              ref={filterContentRef}
              align="end"
              className={`transition duration-200 ease-out data-[state=open]:opacity-100 data-[state=closed]:opacity-0 data-[state=open]:translate-y-0 data-[state=closed]:translate-y-1 ${filterContentClassName}`}
            >
              <div className="space-y-4">
                {filterContent}
                {onFiltersApply && (
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        onFiltersReset ? onFiltersReset() : onClear?.();
                        setOpenFilters(false);
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={() => {
                        onFiltersApply?.();
                        setOpenFilters(false);
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {!shouldHideReset && (
          <Button
            onClick={() => onClear?.()}
            disabled={disableReset}
            variant="outline"
            className="h-9 px-3 rounded-md flex items-center justify-center text-sm transition duration-150 ease-out active:scale-[0.98]"
            title="Reset filters"
            aria-label="Reset filters"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

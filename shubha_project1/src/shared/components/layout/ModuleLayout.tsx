"use client";

import React, { ReactNode, useState } from "react";
import { LayoutGrid, List as ListIcon, Kanban as KanbanIcon, Wrench, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import FilterBar from "./FilterBar";
import BrandSwitcher from "./BrandSwitcher";

// ─── types ─────────────────────────────────────────────────────────────────

export type ViewMode = "grid" | "list" | "kanban" | "calendar";

export interface ModuleLayoutProps {
  /**
   * Content rendered in the middle pane (below BrandSwitcher).
   * Typically a BoardPane or a manage-mode nav list.
   */
  middleContent: ReactNode;

  /**
   * Page heading shown in the content area header row.
   */
  pageTitle: string;

  /**
   * Count label shown as "countLabel: count" in the header row (e.g. "Assets: 292").
   * Only rendered when count is provided.
   */
  countLabel?: string;
  count?: number;

  /**
   * Whether to render the Grid / List / Kanban view-mode switcher.
   * Defaults to true.
   */
  showViewSwitcher?: boolean;

  /**
   * Render function for the main content area.
   * Receives the currently active ViewMode so you can swap content.
   *
   * @example
   * renderContent={(view) => {
   *   if (view === "grid") return <MyGrid items={items} />;
   *   if (view === "list") return <MyList items={items} />;
   *   return <MyKanban items={items} />;
   * }}
   */
  renderContent: (viewMode: ViewMode) => ReactNode;

  // ── FilterBar configuration ─────────────────────────────────────────────

  search?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: () => void;
  searchPlaceholder?: string;
  newLabel?: string;
  onNewClick?: () => void;
  filterContent?: ReactNode;
  filtersActive?: boolean;
  onFiltersApply?: () => void;
  onFiltersReset?: () => void;
  onClear?: () => void;
  hideNew?: boolean;
  hideFilters?: boolean;
  filterContentClassName?: string;

  /**
   * Extra controls rendered to the right of the Reset button in FilterBar.
   */
  rightControl?: ReactNode;

  /**
   * Optional custom leftControl for FilterBar.
   * Defaults to the standard Wrench/Manage button.
   */
  filterLeftControl?: ReactNode;

  /**
   * Middle pane width. Defaults to 340px.
   */
  middlePaneWidth?: number | string;
}

// ─── component ─────────────────────────────────────────────────────────────

export default function ModuleLayout({
  middleContent,
  pageTitle,
  countLabel,
  count,
  showViewSwitcher = true,
  renderContent,
  search = "",
  onSearchChange,
  onSearch,
  searchPlaceholder,
  newLabel = "New Item",
  onNewClick,
  filterContent,
  filtersActive = false,
  onFiltersApply,
  onFiltersReset,
  onClear,
  hideNew = false,
  hideFilters = false,
  filterContentClassName,
  rightControl,
  filterLeftControl,
  middlePaneWidth = 340,
}: ModuleLayoutProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const defaultFilterLeftControl = (
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9 rounded-md flex items-center justify-center"
      title="Manage"
      aria-label="Manage"
    >
      <Wrench className="w-4 h-4 text-gray-600" />
    </Button>
  );

  const viewToggle = showViewSwitcher && (
    <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
      {(
        [
          { mode: "grid" as const, Icon: LayoutGrid, title: "Grid view" },
          { mode: "list" as const, Icon: ListIcon, title: "List view" },
          { mode: "kanban" as const, Icon: KanbanIcon, title: "Board view" },
          { mode: "calendar" as const, Icon: CalendarIcon, title: "Calendar view" },
        ] as const
      ).map(({ mode, Icon, title }) => (
        <Button
          key={mode}
          variant="ghost"
          size="sm"
          className={`h-8 px-2 ${
            viewMode === mode
              ? "bg-black text-white hover:bg-black hover:text-white"
              : ""
          }`}
          onClick={() => setViewMode(mode)}
          title={title}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col flex-1 h-screen bg-[#f6f7fb] py-3 mr-3">
      <div className="flex flex-1 bg-white rounded-s-sm border overflow-hidden h-full">
        {/* ── Middle Pane ──────────────────────────────────────────────── */}
        <div
          className="shrink-0 border-r border-gray-200 h-full relative z-50 min-h-0"
          style={{ width: typeof middlePaneWidth === "number" ? `${middlePaneWidth}px` : middlePaneWidth }}
        >
          <div className="flex flex-col h-full border-r border-gray-200 min-h-0">
            {/* Sticky brand header */}
            <div className="shrink-0 sticky top-0 bg-white z-10 p-4 pb-3">
              <BrandSwitcher />
            </div>
            {/* Scrollable middle body */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {middleContent}
            </div>
          </div>
        </div>

        {/* ── Content Pane ─────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <FilterBar
            leftControl={filterLeftControl ?? defaultFilterLeftControl}
            search={search}
            onSearchChange={onSearchChange}
            onSearch={onSearch}
            searchPlaceholder={searchPlaceholder}
            newLabel={newLabel}
            onNewClick={onNewClick}
            filterContent={filterContent}
            filtersActive={filtersActive}
            onFiltersApply={onFiltersApply}
            onFiltersReset={onFiltersReset}
            onClear={onClear}
            hideNew={hideNew}
            hideFilters={hideFilters}
            filterContentClassName={filterContentClassName}
            rightControl={rightControl}
          />

          <div className="flex-1 overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
            <div className="p-6">
              {/* Header row */}
              <div className="mb-4 flex items-center justify-between gap-3">
                <h1 className="text-base font-semibold text-gray-900">{pageTitle}</h1>
                <div className="flex items-center gap-3">
                  {countLabel !== undefined && count !== undefined && (
                    <span className="text-sm text-muted-foreground">
                      {countLabel}: {count}
                    </span>
                  )}
                  {viewToggle}
                </div>
              </div>

              {/* Content */}
              {renderContent(viewMode)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

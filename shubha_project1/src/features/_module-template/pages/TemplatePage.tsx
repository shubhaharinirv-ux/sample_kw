/**
 * MODULE TEMPLATE
 * ────────────────────────────────────────────────────────────────────────────
 * Copy this entire `_module-template` folder to `features/<your-module>/`.
 * Then find every TODO comment and fill it in.
 *
 * Steps:
 *  1. Rename the folder:  features/_module-template → features/my-module
 *  2. Rename this file:   TemplatePage.tsx → MyModulePage.tsx
 *  3. Fill in the TODOs below
 *  4. Add routes in src/app/router.tsx (see bottom of this file)
 *  5. Add a sidebar entry in Sidebar.tsx if needed
 * ────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ModuleLayout, { ViewMode } from "@/shared/components/layout/ModuleLayout";

// TODO: Replace with your module's middle-pane content.
// This is typically a list of boards/collections, or a manage-mode nav.
// Example: import MyBoardPane from "../components/MyBoardPane";
function MiddlePaneContent() {
  return (
    <div className="p-4 text-sm text-muted-foreground">
      {/* TODO: Replace with your board/collection list */}
      Middle pane placeholder
    </div>
  );
}

export default function TemplatePage() {
  // ── state ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [filtersActive, setFiltersActive] = useState(false);

  // TODO: Add more filter state as needed, e.g.:
  // const [status, setStatus] = useState("");

  // ── routing (only needed if your module has sub-routes) ──────────────────
  // const location = useLocation();
  // const navigate = useNavigate();

  // ── render content per view mode ─────────────────────────────────────────
  const renderContent = (view: ViewMode) => {
    // TODO: Replace these placeholders with your real content components.
    if (view === "grid") {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* TODO: map over your items and render cards */}
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            Grid card placeholder
          </div>
        </div>
      );
    }

    if (view === "list") {
      return (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b">
                {/* TODO: Add your column headers */}
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-28">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* TODO: map over your items and render rows */}
              <tr>
                <td colSpan={2} className="px-4 py-12 text-center text-muted-foreground text-sm">
                  No items found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    // kanban
    const columns = ["To Do", "In Progress", "Done"]; // TODO: Replace with your columns
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((col) => (
          <div key={col} className="flex flex-col rounded-xl border bg-muted/30 min-w-[220px] w-full">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b bg-white/60 rounded-t-xl">
              <span className="text-[11px] font-semibold text-gray-700">{col}</span>
              <span className="text-xs text-muted-foreground font-medium ml-auto">0</span>
            </div>
            <div className="flex items-center justify-center h-20 text-[11px] text-muted-foreground/50">
              {/* TODO: map over items for this column */}
              No items
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ModuleLayout
      // ── Middle pane ───────────────────────────────────────────────────────
      middleContent={<MiddlePaneContent />}

      // ── Page header ───────────────────────────────────────────────────────
      pageTitle="My Module"              // TODO: Set your module title e.g. "All Assets"
      countLabel="Items"                 // TODO: e.g. "Assets", "Users" — shown as "Items: 0"
      count={0}                          // TODO: replace with real count from your data query

      // ── View switcher ─────────────────────────────────────────────────────
      showViewSwitcher={true}            // set false to hide grid/list/kanban toggle
      renderContent={renderContent}

      // ── FilterBar ─────────────────────────────────────────────────────────
      search={search}
      onSearchChange={setSearch}
      onSearch={() => { /* TODO: trigger search */ }}
      searchPlaceholder="Search..."      // TODO: customize placeholder
      newLabel="New Item"                // TODO: e.g. "New Product", "New User"
      onNewClick={() => { /* TODO: open create modal / navigate */ }}

      // ── Filters (optional — remove filterContent to hide the filter popover)
      filtersActive={filtersActive}
      onFiltersApply={() => setFiltersActive(true)}
      onFiltersReset={() => {
        setSearch("");
        setFiltersActive(false);
      }}
      onClear={() => {
        setSearch("");
        setFiltersActive(false);
      }}
      filterContent={
        <div className="space-y-3">
          {/* TODO: Add your filter fields here */}
          <p className="text-sm text-muted-foreground">No filters yet</p>
        </div>
      }
    />
  );
}

/*
 * ── ROUTER SETUP ────────────────────────────────────────────────────────────
 * Add to src/app/router.tsx inside the AppLayout children array:
 *
 *   import TemplatePage from "@/features/_module-template/pages/TemplatePage";
 *   // (rename to your actual module after copying)
 *
 *   { path: "my-module", element: <TemplatePage /> },
 *   { path: "my-module/:itemId", element: <TemplatePage /> },
 *
 * Add to Sidebar.tsx if you need a sidebar nav entry:
 *   { id: "MyModule", label: "My Module", icon: SomeIcon }
 *   navigate("/my-module") inside handleClick
 * ────────────────────────────────────────────────────────────────────────────
 */

"use client";

import React from "react";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, Pencil, Trash2, CheckSquare } from "lucide-react";

interface ActionBarProps {
  selectedCount: number;
  entityLabel?: string;
  entityLabelPlural?: string;
  clearSelection: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
  dangerLabel?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  onDangerClick?: () => void;
  secondaryDisabled?: boolean;
  dangerHidden?: boolean;
}

export default function ActionBar({
  selectedCount,
  entityLabel = "item",
  entityLabelPlural,
  clearSelection,
  primaryLabel = "Select All",
  secondaryLabel = "Edit",
  dangerLabel = "Delete",
  onPrimaryClick,
  onSecondaryClick,
  onDangerClick,
  secondaryDisabled = false,
  dangerHidden = false,
}: ActionBarProps) {
  return (
    <div className="w-full p-4 shadow-sm border-b bg-white flex flex-wrap items-center justify-between gap-3">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={clearSelection}
          className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 transition-colors p-2"
          size="icon"
          aria-label="Clear selection"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">
          {selectedCount}{" "}
          {selectedCount === 1
            ? entityLabel
            : entityLabelPlural || `${entityLabel}s`}{" "}
          selected
        </h3>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {onPrimaryClick && (
          <Button
            variant="outline"
            onClick={onPrimaryClick}
            className="border-gray-300 text-gray-700 hover:text-green-600 hover:border-green-500 hover:bg-transparent flex items-center gap-2 transition-colors"
          >
            <CheckSquare className="h-4 w-4" />
            {primaryLabel}
          </Button>
        )}

        {onSecondaryClick && (
          <Button
            variant="outline"
            onClick={onSecondaryClick}
            disabled={secondaryDisabled}
            className="border-gray-300 text-gray-700 hover:text-blue-600 hover:border-blue-500 hover:bg-transparent flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Pencil className="h-4 w-4" />
            {secondaryLabel}
          </Button>
        )}

        {!dangerHidden && onDangerClick && (
          <Button
            variant="destructive"
            onClick={onDangerClick}
            className="flex items-center gap-2 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            {dangerLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

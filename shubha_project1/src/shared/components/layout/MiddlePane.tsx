"use client";

import React from "react";
import BrandSwitcher from "./BrandSwitcher";
import BoardPane from "@/features/boards/components/BoardPane";
import ManagePane from "./ManagePane";

interface MiddlePaneProps {
  isManageMode: boolean;
  onBack: () => void;
  onSelectCategoryA: () => void;
  onSelectCategoryB: () => void;
  onSelectCategoryC: () => void;
  onSelectUpload: () => void;
  activeManageItem?: "categoryA" | "categoryB" | "categoryC" | "upload";
}

const MiddlePane: React.FC<MiddlePaneProps> = ({
  isManageMode,
  onBack,
  onSelectCategoryA,
  onSelectCategoryB,
  onSelectCategoryC,
  onSelectUpload,
  activeManageItem,
}) => {
  return (
    <div className="flex flex-col h-full border-r border-gray-200 min-h-0">
      {/* Sticky Header - Brand Switcher */}
      <div className="shrink-0 sticky top-0 bg-white z-10 p-4 pb-3">
        <BrandSwitcher />
      </div>

      {/* Scrollable Body - Boards/Manage Content */}
      <div className="flex-1 min-h-0">
        {isManageMode ? (
          <ManagePane
          onBack={onBack}
          onSelectCategoryA={onSelectCategoryA}
          onSelectCategoryB={onSelectCategoryB}
          onSelectCategoryC={onSelectCategoryC}
          onSelectUpload={onSelectUpload}
          activeItem={activeManageItem}
        />
        ) : (
          <BoardPane />
        )}
      </div>
    </div>
  );
};

export default MiddlePane;

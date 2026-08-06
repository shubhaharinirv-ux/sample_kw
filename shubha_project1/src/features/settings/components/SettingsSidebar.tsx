"use client";
import React from "react";
import { NavLink } from "react-router-dom";
import {
  Package,
  Layers,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface TabItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

export default function SettingsSidebar(): JSX.Element {
  const tabs: TabItem[] = [
    { name: "Manage Products", path: "/settings/products", icon: Package },
    { name: "Manage Brands", path: "/settings/brands", icon: Layers },
  ];

  return (
    <div className="flex flex-col h-full bg-[#fafafa] border-r border-gray-200">
      {/* Sidebar Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
      </div>

      {/* Sidebar Tabs */}
      <nav className="flex flex-col mt-2">
        {tabs.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                "flex items-center gap-3 px-6 py-3 text-[15px] font-medium border-l-4 transition-all",
                isActive
                  ? "border-[#1877F3] text-[#1877F3] bg-white"
                  : "border-transparent text-gray-700 hover:bg-gray-100"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

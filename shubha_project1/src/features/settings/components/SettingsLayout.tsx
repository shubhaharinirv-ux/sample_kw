"use client";
import React from "react";
import { Outlet } from "react-router-dom";
import SettingsSidebar from "@/features/settings/components/SettingsSidebar";

const SettingsLayout: React.FC = () => {
  return (
    <div className="flex h-screen py-3 mr-3">
      <div className="flex flex-1 rounded-sm rounded-s border overflow-hidden border-gray-200">

        {/* Sidebar */}
        <div className="w-[340px]">
          <SettingsSidebar />
        </div>

        {/* Content pane EXACTLY like Assets layout */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">

          {/* Top bar + content must fill full width */}
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;

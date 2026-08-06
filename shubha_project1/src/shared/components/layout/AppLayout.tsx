import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

// Define type for the sidebar items
type SidebarItem = "Assets" | "Settings" | "Profile" | "Calculator";

const AppLayout: React.FC = () => {
  const handleSelect = (_id: SidebarItem) => {
    // Items handled by sidebar internally for navigation
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar (persistent) */}
      <Sidebar onSelect={handleSelect} />

      {/* Main Content */}
      <div className="flex-1 bg-[#f6f7fb] overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;

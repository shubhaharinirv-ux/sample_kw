"use client";
import { useState, useEffect } from "react";
import { Globe, Settings, User, LogOut } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthProvider";

interface SidebarProps {
  onSelect: (id: SidebarItem) => void;
}

type SidebarItem = "Assets" | "Settings" | "Profile";

interface NavItem {
  id: SidebarItem;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export default function Sidebar({ onSelect }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [active, setActive] = useState<SidebarItem>("Assets");

  // Sync active state with current route
  useEffect(() => {
    if (location.pathname.startsWith("/library")) setActive("Assets");
    else if (location.pathname.startsWith("/settings")) setActive("Settings");
    else if (location.pathname.startsWith("/profile")) setActive("Profile");
  }, [location.pathname]);

  const topItems: NavItem[] = [
    { id: "Assets", label: "Browse", icon: Globe },
  ];

  const bottomItems: NavItem[] = [
    { id: "Settings", label: "Settings", icon: Settings },
    { id: "Profile", label: "Profile", icon: User },
  ];

  const handleClick = (id: SidebarItem) => {
    setActive(id);
    onSelect(id);

    switch (id) {
      case "Assets":
        navigate("/library/search");
        break;
      case "Settings":
        navigate("/settings");
        break;
      case "Profile":
        navigate("/profile");
        break;

    }
  };

  return (
    <Tooltip.Provider delayDuration={100}>
      <div className="w-[90px] flex flex-col items-center py-4 h-screen bg-[#f8fafd]">
        {/* Logo / Brand */}
        <p className="text-[24px] font-bold leading-[100%] my-3 text-black">Kalai</p>

        {/* Top Nav Items */}
        <div className="flex flex-col items-center space-y-4 mt-2">
          {topItems.map(({ id, label, icon: Icon }) => (
            <Tooltip.Root key={id}>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleClick(id);
                  }}
                  className={`py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center ${
                    active === id
                      ? "bg-[#1877F3] text-white shadow-sm hover:cursor-pointer"
                      : "text-gray-700 hover:text-[#1877F3] hover:cursor-pointer"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right"
                  sideOffset={8}
                  className="z-[9999] bg-gray-900 text-white text-xs px-2 py-1 rounded-md shadow-md"
                >
                  {label}
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Nav Items */}
        <div className="flex flex-col items-center space-y-4 mb-2">
          {bottomItems.map(({ id, label, icon: Icon }) => (
            <Tooltip.Root key={id}>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleClick(id);
                  }}
                  className={`py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center ${
                    active === id
                      ? "bg-[#1877F3] text-white shadow-sm hover:cursor-pointer"
                      : "text-gray-700 hover:text-[#1877F3] hover:cursor-pointer"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right"
                  sideOffset={8}
                  className="z-[9999] bg-gray-900 text-white text-xs px-2 py-1 rounded-md shadow-md"
                >
                  {label}
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          ))}

          {/* Logout */}
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
                className="py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center text-gray-700 hover:text-red-500 hover:cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="right"
                sideOffset={8}
                className="z-[9999] bg-gray-900 text-white text-xs px-2 py-1 rounded-md shadow-md"
              >
                Logout
                <Tooltip.Arrow className="fill-gray-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
      </div>
    </Tooltip.Provider>
  );
}

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  HelpCircle,
  Settings as SettingsIcon,
  ChevronDown,
  Plus,
  Grid,
  Trash2,
  X,
  Search as SearchIcon,
  Globe,
  LogOut
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startHour: number; // 0-23
  startMin: number; // 0, 15, 30, 45
  endHour: number;
  endMin: number;
  category: "shubha" | "Birthdays" | "Tasks" | "Holidays";
}

const CATEGORY_COLORS = {
  shubha: { bg: "bg-[#d2e3fc]", border: "border-l-4 border-[#1a73e8]", text: "text-[#1a73e8]" },
  Birthdays: { bg: "bg-[#e6f4ea]", border: "border-l-4 border-[#137333]", text: "text-[#137333]" },
  Tasks: { bg: "bg-[#fef7e0]", border: "border-l-4 border-[#b06000]", text: "text-[#b06000]" },
  Holidays: { bg: "bg-[#fce8e6]", border: "border-l-4 border-[#c5221f]", text: "text-[#c5221f]" },
};

export default function Layout() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 4)); // Aug 4, 2026
  const [miniCalDate, setMiniCalDate] = useState<Date>(new Date(2026, 7, 4));
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCalendars, setActiveCalendars] = useState({
    shubha: true,
    Birthdays: true,
    Tasks: true,
    Holidays: true,
  });

  // Settings state
  const [calendarName, setCalendarName] = useState("Calendar");
  const [timezone, setTimezone] = useState("GMT+05:30");

  // View Mode state ("day" | "week" | "month")
  const [activeView, setActiveView] = useState<"day" | "week" | "month">("week");

  // Dropdown states
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Modal states
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const [modalForm, setModalForm] = useState({
    title: "",
    date: "2026-08-04",
    startHour: 9,
    startMin: 0,
    endHour: 10,
    endMin: 0,
    category: "shubha" as const,
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem("google_calendar_events");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      {
        id: "event-1",
        title: "Weekly Planning",
        date: "2026-08-04",
        startHour: 10,
        startMin: 0,
        endHour: 11,
        endMin: 30,
        category: "shubha",
      },
      {
        id: "event-2",
        title: "Sarah's Birthday",
        date: "2026-08-05",
        startHour: 14,
        startMin: 0,
        endHour: 16,
        endMin: 0,
        category: "Birthdays",
      },
      {
        id: "event-3",
        title: "Dentist Visit",
        date: "2026-08-07",
        startHour: 9,
        startMin: 0,
        endHour: 10,
        endMin: 0,
        category: "Tasks",
      },
      {
        id: "event-4",
        title: "Independence Day (Observed)",
        date: "2026-08-15",
        startHour: 0,
        startMin: 0,
        endHour: 23,
        endMin: 59,
        category: "Holidays",
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("google_calendar_events", JSON.stringify(events));
  }, [events]);

  // Click outside ref to close dropdowns
  const viewDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(event.target as Node)) {
        setIsViewDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sunday of current date's week
  const startOfWeekDate = useMemo(() => {
    const start = new Date(currentDate);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    return start;
  }, [currentDate]);

  // Days list for the current week grid (Sun-Sat)
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeekDate);
      d.setDate(startOfWeekDate.getDate() + i);
      return d;
    });
  }, [startOfWeekDate]);

  // Navigate view range
  const handleNavigate = (direction: "prev" | "next") => {
    const step = direction === "next" ? 1 : -1;
    const next = new Date(currentDate);

    if (activeView === "day") {
      next.setDate(currentDate.getDate() + step);
    } else if (activeView === "week") {
      next.setDate(currentDate.getDate() + step * 7);
    } else if (activeView === "month") {
      next.setMonth(currentDate.getMonth() + step);
    }
    setCurrentDate(next);
    setMiniCalDate(next);
  };

  const jumpToToday = () => {
    const today = new Date(2026, 7, 4); // Mock today date
    setCurrentDate(today);
    setMiniCalDate(today);
  };

  // Mini Calendar calculations
  const miniCalMonthDays = useMemo(() => {
    const year = miniCalDate.getFullYear();
    const month = miniCalDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const prevMonthLastDay = new Date(year, month, 0);
    const startOffset = firstDay.getDay();

    const days = [];

    // Fill prev month days
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay.getDate() - i),
        isCurrentMonth: false,
      });
    }

    // Fill current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Fill next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [miniCalDate]);

  const changeMiniMonth = (direction: "prev" | "next") => {
    const next = new Date(miniCalDate);
    next.setMonth(miniCalDate.getMonth() + (direction === "next" ? 1 : -1));
    setMiniCalDate(next);
  };

  // Month View Days Calculations
  const monthViewDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const prevMonthLastDay = new Date(year, month, 0);
    const startOffset = firstDay.getDay();

    const days = [];

    // Fill prev month
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthLastDay.getDate() - i));
    }

    // Fill current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Fill next month
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  }, [currentDate]);

  // Form submits
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.title.trim()) return;

    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: modalForm.title,
      date: modalForm.date,
      startHour: Number(modalForm.startHour),
      startMin: Number(modalForm.startMin),
      endHour: Number(modalForm.endHour),
      endMin: Number(modalForm.endMin),
      category: modalForm.category,
    };

    setEvents((prev) => [...prev, newEvent]);
    setIsEventModalOpen(false);
    setModalForm({
      title: "",
      date: modalForm.date,
      startHour: 9,
      startMin: 0,
      endHour: 10,
      endMin: 0,
      category: "shubha",
    });
  };

  const deleteEvent = (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    }
  };

  const formatDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesCategory = activeCalendars[ev.category];
      const matchesSearch =
        !searchQuery.trim() ||
        ev.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [events, activeCalendars, searchQuery]);

  const monthLabel = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col flex-1 h-screen bg-white text-gray-800 select-none font-sans overflow-hidden">
      {/* ─── HEADER ─── */}
      <header className="flex items-center justify-between px-3 py-2 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition">
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#1a73e8] text-white flex items-center justify-center rounded-lg font-bold text-lg shadow-sm">
              {currentDate.getDate()}
            </div>
            <span className="text-xl text-gray-600 font-medium tracking-tight">{calendarName}</span>
          </div>

          <button
            onClick={jumpToToday}
            className="ml-6 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition"
          >
            Today
          </button>

          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={() => handleNavigate("prev")}
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => handleNavigate("next")}
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <h2 className="text-xl font-medium text-gray-700 ml-4">{monthLabel}</h2>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative flex items-center bg-gray-100 rounded-full px-3 py-1.5 w-64 shadow-xs">
            <Search className="text-gray-500 mr-2 shrink-0" size={16} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-500 hover:text-gray-700">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Help Button */}
          <button
            onClick={() => alert("Welcome to Google Calendar Clone! Click any hourly time slot to create a new event. Toggle checkboxes on the left to filter.")}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition"
            title="Help"
          >
            <HelpCircle size={20} />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition"
            title="Settings"
          >
            <SettingsIcon size={20} />
          </button>

          {/* View Selector Dropdown */}
          <div className="relative" ref={viewDropdownRef}>
            <button
              onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
              className="flex items-center border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm font-medium hover:bg-gray-50 cursor-pointer transition capitalize"
            >
              <span>{activeView}</span>
              <ChevronDown size={14} className="ml-2 text-gray-500" />
            </button>
            {isViewDropdownOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white border rounded-md shadow-lg z-50 py-1">
                {(["day", "week", "month"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      setActiveView(v);
                      setIsViewDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 capitalize ${
                      activeView === v ? "text-[#1a73e8] font-semibold" : "text-gray-700"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Upgrade Button */}
          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="px-4 py-1.5 bg-[#e8f0fe] text-[#1a73e8] hover:bg-[#d2e3fc] rounded-full text-sm font-semibold transition"
          >
            Upgrade
          </button>

          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition">
            <Grid size={20} />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-sm border-2 border-white ring-2 ring-blue-500 cursor-pointer shadow-sm"
            >
              S
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded-xl shadow-2xl z-50 p-4">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-lg mb-2">
                    S
                  </div>
                  <span className="font-semibold text-gray-800">Shubha</span>
                  <span className="text-xs text-gray-500 mb-4">shubha@example.com</span>
                  <div className="w-full border-t pt-2 mt-2">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        alert("Signed out successfully!");
                      }}
                      className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md transition font-medium"
                    >
                      <LogOut size={14} />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── BODY LAYOUT ─── */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* ─── LEFT PANEL ─── */}
        <aside className="w-64 border-r border-gray-200 p-4 flex flex-col gap-6 shrink-0 overflow-y-auto bg-white select-none">
          {/* Create Button */}
          <div>
            <button
              onClick={() => {
                setModalForm((prev) => ({ ...prev, date: formatDateString(currentDate) }));
                setIsEventModalOpen(true);
              }}
              className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg hover:bg-gray-50 transition text-gray-700 font-semibold text-sm"
            >
              <Plus className="text-blue-600" size={20} />
              <span>Create</span>
              <ChevronDown size={12} className="ml-2 text-gray-400" />
            </button>
          </div>

          {/* Mini Calendar */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {miniCalDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => changeMiniMonth("prev")}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-600"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => changeMiniMonth("next")}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-600"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            {/* Weekdays */}
            <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-gray-500 mb-1">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>
            {/* Days grid */}
            <div className="grid grid-cols-7 text-center gap-y-1">
              {miniCalMonthDays.map(({ date, isCurrentMonth }, idx) => {
                const isSelected = date.toDateString() === currentDate.toDateString();
                const isToday = date.toDateString() === new Date(2026, 7, 4).toDateString();

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentDate(date);
                      setMiniCalDate(date);
                    }}
                    className={`h-7 w-7 text-xs flex items-center justify-center rounded-full transition ${
                      isSelected
                        ? "bg-[#1a73e8] text-white font-bold"
                        : isToday
                        ? "border border-[#1a73e8] text-[#1a73e8] font-bold"
                        : isCurrentMonth
                        ? "text-gray-800 hover:bg-gray-100"
                        : "text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search People */}
          <div className="relative flex items-center bg-gray-100 rounded-lg px-2.5 py-1.5">
            <SearchIcon size={14} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search for people"
              className="bg-transparent outline-none text-xs w-full placeholder-gray-500"
            />
          </div>

          {/* Booking Pages */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Booking pages</span>
              <button className="text-gray-500 hover:text-gray-700">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* My Calendars */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">My calendars</span>
            <div className="space-y-1 mt-1.5">
              {(["shubha", "Birthdays", "Tasks"] as const).map((cal) => (
                <label key={cal} className="flex items-center gap-3 py-1 px-1.5 hover:bg-gray-50 rounded-md cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeCalendars[cal]}
                    onChange={(e) =>
                      setActiveCalendars((prev) => ({ ...prev, [cal]: e.target.checked }))
                    }
                    className="accent-[#1a73e8] h-4.5 w-4.5 rounded"
                  />
                  <span className="text-sm text-gray-700 capitalize">{cal}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Other Calendars */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Other calendars</span>
              <button className="text-gray-500 hover:text-gray-700">
                <Plus size={16} />
              </button>
            </div>
            <label className="flex items-center gap-3 py-1 px-1.5 hover:bg-gray-50 rounded-md cursor-pointer mt-1.5">
              <input
                type="checkbox"
                checked={activeCalendars.Holidays}
                onChange={(e) =>
                  setActiveCalendars((prev) => ({ ...prev, Holidays: e.target.checked }))
                }
                className="accent-[#d93025] h-4.5 w-4.5 rounded"
              />
              <span className="text-sm text-gray-700">Holidays in India</span>
            </label>
          </div>
        </aside>

        {/* ─── MAIN CALENDAR DISPLAY PANELS ─── */}
        <main className="flex-1 flex flex-col min-w-0 bg-white">
          
          {/* ──────────────────────────────────────────────────────────────── */}
          {/* DAY VIEW */}
          {/* ──────────────────────────────────────────────────────────────── */}
          {activeView === "day" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Day header */}
              <div className="flex border-b border-gray-200 shrink-0">
                <div className="w-16 shrink-0 border-r border-gray-200 flex items-end justify-center pb-2 text-[10px] font-semibold text-gray-500">
                  {timezone}
                </div>
                <div className="flex-1 py-3 pl-4 flex flex-col items-start">
                  <span className="text-xs font-bold text-gray-500 tracking-wider">
                    {currentDate.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()}
                  </span>
                  <span className="text-2xl font-semibold text-gray-800 mt-1">
                    {currentDate.getDate()}
                  </span>
                </div>
              </div>

              {/* Day grid */}
              <div className="flex-1 overflow-y-auto flex">
                <div className="w-16 shrink-0 border-r border-gray-200 select-none">
                  {Array.from({ length: 24 }).map((_, hour) => (
                    <div key={hour} className="h-14 -mt-2 text-right pr-2.5 text-[10px] font-medium text-gray-500">
                      {hour === 0 ? "" : `${hour % 12 || 12} ${hour >= 12 ? "PM" : "AM"}`}
                    </div>
                  ))}
                </div>

                <div className="flex-1 relative divide-y divide-gray-100 bg-white">
                  {Array.from({ length: 24 }).map((_, hour) => (
                    <div
                      key={hour}
                      onClick={() => {
                        setModalForm((prev) => ({
                          ...prev,
                          date: formatDateString(currentDate),
                          startHour: hour,
                          endHour: hour + 1,
                        }));
                        setIsEventModalOpen(true);
                      }}
                      className="h-14 border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer"
                    />
                  ))}

                  {filteredEvents
                    .filter((ev) => ev.date === formatDateString(currentDate))
                    .map((ev) => {
                      const startOffset = ev.startHour * 56 + (ev.startMin / 60) * 56;
                      const duration = (ev.endHour - ev.startHour) * 56 + ((ev.endMin - ev.startMin) / 60) * 56;
                      const styleColor = CATEGORY_COLORS[ev.category];

                      return (
                        <div
                          key={ev.id}
                          className={`absolute left-4 right-12 rounded-md p-2 shadow-xs cursor-pointer flex flex-col justify-between overflow-hidden text-xs transition-all hover:shadow-md ${styleColor.bg} ${styleColor.border} ${styleColor.text}`}
                          style={{ top: `${startOffset}px`, height: `${Math.max(24, duration)}px`, zIndex: 10 }}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-semibold truncate">{ev.title}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id); }}
                              className="text-gray-500 hover:text-red-600 transition shrink-0 p-0.5"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────── */}
          {/* WEEK VIEW */}
          {/* ──────────────────────────────────────────────────────────────── */}
          {activeView === "week" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Days headers row */}
              <div className="flex border-b border-gray-200 shrink-0">
                <div className="w-16 shrink-0 border-r border-gray-200 flex items-end justify-center pb-2 text-[10px] font-semibold text-gray-500">
                  {timezone}
                </div>
                
                <div className="flex-1 grid grid-cols-7">
                  {weekDays.map((day, idx) => {
                    const isToday = day.toDateString() === new Date(2026, 7, 4).toDateString();
                    const dayName = day.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();

                    return (
                      <div key={idx} className="flex flex-col items-center py-2 border-r border-gray-100 last:border-0">
                        <span className="text-[11px] font-bold text-gray-500 tracking-wider mb-1">{dayName}</span>
                        <button
                          onClick={() => {
                            setCurrentDate(day);
                            setMiniCalDate(day);
                          }}
                          className={`h-9 w-9 flex items-center justify-center rounded-full text-lg font-semibold transition ${
                            isToday ? "bg-[#1a73e8] text-white" : "text-gray-800 hover:bg-gray-100"
                          }`}
                        >
                          {day.getDate()}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Time grid panel */}
              <div className="flex-1 overflow-y-auto min-h-0 flex">
                <div className="w-16 shrink-0 border-r border-gray-200 bg-white select-none">
                  {Array.from({ length: 24 }).map((_, hour) => {
                    if (hour === 0) return <div key={hour} className="h-14" />;
                    return (
                      <div key={hour} className="h-14 -mt-2 text-right pr-2.5 text-[10px] font-medium text-gray-500">
                        {hour % 12 || 12} {hour >= 12 ? "PM" : "AM"}
                      </div>
                    );
                  })}
                </div>

                <div className="flex-1 grid grid-cols-7 relative divide-x divide-gray-100 bg-white">
                  {weekDays.map((day, colIdx) => {
                    const dateStr = formatDateString(day);
                    const dayEvents = filteredEvents.filter((ev) => ev.date === dateStr);

                    return (
                      <div key={colIdx} className="relative h-[1344px] group/col">
                        {Array.from({ length: 24 }).map((_, rowIdx) => (
                          <div
                            key={rowIdx}
                            onClick={() => {
                              setModalForm((prev) => ({
                                ...prev,
                                date: dateStr,
                                startHour: rowIdx,
                                endHour: rowIdx + 1,
                              }));
                              setIsEventModalOpen(true);
                            }}
                            className="h-14 border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer"
                          />
                        ))}

                        {dayEvents.map((ev) => {
                          const startOffset = ev.startHour * 56 + (ev.startMin / 60) * 56;
                          const duration = (ev.endHour - ev.startHour) * 56 + ((ev.endMin - ev.startMin) / 60) * 56;
                          const styleColor = CATEGORY_COLORS[ev.category];

                          return (
                            <div
                              key={ev.id}
                              className={`absolute left-1 right-1 rounded-md p-1.5 shadow-xs cursor-pointer flex flex-col justify-between overflow-hidden text-xs select-none transition-all hover:shadow-md ${styleColor.bg} ${styleColor.border} ${styleColor.text}`}
                              style={{ top: `${startOffset}px`, height: `${Math.max(24, duration)}px`, zIndex: 10 }}
                            >
                              <div className="flex justify-between items-start">
                                <span className="font-semibold truncate pr-1">{ev.title}</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id); }}
                                  className="opacity-0 group-hover/col:opacity-100 hover:text-red-600 transition shrink-0 p-0.5 rounded"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────── */}
          {/* MONTH VIEW */}
          {/* ──────────────────────────────────────────────────────────────── */}
          {activeView === "month" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-gray-200 shrink-0 text-center py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>

              {/* Month grid days */}
              <div className="flex-1 grid grid-cols-7 grid-rows-6 divide-x divide-y divide-gray-200">
                {monthViewDays.map((day, idx) => {
                  const dateStr = formatDateString(day);
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isToday = day.toDateString() === new Date(2026, 7, 4).toDateString();
                  const dayEvents = filteredEvents.filter((ev) => ev.date === dateStr);

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setModalForm((prev) => ({
                          ...prev,
                          date: dateStr,
                          startHour: 9,
                          endHour: 10,
                        }));
                        setIsEventModalOpen(true);
                      }}
                      className="p-1 min-h-0 flex flex-col hover:bg-gray-50 cursor-pointer overflow-hidden transition"
                    >
                      <div className="flex justify-center mb-1">
                        <span
                          className={`text-xs h-6 w-6 flex items-center justify-center rounded-full font-semibold ${
                            isToday
                              ? "bg-[#1a73e8] text-white"
                              : isCurrentMonth
                              ? "text-gray-800"
                              : "text-gray-400"
                          }`}
                        >
                          {day.getDate()}
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-0.5 pr-0.5">
                        {dayEvents.map((ev) => {
                          const styleColor = CATEGORY_COLORS[ev.category];
                          return (
                            <div
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEvent(ev.id);
                              }}
                              className={`text-[10px] truncate px-1 py-0.5 rounded leading-tight font-medium ${styleColor.bg} ${styleColor.text}`}
                              title={ev.title}
                            >
                              {ev.title}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ─── EVENT DIALOG MODAL ─── */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl border w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-800 text-sm">Add Event</h3>
              <button onClick={() => setIsEventModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="Add title"
                  value={modalForm.title}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Date</label>
                  <input
                    type="date"
                    required
                    value={modalForm.date}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Category</label>
                  <select
                    value={modalForm.category}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, category: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none"
                  >
                    <option value="shubha">shubha</option>
                    <option value="Birthdays">Birthdays</option>
                    <option value="Tasks">Tasks</option>
                    <option value="Holidays">Holidays in India</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Start Time</label>
                  <div className="flex gap-1">
                    <select
                      value={modalForm.startHour}
                      onChange={(e) => setModalForm((prev) => ({ ...prev, startHour: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs outline-none"
                    >
                      {Array.from({ length: 24 }).map((_, h) => (
                        <option key={h} value={h}>
                          {h % 12 || 12} {h >= 12 ? "PM" : "AM"}
                        </option>
                      ))}
                    </select>
                    <select
                      value={modalForm.startMin}
                      onChange={(e) => setModalForm((prev) => ({ ...prev, startMin: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs outline-none"
                    >
                      <option value={0}>00</option>
                      <option value={15}>15</option>
                      <option value={30}>30</option>
                      <option value={45}>45</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">End Time</label>
                  <div className="flex gap-1">
                    <select
                      value={modalForm.endHour}
                      onChange={(e) => setModalForm((prev) => ({ ...prev, endHour: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs outline-none"
                    >
                      {Array.from({ length: 24 }).map((_, h) => (
                        <option key={h} value={h}>
                          {h % 12 || 12} {h >= 12 ? "PM" : "AM"}
                        </option>
                      ))}
                    </select>
                    <select
                      value={modalForm.endMin}
                      onChange={(e) => setModalForm((prev) => ({ ...prev, endMin: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs outline-none"
                    >
                      <option value={0}>00</option>
                      <option value={15}>15</option>
                      <option value={30}>30</option>
                      <option value={45}>45</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-xs hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#1a73e8] text-white rounded-md text-xs font-semibold">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── SETTINGS MODAL ─── */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl border w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <SettingsIcon size={16} />
                <span>Calendar Settings</span>
              </h3>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Calendar Name</label>
                <input
                  type="text"
                  value={calendarName}
                  onChange={(e) => setCalendarName(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Timezone / Format</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm outline-none"
                >
                  <option value="GMT+05:30">GMT+05:30 (India Standard Time)</option>
                  <option value="GMT-08:00">GMT-08:00 (Pacific Standard Time)</option>
                  <option value="GMT+00:00">GMT+00:00 (Greenwich Mean Time)</option>
                  <option value="GMT+09:00">GMT+09:00 (Japan Standard Time)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-3">
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-1.5 bg-[#1a73e8] text-white rounded-md text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── UPGRADE MODAL ─── */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl border w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4 text-center">
            <div className="w-12 h-12 bg-blue-100 text-[#1a73e8] flex items-center justify-center rounded-full mx-auto mb-2">
              <Globe size={24} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">Upgrade to Premium</h3>
            <p className="text-sm text-gray-500">
              Get unlimited calendars, video meeting integrations, booking pages, and premium support for your organization.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg border text-sm font-semibold text-[#1a73e8]">
              $5.99 / user / month
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="px-4 py-2 border rounded-md text-xs hover:bg-gray-50"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  alert("Thank you for subscribing to Google Calendar Premium!");
                  setIsUpgradeModalOpen(false);
                }}
                className="px-4 py-2 bg-[#1a73e8] text-white rounded-md text-xs font-semibold"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import { Outlet, NavLink } from "react-router-dom";
import { Users, Star, Network, Settings, Building2, Sun, Moon } from "lucide-react";
import { useStore } from "../store/useStore";
import GlobalSearch from "./GlobalSearch";

export default function Layout() {
  const { isDarkMode, toggleDarkMode } = useStore();
  const navItems = [
    { to: "/", icon: Users, label: "조직도" },
    { to: "/favorites", icon: Star, label: "즐겨찾기" },
    { to: "/org-chart", icon: Network, label: "마인드맵" },
    { to: "/admin", icon: Settings, label: "관리자" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors flex flex-col md:flex-row">
      {/* PC Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 fixed h-full z-10 transition-colors">
        <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-teal-50 dark:bg-teal-900/30 p-2 rounded-lg text-teal-600 dark:text-teal-400">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">스마트조직도</h1>
          </div>
        </div>
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <GlobalSearch />
        </div>
        
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-medium"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-colors text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{isDarkMode ? "라이트 모드" : "다크 모드"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 relative min-h-screen flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
          <div className="flex-1">
            <GlobalSearch />
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 shrink-0"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="flex-1">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-around p-2 pb-safe z-50 transition-colors">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-lg min-w-[64px] transition-colors ${
                isActive ? "text-teal-600 dark:text-teal-400" : "text-slate-400 dark:text-slate-500"
              }`
            }
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

import { Outlet, NavLink } from "react-router-dom";
import { Users, Star, Network, Settings, Building2 } from "lucide-react";

export default function Layout() {
  const navItems = [
    { to: "/", icon: Users, label: "조직도" },
    { to: "/favorites", icon: Star, label: "즐겨찾기" },
    { to: "/org-chart", icon: Network, label: "마인드맵" },
    { to: "/admin", icon: Settings, label: "관리자" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* PC Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-teal-50 p-2 rounded-lg text-teal-600">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="font-semibold text-slate-800 text-lg">남양주 스마트조직도</h1>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-teal-50 text-teal-700 font-medium"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 pb-safe z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-lg min-w-[64px] ${
                isActive ? "text-teal-600" : "text-slate-400"
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

import { Store, Package, BarChart3, Users, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  userRole: "admin" | "cashier";
  userName: string;
  onLogout: () => void;
}

export function Sidebar({ activeMenu, onMenuChange, userRole, userName, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: "pos", label: "Kasir", icon: Store, allowCashier: true },
    { id: "inventory", label: "Inventori", icon: Package, allowCashier: false },
    { id: "sales", label: "Riwayat Penjualan", icon: BarChart3, allowCashier: true },
    { id: "reports", label: "Laporan", icon: BarChart3, allowCashier: false },
    { id: "users", label: "Pengguna", icon: Users, allowCashier: false },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => userRole === "admin" || item.allowCashier
  );

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-blue-600 to-blue-800 text-white z-50 transition-all duration-300 ${
          collapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "w-64"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-blue-500 flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold">POS System</h1>
              <p className="text-xs text-blue-200">Sistem Kasir Toko</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors lg:block hidden"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-blue-500">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{userName}</p>
                <p className="text-xs text-blue-200">
                  {userRole === "admin" ? "Administrator" : "Kasir"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onMenuChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-white text-blue-600 shadow-lg"
                        : "hover:bg-blue-700 text-white"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-500">
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 lg:hidden z-30 bg-blue-600 text-white p-3 rounded-full shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
}

// src/app/components/mobile-nav.tsx
import React from "react";
import { Store, BarChart3, Menu } from "lucide-react";

interface MobileNavProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  onOpenDrawer: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeMenu, onMenuChange, onOpenDrawer }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 md:hidden">
      <button
        onClick={() => onMenuChange("pos")}
        className={`flex flex-col items-center ${activeMenu === "pos" ? "text-[#E05D43]" : "text-gray-500"}`}
      >
        <Store className="w-5 h-5" />
        <span className="text-xs">Kasir</span>
      </button>
      <button
        onClick={() => onMenuChange("sales")}
        className={`flex flex-col items-center ${activeMenu === "sales" ? "text-[#E05D43]" : "text-gray-500"}`}
      >
        <BarChart3 className="w-5 h-5" />
        <span className="text-xs">Penjualan</span>
      </button>
      <button onClick={onOpenDrawer} className="text-gray-500">
        <Menu className="w-5 h-5" />
      </button>
    </nav>
  );
};

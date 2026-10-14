import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Boxes,
  TrendingUp,
  BookOpen,
  Receipt,
  FileBarChart,
  Users,
  Settings,
  Code2,
  Cloud,
} from 'lucide-react';
import { AppSettings } from '../types';
import { translations } from '../i18n/translations';
import { themes } from '../theme/themes';

export type TabId =
  | 'dashboard'
  | 'sales'
  | 'products'
  | 'purchases'
  | 'stock'
  | 'profit_loss'
  | 'ledgers'
  | 'expenses'
  | 'reports'
  | 'owners'
  | 'cloud_sync'
  | 'android_studio'
  | 'settings';

interface Props {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  settings: AppSettings;
  lowStockCount: number;
}

export const Navigation: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  settings,
  lowStockCount,
}) => {
  const t = translations[settings.language];
  const currentTheme = themes[settings.theme] || themes.black_gold;

  const navItems = [
    { id: 'dashboard' as TabId, label: t.navDashboard, icon: LayoutDashboard },
    { id: 'sales' as TabId, label: t.navSales, icon: ShoppingCart },
    { id: 'products' as TabId, label: t.navProducts, icon: Package },
    { id: 'purchases' as TabId, label: t.navPurchases, icon: Truck },
    {
      id: 'stock' as TabId,
      label: t.navStock,
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
    },
    { id: 'profit_loss' as TabId, label: t.navProfitLoss, icon: TrendingUp },
    { id: 'ledgers' as TabId, label: t.navCustomers, icon: BookOpen },
    { id: 'expenses' as TabId, label: t.navExpenses, icon: Receipt },
    { id: 'reports' as TabId, label: t.navReports, icon: FileBarChart },
    { id: 'owners' as TabId, label: t.navOwners, icon: Users },
    { id: 'cloud_sync' as TabId, label: t.navCloudSync, icon: Cloud },
    { id: 'android_studio' as TabId, label: t.navAndroidStudio, icon: Code2 },
    { id: 'settings' as TabId, label: t.navSettings, icon: Settings },
  ];

  return (
    <nav className={`border-b ${currentTheme.cardBorder} ${currentTheme.cardBg} no-print sticky top-[57px] z-30 shadow-sm backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Horizontal scrollable nav items */}
        <div className="flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-150 relative ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-600 text-[10px] font-bold text-white shadow">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

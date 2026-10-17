import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  ShoppingCart,
  Truck,
  Receipt,
  Users,
  Building2,
  Calendar,
  ArrowUpRight,
  ShieldAlert,
  Printer,
  Target,
  Edit3,
  Check,
  PlusCircle,
} from 'lucide-react';
import { AppSettings, BeltProduct, SaleItem } from '../types';
import { translations } from '../i18n/translations';
import { themes } from '../theme/themes';
import { db } from '../db/database';

interface Props {
  settings: AppSettings;
  onNavigate: (tab: any) => void;
  onViewInvoice: (sale: SaleItem) => void;
  onCreatePurchaseOrder?: (productId: string) => void;
}

export const DashboardView: React.FC<Props> = ({
  settings,
  onNavigate,
  onViewInvoice,
  onCreatePurchaseOrder,
}) => {
  const t = translations[settings.language];
  const currentTheme = themes[settings.theme] || themes.black_gold;
  const stats = db.getDashboardStats();
  const recentSales = db.getSales().slice(0, 5);

  // Auto-Purchase Suggestions logic: Identify items under minimum stock levels
  const isAutoPurchaseEnabled = settings.autoPurchaseSuggestions !== false;
  const lowStockThreshold = settings.lowStockThreshold || 10;
  const itemsUnderMinimumStock = React.useMemo(() => {
    return db.getProducts().filter(
      (p) => p.availableQuantity <= (p.minStockLevel || lowStockThreshold)
    );
  }, [lowStockThreshold]);
  const [isEditingTarget, setIsEditingTarget] = React.useState(false);
  const [targetInput, setTargetInput] = React.useState<number>(settings.dailySalesTarget || 50000);
  const [currentTarget, setCurrentTarget] = React.useState<number>(settings.dailySalesTarget || 50000);

  const handleSaveTarget = () => {
    const valid = Number(targetInput);
    if (!isNaN(valid) && valid > 0) {
      db.updateSettings({ dailySalesTarget: valid });
      setCurrentTarget(valid);
      setIsEditingTarget(false);
    }
  };

  const formatPKR = (amount: number) => {
    return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner / Overview */}
      <div className={`p-4 sm:p-6 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-lg relative overflow-hidden`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                SAQIB Leather Hub
              </span>
              <span className="text-neutral-500">·</span>
              <span className="text-xs text-neutral-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 font-brand">
              Welcome, <span className="text-amber-400">{settings.currentOwner}</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Partners: Saqib (Admin) · Adil (Managing) · Javaid (Operations) · Currency: PKR
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('sales')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-neutral-950" />
              <span>{t.newSale}</span>
            </button>
            <button
              onClick={() => onNavigate('purchases')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-500/40 bg-neutral-900/80 hover:bg-neutral-800 text-amber-300 font-semibold text-xs transition-all active:scale-95 cursor-pointer"
            >
              <Truck className="w-4 h-4 text-amber-400" />
              <span>{t.newPurchase}</span>
            </button>
            <button
              onClick={() => onNavigate('expenses')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 font-medium text-xs transition-all active:scale-95 cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-neutral-400" />
              <span>{t.addExpense}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Notification System for Low-Stock Items with Direct Purchase Order Links */}
      {stats.lowStockAlertsCount > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl border border-red-500/50 bg-gradient-to-r from-red-950/70 via-neutral-900 to-red-950/60 text-red-200 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-900/60 text-red-300 border border-red-500/40 shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-red-100 font-brand">
                    {settings.autoPurchaseSuggestions !== false
                      ? '⚡ Auto-Purchase Suggestions: Low Stock Alert'
                      : 'Low Stock Alert Notification'}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-red-800 text-white font-mono text-[10px] font-bold">
                    {stats.lowStockAlertsCount} Belts Critical
                  </span>
                  {settings.autoPurchaseSuggestions !== false && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                      Auto-Purchase Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-red-300/80 mt-0.5">
                  The following belt models are below their minimum stock level. Use 1-click generation to initiate draft purchase orders immediately:
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
              {stats.lowStockAlerts.length > 0 && onCreatePurchaseOrder && (
                <button
                  type="button"
                  onClick={() => onCreatePurchaseOrder(stats.lowStockAlerts[0].id)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs whitespace-nowrap shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4 text-neutral-950" />
                  <span>1-Click Draft PO ({stats.lowStockAlerts[0].code})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigate('purchases')}
                className="px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs whitespace-nowrap shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Truck className="w-4 h-4" />
                <span>Open Purchases</span>
              </button>
            </div>
          </div>

          {/* Low Stock Product Badges with Direct Purchase Order Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 border-t border-red-900/50">
            {stats.lowStockAlerts.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/80 border border-red-500/30 hover:border-red-400 transition-colors shadow-sm"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-amber-300 text-xs">{item.code}</span>
                    <span className="text-[10px] text-red-400 font-bold bg-red-950 px-1.5 py-0.5 rounded">
                      {item.availableQuantity} left (Min: {item.minStockLevel})
                    </span>
                  </div>
                  <div className="text-xs text-neutral-200 truncate font-medium mt-0.5">{item.name}</div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onCreatePurchaseOrder) {
                      onCreatePurchaseOrder(item.id);
                    } else {
                      onNavigate('purchases');
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[11px] font-bold shrink-0 flex items-center gap-1 shadow cursor-pointer transition-all active:scale-95"
                  title={`Create Purchase Order for ${item.name}`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Restock Order</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Sales Target Progress Bar Feature */}
      {(() => {
        const targetGoal = currentTarget > 0 ? currentTarget : 50000;
        const currentSales = stats.todaySalesRevenue;
        const percentage = Math.min(100, Math.round((currentSales / targetGoal) * 100));
        const remainingToGoal = Math.max(0, targetGoal - currentSales);
        const isGoalAchieved = currentSales >= targetGoal;

        return (
          <div className={`p-4 sm:p-5 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-md space-y-3`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-neutral-100 font-brand">
                      Daily Sales Target
                    </h3>
                    {isGoalAchieved ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px]">
                        🎉 Target Achieved!
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 text-[10px] font-mono">
                        {percentage}% Completed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400">
                    Track daily gross belt sales progress against your defined revenue goal
                  </p>
                </div>
              </div>

              {/* Target Editing Control */}
              <div className="flex items-center gap-2">
                {isEditingTarget ? (
                  <div className="flex items-center gap-1.5">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-[11px] text-neutral-500 font-mono">Rs.</span>
                      <input
                        type="number"
                        min="1000"
                        step="1000"
                        value={targetInput}
                        onChange={(e) => setTargetInput(Number(e.target.value))}
                        className="w-32 pl-8 pr-2 py-1 bg-neutral-950 border border-amber-500 rounded-lg text-xs font-mono font-bold text-amber-400 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleSaveTarget}
                      className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 cursor-pointer"
                      title="Save Goal"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsEditingTarget(false)}
                      className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setTargetInput(currentTarget);
                      setIsEditingTarget(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-amber-500/50 text-neutral-300 hover:text-amber-300 text-xs cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Set Daily Goal</span>
                  </button>
                )}
              </div>
            </div>

            {/* Target Numbers Breakdown */}
            <div className="flex flex-wrap items-center justify-between text-xs gap-2 pt-1 font-mono">
              <div>
                <span className="text-neutral-400">Today&apos;s Revenue: </span>
                <span className="font-bold text-neutral-100 text-sm">
                  {formatPKR(currentSales)}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Target Goal: </span>
                <span className="font-bold text-amber-400 text-sm">
                  {formatPKR(targetGoal)}
                </span>
              </div>
              <div>
                {remainingToGoal > 0 ? (
                  <span className="text-neutral-400">
                    Remaining: <strong className="text-orange-400">{formatPKR(remainingToGoal)}</strong>
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold">
                    Target Exceeded by {formatPKR(currentSales - targetGoal)}
                  </span>
                )}
              </div>
            </div>

            {/* Custom Luxury Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-3.5 bg-neutral-950 rounded-full overflow-hidden p-0.5 border border-neutral-800 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isGoalAchieved
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 shadow-lg shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 shadow-lg shadow-amber-500/30'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>Rs. 0</span>
                <span>{percentage}% Achieved</span>
                <span>{formatPKR(targetGoal)}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Primary KPI Grid (10 Key Figures from database) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Sales */}
        <div className={`p-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm`}>
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">{t.todaySales}</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-neutral-100 font-mono">
            {formatPKR(stats.todaySalesRevenue)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 flex items-center justify-between">
            <span>Gross: {formatPKR(stats.todayGrossProfit)}</span>
          </div>
        </div>

        {/* Today's Profit */}
        <div className={`p-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm`}>
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">{t.todayProfit}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-lg sm:text-xl font-bold font-mono ${stats.todayNetProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatPKR(stats.todayNetProfit)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            After expenses: {formatPKR(stats.todayExpenses)}
          </div>
        </div>

        {/* Monthly Sales */}
        <div className={`p-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm`}>
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">{t.monthlySales}</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-neutral-100 font-mono">
            {formatPKR(stats.monthlySalesRevenue)}
          </div>
          <div className="text-[11px] text-sky-300/70 mt-1">
            This Month
          </div>
        </div>

        {/* Monthly Profit */}
        <div className={`p-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm`}>
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">{t.monthlyProfit}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-lg sm:text-xl font-bold font-mono ${stats.monthlyNetProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatPKR(stats.monthlyNetProfit)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Monthly Exp: {formatPKR(stats.monthlyExpenses)}
          </div>
        </div>

        {/* Total Stock */}
        <div className={`p-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm`}>
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">{t.totalStockUnits}</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-neutral-100 font-mono">
            {stats.totalStock} <span className="text-xs font-normal text-neutral-400">{t.units}</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Valuation: {formatPKR(stats.stockValuation)}
          </div>
        </div>

        {/* Total Purchases */}
        <div className={`p-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm`}>
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">{t.totalPurchases}</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-neutral-100 font-mono">
            {formatPKR(stats.totalPurchases)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Inventory Inward
          </div>
        </div>

        {/* Business Expenses */}
        <div className={`p-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm`}>
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">{t.businessExpenses}</span>
            <Receipt className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-neutral-100 font-mono">
            {formatPKR(stats.totalExpenses)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Rent, Utility, Salary, Misc
          </div>
        </div>

        {/* Low-Stock Alerts Count */}
        <div className={`p-4 rounded-xl border ${stats.lowStockAlertsCount > 0 ? 'border-amber-500/50 bg-amber-950/20' : currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm`}>
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">{t.lowStockAlerts}</span>
            <AlertTriangle className={`w-4 h-4 ${stats.lowStockAlertsCount > 0 ? 'text-amber-400 animate-pulse' : 'text-neutral-500'}`} />
          </div>
          <div className="text-lg sm:text-xl font-bold text-neutral-100 font-mono">
            {stats.lowStockAlertsCount} <span className="text-xs font-normal text-neutral-400">items</span>
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">
            {stats.lowStockAlertsCount > 0 ? 'Action required' : 'Stock healthy'}
          </div>
        </div>
      </div>

      {/* Customer & Supplier Outstanding Balances (Ledgers) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Balances (Receivables / Udhar) */}
        <div className={`p-4 sm:p-5 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-100">{t.customerOutstanding}</h3>
                <p className="text-xs text-neutral-400">Total Udhar owed by retail customers</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('ledgers')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-0.5"
            >
              <span>View Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {formatPKR(stats.customerOutstanding)}
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Money to be collected from customers on credit sales.
          </p>
        </div>

        {/* Supplier Balances (Payables) */}
        <div className={`p-4 sm:p-5 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-100">{t.supplierOutstanding}</h3>
                <p className="text-xs text-neutral-400">Total payable to tanneries &amp; hardware suppliers</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('ledgers')}
              className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-0.5"
            >
              <span>View Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl font-bold text-orange-400 font-mono">
            {formatPKR(stats.supplierOutstanding)}
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Pending bills to Leather Tanneries &amp; Buckle suppliers.
          </p>
        </div>
      </div>

      {/* Recent Sales Ledger Table with instant Receipt preview */}
      <div className={`p-4 sm:p-5 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-neutral-100">{t.recentSales}</h3>
            <p className="text-xs text-neutral-400">Latest retail transactions &amp; receipts</p>
          </div>
          <button
            onClick={() => onNavigate('sales')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            Go to POS →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-medium">
                <th className="pb-2.5">Invoice #</th>
                <th className="pb-2.5">Date</th>
                <th className="pb-2.5">Customer</th>
                <th className="pb-2.5">Belt Item</th>
                <th className="pb-2.5 text-center">Qty</th>
                <th className="pb-2.5 text-right">Total</th>
                <th className="pb-2.5 text-right">Paid</th>
                <th className="pb-2.5 text-right">Due</th>
                <th className="pb-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-sans">
              {recentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="py-2.5 font-mono text-amber-400 font-semibold">{sale.invoiceNumber}</td>
                  <td className="py-2.5 text-neutral-400">{sale.saleDate}</td>
                  <td className="py-2.5 text-neutral-200 font-medium">{sale.customerName}</td>
                  <td className="py-2.5 text-neutral-300">{sale.productName}</td>
                  <td className="py-2.5 text-center font-bold text-neutral-200">{sale.quantity}</td>
                  <td className="py-2.5 text-right font-mono text-neutral-100 font-semibold">{formatPKR(sale.totalAmount)}</td>
                  <td className="py-2.5 text-right font-mono text-emerald-400">{formatPKR(sale.amountReceived)}</td>
                  <td className="py-2.5 text-right font-mono text-amber-400">
                    {sale.remainingBalance > 0 ? formatPKR(sale.remainingBalance) : <span className="text-neutral-500 font-normal">Cleared</span>}
                  </td>
                  <td className="py-2.5 text-center">
                    <button
                      onClick={() => onViewInvoice(sale)}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer"
                      title="View & Print Invoice"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  AlertCircle,
  HelpCircle,
  Receipt,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { AppSettings } from '../types';
import { translations } from '../i18n/translations';
import { themes } from '../theme/themes';
import { db } from '../db/database';

interface Props {
  settings: AppSettings;
}

export const ProfitLossView: React.FC<Props> = ({ settings }) => {
  const t = translations[settings.language];
  const currentTheme = themes[settings.theme] || themes.black_gold;

  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('monthly');

  const pl = db.calculateProfitLoss(period);

  const formatPKR = (val: number) => `Rs. ${Math.round(val).toLocaleString('en-PK')}`;

  return (
    <div className="space-y-6">
      {/* Title & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 font-brand">
            {t.plTitle}
          </h2>
          <p className="text-xs text-neutral-400">
            Real GAAP Net Profit using locked weighted average cost basis per invoice
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
          <button
            onClick={() => setPeriod('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              period === 'daily' ? 'bg-amber-500 text-neutral-950 shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t.filterDaily}
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              period === 'weekly' ? 'bg-amber-500 text-neutral-950 shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t.filterWeekly}
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              period === 'monthly' ? 'bg-amber-500 text-neutral-950 shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t.filterMonthly}
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              period === 'all' ? 'bg-amber-500 text-neutral-950 shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t.filterCustom}
          </button>
        </div>
      </div>

      {/* Explanatory Note on Weighted Average Costing */}
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 text-xs text-amber-200/90 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300 font-bold">Accounting Rule Compliance:</strong>{' '}
          {t.weightedAvgExplanation} Total sales revenue is strictly recognized as gross receipts.
          Net profit represents actual earnings after subtracting Cost of Goods Sold (COGS), discounts, damaged write-offs, and shop operating expenses.
        </div>
      </div>

      {/* Main Profit Metrics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Sales Revenue */}
        <div className={`p-5 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-1`}>
          <span className="text-xs text-neutral-400">Total Sales Revenue ({pl.salesCount} Invoices)</span>
          <div className="text-2xl font-bold font-mono text-neutral-100">
            {formatPKR(pl.totalSalesRevenue)}
          </div>
          <div className="text-[11px] text-neutral-400 pt-1 flex justify-between">
            <span>Sold: {pl.totalItemsSold} belts</span>
            <span>Discounts: {formatPKR(pl.totalDiscountsGiven)}</span>
          </div>
        </div>

        {/* Gross Profit */}
        <div className={`p-5 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-1`}>
          <span className="text-xs text-neutral-400">{t.grossProfit} (Revenue - COGS)</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {formatPKR(pl.grossProfit)}
          </div>
          <div className="text-[11px] text-emerald-300/80 pt-1 flex justify-between">
            <span>Gross Margin: {pl.grossMarginPercent.toFixed(1)}%</span>
            <span>COGS: {formatPKR(pl.costOfGoodsSold)}</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className={`p-5 rounded-xl border ${pl.netProfit >= 0 ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-red-500/50 bg-red-950/20'} shadow-sm space-y-1`}>
          <span className="text-xs text-neutral-300">{t.netProfit} (Gross Profit - Expenses)</span>
          <div className={`text-2xl font-bold font-mono ${pl.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatPKR(pl.netProfit)}
          </div>
          <div className="text-[11px] text-neutral-400 pt-1 flex justify-between">
            <span>Net Margin: {pl.netMarginPercent.toFixed(1)}%</span>
            <span>Expenses: {formatPKR(pl.totalBusinessExpenses)}</span>
          </div>
        </div>
      </div>

      {/* Itemized P&L Waterfall Table */}
      <div className={`p-5 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-4`}>
        <h3 className="font-brand font-bold text-base text-neutral-100">Financial Statement Breakdown</h3>

        <div className="divide-y divide-neutral-800 text-xs">
          {/* 1. Gross Revenue */}
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="font-semibold text-neutral-200">Total Belt Sales (Gross Revenue)</span>
              <p className="text-[11px] text-neutral-400">Total counter bill receipts for selected period</p>
            </div>
            <span className="font-mono font-bold text-neutral-100">{formatPKR(pl.totalSalesRevenue + pl.totalDiscountsGiven)}</span>
          </div>

          {/* 2. Customer Discounts */}
          <div className="py-2.5 flex items-center justify-between text-amber-400">
            <div>
              <span>Less: Customer Discounts Allowed</span>
              <p className="text-[11px] text-neutral-500">Retail concessions given at POS</p>
            </div>
            <span className="font-mono">- {formatPKR(pl.totalDiscountsGiven)}</span>
          </div>

          {/* 3. Net Sales Revenue */}
          <div className="py-2.5 flex items-center justify-between font-semibold text-neutral-100 bg-neutral-900/40 px-2 rounded">
            <span>Net Sales Revenue</span>
            <span className="font-mono">{formatPKR(pl.totalSalesRevenue)}</span>
          </div>

          {/* 4. Cost of Goods Sold (COGS) */}
          <div className="py-2.5 flex items-center justify-between text-orange-400">
            <div>
              <span>Less: Cost of Goods Sold (COGS)</span>
              <p className="text-[11px] text-neutral-500">
                Calculated from locked weighted average purchase cost of {pl.totalItemsSold} sold belts
              </p>
            </div>
            <span className="font-mono">- {formatPKR(pl.costOfGoodsSold)}</span>
          </div>

          {/* 5. Gross Profit */}
          <div className="py-2.5 flex items-center justify-between font-bold text-emerald-400 bg-neutral-900/60 px-2 rounded">
            <span>Gross Profit</span>
            <span className="font-mono">{formatPKR(pl.grossProfit)}</span>
          </div>

          {/* 6. Operating Expenses */}
          <div className="py-2.5 flex items-center justify-between text-red-400">
            <div>
              <span>Less: Shop Operating Expenses ({pl.expensesCount} Records)</span>
              <p className="text-[11px] text-neutral-500">Shop rent, electricity, freight cargo, packaging boxes, salaries</p>
            </div>
            <span className="font-mono">- {formatPKR(pl.totalBusinessExpenses)}</span>
          </div>

          {/* 7. Damaged Write-Off Loss */}
          {pl.totalDamagedLoss > 0 && (
            <div className="py-2.5 flex items-center justify-between text-red-400">
              <div>
                <span>Less: Damaged / Defective Stock Write-Off</span>
                <p className="text-[11px] text-neutral-500">Scratched buckles and torn leather belts removed from saleable inventory</p>
              </div>
              <span className="font-mono">- {formatPKR(pl.totalDamagedLoss)}</span>
            </div>
          )}

          {/* 8. Final Net Profit */}
          <div className="py-3 flex items-center justify-between text-sm font-bold bg-amber-500/10 px-2 rounded-lg border border-amber-500/30 text-amber-300">
            <span>Net Profit (صافی منافع)</span>
            <span className="font-mono text-base">{formatPKR(pl.netProfit)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

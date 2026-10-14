import React, { useState } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  Receipt,
  Users,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import { AppSettings } from '../types';
import { translations } from '../i18n/translations';
import { themes } from '../theme/themes';
import { db } from '../db/database';

interface Props {
  settings: AppSettings;
}

export const ReportsView: React.FC<Props> = ({ settings }) => {
  const t = translations[settings.language];
  const currentTheme = themes[settings.theme] || themes.black_gold;

  const todayStr = new Date().toISOString().slice(0, 10);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('monthly');
  const [customStart, setCustomStart] = useState<string>('2026-10-01');
  const [customEnd, setCustomEnd] = useState<string>(todayStr);

  const pl = db.calculateProfitLoss(
    reportType === 'custom' ? 'all' : reportType,
    reportType === 'custom' ? customStart : undefined,
    reportType === 'custom' ? customEnd : undefined
  );

  const stats = db.getDashboardStats();

  const handleExportCsv = () => {
    const sales = db.getSales();
    const headers = [
      'Invoice #',
      'Date',
      'Customer',
      'Phone',
      'Belt Model',
      'Code',
      'Quantity',
      'Unit Price',
      'Discount',
      'Total Amount',
      'Cost Basis',
      'Amount Received',
      'Remaining Balance',
      'Payment Method',
    ];

    const rows = sales.map((s) => [
      s.invoiceNumber,
      s.saleDate,
      `"${s.customerName}"`,
      s.customerPhone || '',
      `"${s.productName}"`,
      s.productCode,
      s.quantity,
      s.sellingPrice,
      s.discount,
      s.totalAmount,
      s.costBasis,
      s.amountReceived,
      s.remainingBalance,
      s.paymentMethod,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SAQIB_Belt_Report_${reportType}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Print / CSV Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 font-brand">
            {t.reportsTitle}
          </h2>
          <p className="text-xs text-neutral-400">
            Comprehensive business audit reports with spreadsheet export and printable PDF statement
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs shadow transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t.exportCsv}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-neutral-950" />
            <span>{t.printReport}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={`p-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} no-print space-y-3`}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setReportType('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              reportType === 'daily' ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-900 text-neutral-400'
            }`}
          >
            Today (Daily)
          </button>
          <button
            onClick={() => setReportType('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              reportType === 'weekly' ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-900 text-neutral-400'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              reportType === 'monthly' ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-900 text-neutral-400'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setReportType('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              reportType === 'custom' ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-900 text-neutral-400'
            }`}
          >
            Custom Date Range
          </button>
        </div>

        {reportType === 'custom' && (
          <div className="flex items-center gap-3 pt-2 text-xs">
            <div>
              <span className="text-neutral-400 block mb-1">From Date:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
              />
            </div>
            <div>
              <span className="text-neutral-400 block mb-1">To Date:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
              />
            </div>
          </div>
        )}
      </div>

      {/* Printable Report Document Card */}
      <div className={`p-6 sm:p-8 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} printable-invoice space-y-6 shadow-xl`}>
        {/* Business Letterhead */}
        <div className="border-b border-neutral-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-2xl font-bold font-brand text-amber-400 tracking-wider">
              {settings.businessName}
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              {settings.businessAddress} · Phone: {settings.businessPhone}
            </div>
            <div className="text-xs text-neutral-300 font-medium mt-0.5">
              Partners: Saqib · Adil · Javaid
            </div>
          </div>

          <div className="sm:text-right font-mono text-xs text-neutral-400">
            <div className="text-sm font-bold text-neutral-100 font-sans">Financial Executive Statement</div>
            <div>Period: {pl.startDate} to {pl.endDate}</div>
            <div>Generated: {new Date().toLocaleString()}</div>
          </div>
        </div>

        {/* Financial Highlights Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-neutral-400 block text-[10px] uppercase">Net Sales Revenue</span>
            <span className="text-base font-bold text-neutral-100">Rs. {pl.totalSalesRevenue.toLocaleString()}</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-neutral-400 block text-[10px] uppercase">Cost of Goods (COGS)</span>
            <span className="text-base font-bold text-neutral-300">Rs. {pl.costOfGoodsSold.toLocaleString()}</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-neutral-400 block text-[10px] uppercase">Gross Profit</span>
            <span className="text-base font-bold text-emerald-400">Rs. {pl.grossProfit.toLocaleString()}</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <span className="text-amber-300 block text-[10px] uppercase font-bold">Net Clear Profit</span>
            <span className="text-base font-bold text-amber-400">Rs. {pl.netProfit.toLocaleString()}</span>
          </div>
        </div>

        {/* Detailed Financial & Asset Overview */}
        <div className="space-y-3">
          <h4 className="font-brand font-bold text-sm text-neutral-200 border-b border-neutral-800 pb-2">
            Statement of Assets, Receivables &amp; Liabilities
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <span className="text-neutral-400 block font-medium">Warehouse Inventory Valuation</span>
              <span className="text-lg font-bold font-mono text-amber-400 mt-1 block">
                Rs. {stats.stockValuation.toLocaleString()}
              </span>
              <span className="text-[11px] text-neutral-500">{stats.totalStock} pieces across all designs</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <span className="text-neutral-400 block font-medium">Customer Receivables (Udhar)</span>
              <span className="text-lg font-bold font-mono text-amber-400 mt-1 block">
                Rs. {stats.customerOutstanding.toLocaleString()}
              </span>
              <span className="text-[11px] text-neutral-500">Uncollected dues from retail customers</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <span className="text-neutral-400 block font-medium">Supplier Payables (Liabilities)</span>
              <span className="text-lg font-bold font-mono text-orange-400 mt-1 block">
                Rs. {stats.supplierOutstanding.toLocaleString()}
              </span>
              <span className="text-[11px] text-neutral-500">Owed to Kasur tanneries and hardware</span>
            </div>
          </div>
        </div>

        {/* Signatures Footer */}
        <div className="pt-12 border-t border-neutral-800 grid grid-cols-3 gap-4 text-center text-xs text-neutral-400">
          <div>
            <div className="w-24 h-0.5 bg-neutral-600 mx-auto mb-2" />
            <div className="font-bold text-neutral-200">Saqib</div>
            <div className="text-[10px]">Administrator</div>
          </div>
          <div>
            <div className="w-24 h-0.5 bg-neutral-600 mx-auto mb-2" />
            <div className="font-bold text-neutral-200">Adil</div>
            <div className="text-[10px]">Managing Partner</div>
          </div>
          <div>
            <div className="w-24 h-0.5 bg-neutral-600 mx-auto mb-2" />
            <div className="font-bold text-neutral-200">Javaid</div>
            <div className="text-[10px]">Operations Partner</div>
          </div>
        </div>
      </div>
    </div>
  );
};

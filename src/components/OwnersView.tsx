import React from 'react';
import {
  Users,
  Shield,
  Phone,
  Percent,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { AppSettings, Owner } from '../types';
import { translations } from '../i18n/translations';
import { themes } from '../theme/themes';
import { db } from '../db/database';

interface Props {
  settings: AppSettings;
  owners: Owner[];
  onSelectOwner: (name: 'Saqib' | 'Adil' | 'Javaid') => void;
}

export const OwnersView: React.FC<Props> = ({ settings, owners, onSelectOwner }) => {
  const t = translations[settings.language];
  const currentTheme = themes[settings.theme] || themes.black_gold;

  const pl = db.calculateProfitLoss('monthly');
  const netProfit = pl.netProfit;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 font-brand">
          {t.ownersTitle}
        </h2>
        <p className="text-xs text-neutral-400">
          Executive partnership details, equity distribution, and role authorizations for Saqib, Adil, and Javaid
        </p>
      </div>

      {/* Monthly Profit Equity Distribution Summary */}
      <div className={`p-5 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-3`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
          <div>
            <span className="text-xs text-neutral-400">Monthly Net Distributable Profit (October 2026)</span>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              Rs. {Math.round(netProfit).toLocaleString('en-PK')}
            </div>
          </div>
          <span className="text-xs text-neutral-500">
            Equity ratio: Saqib (40%) : Adil (30%) : Javaid (30%)
          </span>
        </div>

        {/* Share Distribution Calculation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {owners.map((owner) => {
            const partnerProfit = Math.round((netProfit * owner.sharePercentage) / 100);
            const isCurrent = settings.currentOwner === owner.name;
            return (
              <div
                key={owner.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-500/10 shadow-md ring-1 ring-amber-500'
                    : 'border-neutral-800 bg-neutral-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-neutral-100">{owner.name}</h4>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {owner.sharePercentage}% Share
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400">{owner.role}</div>

                <div className="mt-3 pt-2 border-t border-neutral-800/80">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                    Calculated Monthly Share
                  </span>
                  <div className="text-base font-bold font-mono text-emerald-400">
                    Rs. {partnerProfit.toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => onSelectOwner(owner.name)}
                  className={`mt-3 w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{isCurrent ? 'Current Active User' : `Switch to ${owner.name}`}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role-Based Permissions Matrix */}
      <div className={`p-5 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-4`}>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          <h3 className="font-brand font-bold text-base text-neutral-100">
            Role-Based Authorization &amp; Access Control
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-medium">
                <th className="pb-3">Module / Permission</th>
                <th className="pb-3 text-center">Administrator (Saqib)</th>
                <th className="pb-3 text-center">Managing Partner (Adil)</th>
                <th className="pb-3 text-center">Operations (Javaid)</th>
                <th className="pb-3 text-center">Counter Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-sans">
              <tr>
                <td className="py-2.5 font-medium text-neutral-200">POS Belt Counter Sales &amp; Invoices</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">✓ Full</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-neutral-200">Product Pricing &amp; Cost Edits</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="py-2.5 text-center text-neutral-500">Read Only</td>
                <td className="py-2.5 text-center text-neutral-600">Restricted</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-neutral-200">Inward Purchases &amp; Supplier Bills</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="py-2.5 text-center text-neutral-600">Restricted</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-neutral-200">Damaged Stock Write-offs</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="py-2.5 text-center text-neutral-600">Restricted</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-neutral-200">Profit &amp; Loss Financial Statements</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="py-2.5 text-center text-neutral-600">Restricted</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-neutral-200">Database Backup, Restore &amp; Reset</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">✓ Full (Root)</td>
                <td className="py-2.5 text-center text-neutral-500">Backup Only</td>
                <td className="py-2.5 text-center text-neutral-500">Backup Only</td>
                <td className="py-2.5 text-center text-neutral-600">Restricted</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  CreditCard,
  User,
  Filter,
} from 'lucide-react';
import { AppSettings, BusinessExpense, ExpenseCategory, PaymentMethod } from '../types';
import { translations } from '../i18n/translations';
import { themes } from '../theme/themes';
import { db } from '../db/database';

interface Props {
  settings: AppSettings;
  onRefresh: () => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Shop Rent',
  'Transportation & Cargo',
  'Electricity & Utilities',
  'Staff Salaries',
  'Packaging & Belt Boxes',
  'Tea & Refreshments',
  'Shop Maintenance',
  'Marketing & Signs',
  'Miscellaneous',
];

export const ExpensesView: React.FC<Props> = ({ settings, onRefresh }) => {
  const t = translations[settings.language];
  const currentTheme = themes[settings.theme] || themes.black_gold;

  const [expenses, setExpenses] = useState<BusinessExpense[]>(() => db.getExpenses());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Form Fields
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<ExpenseCategory>('Shop Rent');
  const [amount, setAmount] = useState<number>(3500);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState('');
  const [paidBy, setPaidBy] = useState<string>(settings.currentOwner);

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    db.addExpense({
      date,
      category,
      amount: Number(amount),
      paymentMethod,
      notes: notes.trim(),
      paidBy,
    });

    setExpenses(db.getExpenses());
    setIsModalOpen(false);
    setNotes('');
    onRefresh();
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Delete this expense entry?')) {
      db.deleteExpense(id);
      setExpenses(db.getExpenses());
      onRefresh();
    }
  };

  const filteredExpenses = expenses.filter(
    (e) => selectedCategoryFilter === 'all' || e.category === selectedCategoryFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 font-brand">
            {t.expensesTitle}
          </h2>
          <p className="text-xs text-neutral-400">
            Track overhead costs including shop rent, utilities, freight, and packaging boxes deducted from gross profit
          </p>
        </div>

        <button
          onClick={() => {
            setDate(new Date().toISOString().slice(0, 10));
            setPaidBy(settings.currentOwner);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-neutral-950" />
          <span>{t.recordExpense}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg}`}>
          <div className="text-xs text-neutral-400">Total Recorded Expenses</div>
          <div className="text-2xl font-bold text-orange-400 font-mono mt-1">
            Rs. {totalExpenseAmount.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">{expenses.length} expense transactions</div>
        </div>

        <div className={`p-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg}`}>
          <div className="text-xs text-neutral-400">This Month Expenses</div>
          <div className="text-2xl font-bold text-neutral-100 font-mono mt-1">
            Rs.{' '}
            {expenses
              .filter((e) => e.date.startsWith(new Date().toISOString().slice(0, 7)))
              .reduce((sum, e) => sum + e.amount, 0)
              .toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-400 mt-0.5">October 2026 operations</div>
        </div>

        <div className={`p-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg}`}>
          <div className="text-xs text-neutral-400">Largest Category</div>
          <div className="text-xl font-bold text-neutral-200 mt-1 truncate">
            Shop Rent &amp; Utilities
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Fixed retail overhead</div>
        </div>
      </div>

      {/* Filter and List */}
      <div className={`p-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-4`}>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-400" />
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-200 cursor-pointer"
          >
            <option value="all">All Expense Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-medium">
                <th className="pb-3">Date</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Remarks / Description</th>
                <th className="pb-3">Paid By Partner</th>
                <th className="pb-3">Method</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-sans">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="py-3 font-mono text-neutral-400">{exp.date}</td>
                  <td className="py-3 font-semibold text-neutral-200">
                    <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300 text-[11px]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 text-neutral-300">{exp.notes || '—'}</td>
                  <td className="py-3 text-amber-300 font-medium">{exp.paidBy}</td>
                  <td className="py-3 text-neutral-400">{exp.paymentMethod}</td>
                  <td className="py-3 text-right font-mono font-bold text-orange-400">
                    Rs. {exp.amount.toLocaleString()}
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl p-5 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <h3 className="font-brand font-bold text-base text-neutral-100">{t.recordExpense}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">{t.category} *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">{t.amount} (Rs.) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg font-mono text-orange-400 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Paid By Partner</label>
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 cursor-pointer"
                  >
                    <option value="Saqib">Saqib</option>
                    <option value="Adil">Adil</option>
                    <option value="Javaid">Javaid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 cursor-pointer"
                >
                  <option value="Cash">Cash</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Remarks / Note</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. October shop rent paid to landlord"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 text-neutral-950 font-bold shadow"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

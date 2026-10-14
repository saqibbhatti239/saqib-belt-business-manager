import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  History,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Search,
  PackageX,
  FileSpreadsheet,
  CheckCircle2,
  Sliders,
  Eye,
  Camera,
  Barcode,
} from 'lucide-react';
import { AppSettings, BeltProduct, DamagedStockItem, StockMovement } from '../types';
import { translations } from '../i18n/translations';
import { themes } from '../theme/themes';
import { db } from '../db/database';
import { AddBeltModal } from './AddBeltModal';
import { ViewBeltDetailsModal, StockAdjustmentModal } from './BeltDetailModals';
import { BarcodeScannerModal } from './BarcodeScannerModal';

interface Props {
  settings: AppSettings;
  onRefresh: () => void;
}

export const StockView: React.FC<Props> = ({ settings, onRefresh }) => {
  const t = translations[settings.language];
  const currentTheme = themes[settings.theme] || themes.black_gold;

  const [products, setProducts] = useState<BeltProduct[]>(() => db.getProducts());
  const [movements, setMovements] = useState<StockMovement[]>(() => db.getStockMovements());
  const [damagedList, setDamagedList] = useState<DamagedStockItem[]>(() => db.getDamagedStock());

  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'damaged' | 'movements'>('audit');
  const [isDamagedModalOpen, setIsDamagedModalOpen] = useState(false);
  const [isAddBeltOpen, setIsAddBeltOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<BeltProduct | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<BeltProduct | null>(null);

  // Damaged modal form
  const [damagedProductId, setDamagedProductId] = useState<string>(
    products.length > 0 ? products[0].id : ''
  );
  const [damagedQuantity, setDamagedQuantity] = useState<number>(1);
  const [damagedReason, setDamagedReason] = useState<DamagedStockItem['reason']>('Scratched Buckle');
  const [damagedNotes, setDamagedNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  // Handle scanned barcode in Stock View
  const handleBarcodeScan = (scannedCode: string) => {
    const q = scannedCode.trim().toLowerCase();
    const matched = products.find(
      (p) =>
        p.code.toLowerCase() === q ||
        p.id.toLowerCase() === q ||
        p.name.toLowerCase() === q
    );
    if (matched) {
      setSearchQuery(matched.code);
      setViewingProduct(matched);
      setSuccessMsg(`Belt found via camera: ${matched.name} (${matched.code}) - Stock: ${matched.availableQuantity} pcs`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } else {
      setErrorMsg(`No belt found matching code "${scannedCode}".`);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const refreshAllData = () => {
    setProducts(db.getProducts());
    setMovements(db.getStockMovements());
    setDamagedList(db.getDamagedStock());
    onRefresh();
  };

  const totalSaleableStock = products.reduce((sum, p) => sum + p.availableQuantity, 0);
  const totalValuation = products.reduce((sum, p) => sum + p.availableQuantity * p.purchaseCost, 0);

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.code.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      (p.design && p.design.toLowerCase().includes(q)) ||
      (p.colour && p.colour.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });
  const totalDamagedQty = damagedList.reduce((sum, d) => sum + d.quantity, 0);
  const totalDamagedCost = damagedList.reduce((sum, d) => sum + d.costLoss, 0);

  const handleLogDamaged = (e: React.FormEvent) => {
    e.preventDefault();
    if (!damagedProductId || damagedQuantity <= 0) return;

    try {
      db.logDamagedBelt({
        productId: damagedProductId,
        quantity: damagedQuantity,
        reason: damagedReason,
        recordedBy: settings.currentOwner,
        notes: damagedNotes.trim() || undefined,
      });

      refreshAllData();
      setIsDamagedModalOpen(false);
      setErrorMsg(null);
      setSuccessMsg(`Logged ${damagedQuantity} damaged belt(s) written off from inventory.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error recording damaged stock');
    }
  };

  const handleBeltAdded = (saved: BeltProduct, isNew: boolean) => {
    setIsAddBeltOpen(false);
    refreshAllData();
    setSuccessMsg(
      isNew
        ? `New belt '${saved.name}' (${saved.code}) added! Opening stock: ${saved.availableQuantity} pcs.`
        : `Belt '${saved.name}' updated successfully.`
    );
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions with Clearly Visible "+ Add New Belt" Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 font-brand">
            {t.stockTitle}
          </h2>
          <p className="text-xs text-neutral-400">
            Available Stock = Opening Stock + Purchases - Sales - Damaged write-offs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Barcode Camera Scanner */}
          <button
            onClick={() => setIsBarcodeModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-amber-300 text-xs font-bold shadow transition-all cursor-pointer active:scale-95"
            title="Scan barcode with device camera"
          >
            <Camera className="w-4 h-4 text-amber-400" />
            <span>Scan Barcode</span>
            <Barcode className="w-3.5 h-3.5 opacity-70" />
          </button>

          {/* Clearly visible "+ Add New Belt" button on Stock Management screen */}
          <button
            onClick={() => setIsAddBeltOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer ring-2 ring-amber-400/50"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add New Belt</span>
          </button>

          <button
            onClick={() => {
              setErrorMsg(null);
              setIsDamagedModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-950/80 border border-red-500/50 hover:bg-red-900 text-red-200 text-xs font-semibold shadow transition-all cursor-pointer"
          >
            <PackageX className="w-4 h-4 text-red-400" />
            <span>{t.logDamagedBelt}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-neutral-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg}`}>
          <div className="text-xs text-neutral-400">{t.availableStock}</div>
          <div className="text-2xl font-bold text-neutral-100 font-mono mt-1">
            {totalSaleableStock} <span className="text-xs font-normal text-neutral-400">pcs</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">In warehouse &amp; counter</div>
        </div>

        <div className={`p-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg}`}>
          <div className="text-xs text-neutral-400">{t.inventoryValuation}</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            Rs. {totalValuation.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Weighted cost basis</div>
        </div>

        <div className={`p-4 rounded-xl border border-red-500/30 bg-red-950/20`}>
          <div className="text-xs text-red-300">{t.damagedStock}</div>
          <div className="text-2xl font-bold text-red-400 font-mono mt-1">
            {totalDamagedQty} <span className="text-xs font-normal text-red-300">pcs</span>
          </div>
          <div className="text-[11px] text-red-400 mt-1">Separated from saleable</div>
        </div>

        <div className={`p-4 rounded-xl border border-red-500/30 bg-red-950/20`}>
          <div className="text-xs text-red-300">{t.damageLoss}</div>
          <div className="text-2xl font-bold text-red-400 font-mono mt-1">
            Rs. {totalDamagedCost.toLocaleString()}
          </div>
          <div className="text-[11px] text-red-400 mt-1">Written off in P&amp;L</div>
        </div>
      </div>

      {/* Sub Tabs: Audit Inventory, Damaged Stock, Movement History */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            activeSubTab === 'audit'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Warehouse Stock Audit ({products.length} Models)
        </button>
        <button
          onClick={() => setActiveSubTab('damaged')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            activeSubTab === 'damaged'
              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Damaged Belts ({damagedList.length})
        </button>
        <button
          onClick={() => setActiveSubTab('movements')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            activeSubTab === 'movements'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Stock Movement Ledger ({movements.length})
        </button>
      </div>

      {/* Tab 1: Current Warehouse Stock & Low Stock Audit */}
      {activeSubTab === 'audit' && (
        <div className={`p-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-3`}>
          {/* Search & Barcode Quick Trigger Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stock by code, name, design, colour..."
                className="w-full pl-9 pr-8 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-xs text-neutral-500 hover:text-neutral-300"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBarcodeModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow cursor-pointer transition-all active:scale-95 whitespace-nowrap"
              >
                <Camera className="w-4 h-4" />
                <span>Scan Barcode</span>
              </button>

              <span className="text-[11px] text-neutral-400 font-mono">
                Showing {filteredProducts.length} of {products.length} belts
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-medium">
                  <th className="pb-3">Code</th>
                  <th className="pb-3">Belt Model &amp; Design</th>
                  <th className="pb-3">Colour &amp; Size</th>
                  <th className="pb-3 text-center">In Stock</th>
                  <th className="pb-3 text-center">Min Alert</th>
                  <th className="pb-3 text-right">Avg Unit Cost</th>
                  <th className="pb-3 text-right">Total Valuation</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-sans">
                {filteredProducts.map((p) => {
                const isLow = p.availableQuantity <= p.minStockLevel && p.availableQuantity > 0;
                const isOut = p.availableQuantity === 0;
                const value = p.availableQuantity * p.purchaseCost;
                return (
                  <tr key={p.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 font-mono font-bold text-amber-400">{p.code}</td>
                    <td className="py-3">
                      <div className="font-semibold text-neutral-200">{p.name}</div>
                      <div className="text-[11px] text-neutral-400">{p.design || 'Standard'} · {p.material || 'Leather'}</div>
                    </td>
                    <td className="py-3 text-neutral-300">
                      {p.colour} · Size {p.size}
                    </td>
                    <td className="py-3 text-center font-bold font-mono text-neutral-100 text-sm">
                      {p.availableQuantity}
                    </td>
                    <td className="py-3 text-center text-neutral-400 font-mono">{p.minStockLevel}</td>
                    <td className="py-3 text-right font-mono text-neutral-300">Rs. {p.purchaseCost.toLocaleString()}</td>
                    <td className="py-3 text-right font-mono font-bold text-amber-400">Rs. {value.toLocaleString()}</td>
                    <td className="py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isOut
                            ? 'bg-neutral-900 text-neutral-400 border border-neutral-700'
                            : isLow
                            ? 'bg-red-950 text-red-300 border border-red-500/40 animate-pulse'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock ⚠️' : 'Good'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingProduct(p)}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                          title="View Belt Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setAdjustingProduct(p)}
                          className="px-2 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 hover:bg-sky-500/25 text-sky-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          title="Update stock count via inventory audit"
                        >
                          <Sliders className="w-3 h-3" />
                          <span>Adjust</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Tab 2: Damaged Belts Written Off */}
      {activeSubTab === 'damaged' && (
        <div className={`p-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-4`}>
          <div className="text-xs text-neutral-400">
            Damaged, scratched, or defective items are logged separately from saleable stock and written off as business losses in P&amp;L.
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-medium">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Belt Name</th>
                  <th className="pb-3 text-center">Quantity</th>
                  <th className="pb-3">Damage Reason</th>
                  <th className="pb-3 text-right">Cost Loss</th>
                  <th className="pb-3">Logged By</th>
                  <th className="pb-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-sans">
                {damagedList.map((d) => (
                  <tr key={d.id} className="hover:bg-neutral-800/30">
                    <td className="py-3 font-mono text-neutral-400">{d.date}</td>
                    <td className="py-3 font-semibold text-neutral-200">{d.productName}</td>
                    <td className="py-3 text-center font-mono font-bold text-red-400">{d.quantity} pcs</td>
                    <td className="py-3 text-neutral-300">{d.reason}</td>
                    <td className="py-3 text-right font-mono font-bold text-red-400">Rs. {d.costLoss.toLocaleString()}</td>
                    <td className="py-3 text-neutral-300">{d.recordedBy}</td>
                    <td className="py-3 text-neutral-400 italic">{d.notes || '—'}</td>
                  </tr>
                ))}
                {damagedList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-neutral-500">
                      {t.allBeltsGood}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Stock Movement Ledger */}
      {activeSubTab === 'movements' && (
        <div className={`p-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm overflow-x-auto`}>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-medium">
                <th className="pb-3">Date</th>
                <th className="pb-3">Belt Product</th>
                <th className="pb-3">Movement Type</th>
                <th className="pb-3 text-center">Quantity Change</th>
                <th className="pb-3 text-center">New Balance</th>
                <th className="pb-3">Reference / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-sans">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-neutral-800/30">
                  <td className="py-3 font-mono text-neutral-400">{m.date}</td>
                  <td className="py-3 font-semibold text-neutral-200">{m.productName}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.type === 'PURCHASE' || m.type === 'OPENING_STOCK'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : m.type === 'SALE'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          : m.type === 'DAMAGED_WRITE_OFF'
                          ? 'bg-red-950 text-red-300 border border-red-500/30'
                          : 'bg-sky-950 text-sky-300 border border-sky-500/30'
                      }`}
                    >
                      {m.type}
                    </span>
                  </td>
                  <td
                    className={`py-3 text-center font-mono font-bold ${
                      m.quantityChange > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange} pcs
                  </td>
                  <td className="py-3 text-center font-mono font-bold text-neutral-100">
                    {m.newBalance} pcs
                  </td>
                  <td className="py-3 text-neutral-400">{m.referenceId || m.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New Belt Modal */}
      <AddBeltModal
        isOpen={isAddBeltOpen}
        onClose={() => setIsAddBeltOpen(false)}
        onSuccess={handleBeltAdded}
      />

      {/* View Belt Details Modal */}
      {viewingProduct && (
        <ViewBeltDetailsModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onEdit={() => {}}
          onUpdatePrices={() => {}}
          onAdjustStock={(p) => {
            setViewingProduct(null);
            setAdjustingProduct(p);
          }}
          onArchiveToggle={(p) => {
            db.archiveProduct(p.id, !p.isArchived);
            refreshAllData();
          }}
        />
      )}

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <StockAdjustmentModal
          isOpen={!!adjustingProduct}
          product={adjustingProduct}
          onClose={() => setAdjustingProduct(null)}
          onSuccess={() => {
            refreshAllData();
            setSuccessMsg(`Inventory count updated for belt ${adjustingProduct.code}!`);
            setTimeout(() => setSuccessMsg(null), 4000);
          }}
        />
      )}

      {/* Log Damaged Stock Modal */}
      {isDamagedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl p-5 space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <PackageX className="w-5 h-5 text-red-400" />
                <h3 className="font-brand font-bold text-base text-neutral-100">{t.logDamagedBelt}</h3>
              </div>
              <button
                onClick={() => setIsDamagedModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950 border border-red-500/40 text-red-200 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogDamaged} className="space-y-3">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Select Belt *</label>
                <select
                  value={damagedProductId}
                  onChange={(e) => setDamagedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name} (Stock: {p.availableQuantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Damaged Quantity (pcs) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={damagedQuantity}
                  onChange={(e) => setDamagedQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg font-mono text-neutral-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">{t.reason} *</label>
                <select
                  value={damagedReason}
                  onChange={(e) => setDamagedReason(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 cursor-pointer"
                >
                  <option value="Scratched Buckle">Scratched Buckle (بکل میں خراش)</option>
                  <option value="Torn Leather">Torn Leather (چمڑا کٹا ہوا)</option>
                  <option value="Stitching Defect">Stitching Defect (سلائی خراب)</option>
                  <option value="Water Damage">Water Damage (پانی سے خراب)</option>
                  <option value="Other">Other Defect</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Audit Remarks</label>
                <input
                  type="text"
                  value={damagedNotes}
                  onChange={(e) => setDamagedNotes(e.target.value)}
                  placeholder="e.g. Scratched during unboxing transport"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDamagedModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold cursor-pointer"
                >
                  Confirm Write-off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Camera Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onScan={handleBarcodeScan}
        products={products}
        title="Stock Barcode Scanner"
        subtitle="Scan belt barcode to audit count, check valuation, or adjust inventory"
      />
    </div>
  );
};

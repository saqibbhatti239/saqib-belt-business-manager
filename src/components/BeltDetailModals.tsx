import React, { useState } from 'react';
import {
  X,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Archive,
  Trash2,
  Edit2,
  Sliders,
  CheckCircle2,
  Layers,
  Palette,
  Ruler,
  Calendar,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { BeltProduct } from '../types';
import { db } from '../db/database';

interface ViewModalProps {
  product: BeltProduct | null;
  onClose: () => void;
  onEdit: (product: BeltProduct) => void;
  onUpdatePrices: (product: BeltProduct) => void;
  onAdjustStock: (product: BeltProduct) => void;
  onArchiveToggle: (product: BeltProduct) => void;
}

export const ViewBeltDetailsModal: React.FC<ViewModalProps> = ({
  product,
  onClose,
  onEdit,
  onUpdatePrices,
  onAdjustStock,
  onArchiveToggle,
}) => {
  if (!product) return null;

  const check = db.canDeleteProduct(product.id);
  const profitMargin = product.sellingPrice - product.purchaseCost;
  const marginPercent = product.sellingPrice > 0 ? ((profitMargin / product.sellingPrice) * 100).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30">
              {product.code}
            </span>
            <h3 className="font-brand font-bold text-sm text-neutral-100 truncate">
              {product.name}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Photo & High Level Stats */}
          <div className="flex gap-4 items-start">
            <div className="w-24 h-24 rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
              {product.photoUrl ? (
                <img src={product.photoUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-8 h-8 text-neutral-600" />
              )}
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="font-bold text-sm text-neutral-100">{product.name}</div>
              <div className="text-[11px] text-neutral-400">
                {product.design || 'Standard'} · {product.material || 'Leather'} · Size {product.size}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    product.availableQuantity <= product.minStockLevel
                      ? 'bg-red-950 text-red-300 border border-red-500/40'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {product.availableQuantity} pcs in stock
                </span>
                {product.isArchived && (
                  <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[10px] font-bold">
                    Archived
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Profit Matrix */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-center">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Purchase Cost</span>
              <span className="font-bold text-neutral-200">Rs. {product.purchaseCost.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Selling Price</span>
              <span className="font-bold text-amber-400">Rs. {product.sellingPrice.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Gross Margin</span>
              <span className="font-bold text-emerald-400">+{marginPercent}%</span>
            </div>
          </div>

          {/* Detailed Attributes */}
          <div className="space-y-1.5 border-t border-neutral-800 pt-3">
            <div className="flex justify-between py-1 border-b border-neutral-800/60">
              <span className="text-neutral-400">Waist Size:</span>
              <span className="font-semibold text-neutral-200">{product.size} inches</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800/60">
              <span className="text-neutral-400">Colour:</span>
              <span className="font-semibold text-neutral-200">{product.colour}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800/60">
              <span className="text-neutral-400">Buckle / Design:</span>
              <span className="font-semibold text-neutral-200">{product.design}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800/60">
              <span className="text-neutral-400">Leather / Material:</span>
              <span className="font-semibold text-neutral-200">{product.material}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800/60">
              <span className="text-neutral-400">Min Alert Threshold:</span>
              <span className="font-semibold text-neutral-200">{product.minStockLevel} pcs</span>
            </div>
            {product.notes && (
              <div className="py-1">
                <span className="text-neutral-400 block mb-0.5">Remarks / Notes:</span>
                <span className="text-neutral-300 italic">{product.notes}</span>
              </div>
            )}
            <div className="flex justify-between py-1 text-[11px] text-neutral-500">
              <span>Historical Activity:</span>
              <span>{check.salesCount} sales · {check.purchasesCount} inward bills</span>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="pt-3 border-t border-neutral-800 flex flex-wrap gap-2 justify-end">
            <button
              onClick={() => onUpdatePrices(product)}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>Update Prices</span>
            </button>

            <button
              onClick={() => onAdjustStock(product)}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Adjust Stock</span>
            </button>

            <button
              onClick={() => onArchiveToggle(product)}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <Archive className="w-3.5 h-3.5 text-amber-400" />
              <span>{product.isArchived ? 'Unarchive' : 'Archive'}</span>
            </button>

            <button
              onClick={() => onEdit(product)}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold cursor-pointer flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5 text-neutral-950" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- UPDATE PRICES MODAL ---
interface PriceModalProps {
  product: BeltProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UpdatePricesModal: React.FC<PriceModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !product) return null;

  const [cost, setCost] = useState(product.purchaseCost);
  const [price, setPrice] = useState(product.sellingPrice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateProductPrices(product.id, Number(cost), Number(price));
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl p-5 space-y-4 text-xs shadow-2xl">
        <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
          <h3 className="font-brand font-bold text-base text-neutral-100">
            Update Prices — {product.code}
          </h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-semibold text-neutral-300 mb-1">Purchase Cost (Rs.)</label>
            <input
              type="number"
              min="0"
              required
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg font-mono text-neutral-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-300 mb-1">Selling Price (Rs.)</label>
            <input
              type="number"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg font-mono text-amber-400 font-bold"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-500 text-neutral-950 font-bold shadow"
            >
              Save Prices
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- STOCK ADJUSTMENT MODAL ---
interface StockAdjustmentProps {
  product: BeltProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !product) return null;

  const [quantity, setQuantity] = useState(product.availableQuantity);
  const [reason, setReason] = useState('Physical Inventory Count Audit');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    db.adjustStock(product.id, Number(quantity), reason);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl p-5 space-y-4 text-xs shadow-2xl">
        <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
          <h3 className="font-brand font-bold text-base text-neutral-100">
            Stock Adjustment — {product.code}
          </h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">✕</button>
        </div>

        <div className="text-neutral-400">
          Current recorded stock: <strong className="text-neutral-100">{product.availableQuantity} pcs</strong>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-semibold text-neutral-300 mb-1">New Actual Count (pcs)</label>
            <input
              type="number"
              min="0"
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg font-mono text-neutral-100 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-300 mb-1">Audit Adjustment Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 cursor-pointer"
            >
              <option value="Physical Inventory Count Audit">Physical Inventory Count Audit</option>
              <option value="Found Uncounted Warehouse Stock">Found Uncounted Warehouse Stock</option>
              <option value="Stock Correction / Shrinkage">Stock Correction / Shrinkage</option>
              <option value="Display Sample Removed">Display Sample Removed</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-500 text-neutral-950 font-bold shadow"
            >
              Record Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  Package,
  Layers,
  Palette,
  Ruler,
  Tag,
  DollarSign,
  X,
  Check,
  Eye,
  Sliders,
  Archive,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  FileSpreadsheet,
} from 'lucide-react';
import { AppSettings, BeltProduct, BeltDesign, BeltColour, BeltSize, BeltMaterial, BeltCategory } from '../types';
import { translations } from '../i18n/translations';
import { themes } from '../theme/themes';
import { db } from '../db/database';
import { AddBeltModal, CATEGORY_PRESETS } from './AddBeltModal';
import { CsvImportModal } from './CsvImportModal';
import {
  ViewBeltDetailsModal,
  UpdatePricesModal,
  StockAdjustmentModal,
} from './BeltDetailModals';

interface Props {
  settings: AppSettings;
  onRefresh: () => void;
}

const DESIGN_OPTIONS: BeltDesign[] = [
  'Formal Stitch',
  'Reversible Classic',
  'Automatic Buckle',
  'Italian Braided',
  'Heavy Duty Jeans',
  'Western Embossed',
  'Casual Canvas',
  'Executive Dress',
  'Custom Designer',
];

const COLOUR_OPTIONS: BeltColour[] = [
  'Black',
  'Dark Brown',
  'Tan',
  'Burgundy',
  'Navy Blue',
  'Coffee',
  'Cognac',
  'Olive Green',
];

export const ProductsView: React.FC<Props> = ({ settings, onRefresh }) => {
  const t = translations[settings.language];
  const currentTheme = themes[settings.theme] || themes.black_gold;

  const [products, setProducts] = useState<BeltProduct[]>(() => db.getProducts());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDesign, setSelectedDesign] = useState<string>('all');
  const [selectedColour, setSelectedColour] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [archiveFilter, setArchiveFilter] = useState<'active' | 'archived' | 'all'>('active');

  // Modals state
  const [isAddBeltOpen, setIsAddBeltOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BeltProduct | null>(null);

  const [viewingProduct, setViewingProduct] = useState<BeltProduct | null>(null);
  const [priceModalProduct, setPriceModalProduct] = useState<BeltProduct | null>(null);
  const [stockModalProduct, setStockModalProduct] = useState<BeltProduct | null>(null);

  // Success / Error Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const refreshList = () => {
    setProducts(db.getProducts());
    onRefresh();
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsAddBeltOpen(true);
  };

  const handleOpenEdit = (p: BeltProduct) => {
    setEditingProduct(p);
    setIsAddBeltOpen(true);
  };

  const handleSuccessSave = (saved: BeltProduct, isNew: boolean) => {
    setIsAddBeltOpen(false);
    refreshList();
    setFeedback({
      type: 'success',
      message: isNew
        ? `Belt '${saved.name}' (${saved.code}) saved successfully! Available stock: ${saved.availableQuantity} pcs. Ready for sales and purchases.`
        : `Belt '${saved.name}' (${saved.code}) details updated successfully!`,
    });
    setTimeout(() => setFeedback(null), 6000);
  };

  const handleCsvImportSuccess = (count: number) => {
    refreshList();
    setFeedback({
      type: 'success',
      message: `Mass inventory import complete! Successfully imported ${count} belt items with codes, costs, prices, and stock quantities.`,
    });
    setTimeout(() => setFeedback(null), 7000);
  };

  const handleToggleArchive = (p: BeltProduct) => {
    const newState = !p.isArchived;
    db.archiveProduct(p.id, newState);
    refreshList();
    if (viewingProduct?.id === p.id) {
      setViewingProduct({ ...viewingProduct, isArchived: newState });
    }
    setFeedback({
      type: 'success',
      message: newState
        ? `Belt '${p.name}' (${p.code}) has been archived.`
        : `Belt '${p.name}' (${p.code}) has been unarchived and returned to active list.`,
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDelete = (p: BeltProduct) => {
    const check = db.canDeleteProduct(p.id);
    if (!check.canDelete) {
      setFeedback({
        type: 'error',
        message: `${t.cannotDeleteBeltWithHistory} (${check.salesCount} sales, ${check.purchasesCount} inward bills recorded).`,
      });
      setTimeout(() => setFeedback(null), 8000);
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete belt '${p.name}' (${p.code})?`)) {
      db.deleteProduct(p.id);
      refreshList();
      setFeedback({
        type: 'success',
        message: `Belt '${p.name}' has been permanently deleted from database.`,
      });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    // Search by name or code
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      p.name.toLowerCase().includes(term) ||
      p.code.toLowerCase().includes(term) ||
      (p.category && p.category.toLowerCase().includes(term)) ||
      (p.design && p.design.toLowerCase().includes(term)) ||
      (p.colour && p.colour.toLowerCase().includes(term)) ||
      (p.material && p.material.toLowerCase().includes(term));

    // Category filter
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    // Design filter
    const matchesDesign = selectedDesign === 'all' || p.design === selectedDesign;

    // Colour filter
    const matchesColour = selectedColour === 'all' || p.colour === selectedColour;

    // Stock filter
    let matchesStock = true;
    if (stockFilter === 'in_stock') {
      matchesStock = p.availableQuantity > 0;
    } else if (stockFilter === 'low_stock') {
      matchesStock = p.availableQuantity <= p.minStockLevel && p.availableQuantity > 0;
    } else if (stockFilter === 'out_of_stock') {
      matchesStock = p.availableQuantity === 0;
    }

    // Archive filter
    let matchesArchive = true;
    if (archiveFilter === 'active') {
      matchesArchive = !p.isArchived;
    } else if (archiveFilter === 'archived') {
      matchesArchive = !!p.isArchived;
    }

    return matchesSearch && matchesCategory && matchesDesign && matchesColour && matchesStock && matchesArchive;
  });

  return (
    <div className="space-y-6">
      {/* Header & Prominent "+ Add New Belt" Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 font-brand">
            {t.productsTitle}
          </h2>
          <p className="text-xs text-neutral-400">
            Manage belt catalog, auto-generated codes, purchase costs, selling prices, and real-time inventory
          </p>
        </div>

        {/* Action Buttons: Bulk CSV Import & "+ Add New Belt" */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-neutral-900 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer hover:bg-neutral-850"
            title="Import Belts from CSV file"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>CSV Bulk Import</span>
          </button>

          {/* Clearly visible "+ Add New Belt" button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer ring-2 ring-amber-400/50"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>+ Add New Belt</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between transition-all shadow-md animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/90 border-red-500/50 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 rounded text-neutral-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search Bar & Multi-Dimensional Filters including Category/Collection */}
      <div className={`p-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-3`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box (4 cols) */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, code (BLT-101), category..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-900/90 border border-neutral-700 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category / Collection Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-amber-500/40 rounded-lg text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">All Collections / Categories</option>
              {CATEGORY_PRESETS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Colour Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={selectedColour}
              onChange={(e) => setSelectedColour(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Colours</option>
              {COLOUR_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Design Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={selectedDesign}
              onChange={(e) => setSelectedDesign(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Designs</option>
              {DESIGN_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Stock Availability Filter (1 col) */}
          <div className="md:col-span-1">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full px-2 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">Stock</option>
              <option value="in_stock">In Stock (&gt;0)</option>
              <option value="low_stock">Low Stock (≤ Alert)</option>
              <option value="out_of_stock">Out (0)</option>
            </select>
          </div>

          {/* Active / Archived Filter (1 col) */}
          <div className="md:col-span-1">
            <select
              value={archiveFilter}
              onChange={(e) => setArchiveFilter(e.target.value as any)}
              className="w-full px-2 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-amber-500 cursor-pointer text-center"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        {/* Quick Category / Collection Badges Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
          <span className="text-neutral-400 font-medium shrink-0 flex items-center gap-1">
            <Tag className="w-3 h-3 text-amber-400" /> Collection:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium cursor-pointer transition-all ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            All
          </button>
          {CATEGORY_PRESETS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg shrink-0 font-medium cursor-pointer transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Active Filter Indicators & Count */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-800 text-[11px] text-neutral-400">
          <div>
            Showing <strong className="text-amber-400">{filteredProducts.length}</strong> of{' '}
            <strong className="text-neutral-200">{products.length}</strong> belts
            {selectedCategory !== 'all' && (
              <span className="ml-2 text-amber-300 font-semibold bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded">
                Category: {selectedCategory}
              </span>
            )}
          </div>

          {(searchTerm || selectedCategory !== 'all' || selectedDesign !== 'all' || selectedColour !== 'all' || stockFilter !== 'all' || archiveFilter !== 'active') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedDesign('all');
                setSelectedColour('all');
                setStockFilter('all');
                setArchiveFilter('active');
              }}
              className="flex items-center gap-1 text-amber-400 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Belt Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((p) => {
          const isLow = p.availableQuantity <= p.minStockLevel && p.availableQuantity > 0;
          const isOut = p.availableQuantity === 0;
          const profitMargin = p.sellingPrice - p.purchaseCost;
          const marginPercent = p.sellingPrice > 0 ? Math.round((profitMargin / p.sellingPrice) * 100) : 0;

          return (
            <div
              key={p.id}
              className={`rounded-2xl border ${
                isOut
                  ? 'border-neutral-800 opacity-90'
                  : isLow
                  ? 'border-amber-500/60 shadow-amber-500/5'
                  : currentTheme.cardBorder
              } ${currentTheme.cardBg} overflow-hidden shadow-md flex flex-col transition-all hover:border-amber-500/80`}
            >
              {/* Image Preview with Badges */}
              <div className="h-44 relative bg-neutral-900 overflow-hidden group">
                {p.photoUrl ? (
                  <img
                    src={p.photoUrl}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-600">
                    <Package className="w-12 h-12" />
                  </div>
                )}

                {/* Product Code Badge */}
                <div className="absolute top-2.5 left-2.5 bg-neutral-950/85 backdrop-blur-md border border-amber-500/40 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold text-amber-400 shadow">
                  {p.code}
                </div>

                {/* Stock Level Badge */}
                <div
                  className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold shadow ${
                    isOut
                      ? 'bg-neutral-950/90 text-neutral-400 border border-neutral-700'
                      : isLow
                      ? 'bg-amber-950/90 text-amber-300 border border-amber-500/60 animate-pulse'
                      : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {p.availableQuantity} {t.units} {isOut ? '(Out of Stock)' : isLow ? '⚠️ Low' : ''}
                </div>

                {p.isArchived && (
                  <div className="absolute bottom-2.5 left-2.5 bg-neutral-950/90 text-neutral-400 border border-neutral-700 px-2 py-0.5 rounded text-[10px] font-bold">
                    Archived
                  </div>
                )}
              </div>

              {/* Belt Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full truncate max-w-[160px]">
                      {p.category || 'Executive Formal'}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-neutral-100 line-clamp-1">{p.name}</h3>
                  <p className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5 truncate">
                    <span>{p.design || 'Standard'}</span>
                    <span>·</span>
                    <span>{p.material || 'Leather'}</span>
                  </p>
                </div>

                {/* Specs Pill List */}
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-900/80 border border-neutral-800 text-neutral-300 truncate">
                    <Palette className="w-3 h-3 text-neutral-400 shrink-0" />
                    <span className="truncate">{p.colour || 'Black'}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-900/80 border border-neutral-800 text-neutral-300 truncate">
                    <Ruler className="w-3 h-3 text-neutral-400 shrink-0" />
                    <span className="truncate">Size {p.size || '34'}</span>
                  </div>
                </div>

                {/* Financials & Costing (Weighted Avg & Selling Price) */}
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Sale Price</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      Rs. {p.sellingPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Cost Price</span>
                    <span className="font-mono text-neutral-400 text-xs">
                      Rs. {p.purchaseCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">Margin</span>
                    <span className="font-mono text-emerald-400 font-bold text-xs">
                      +{marginPercent}%
                    </span>
                  </div>
                </div>

                {/* Action Buttons Toolbar (All 5 requested operations) */}
                <div className="pt-2.5 border-t border-neutral-800 flex items-center justify-between gap-1 text-xs">
                  {/* Left: View Details */}
                  <button
                    onClick={() => setViewingProduct(p)}
                    className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                    title="View Belt Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Update Prices */}
                    <button
                      onClick={() => setPriceModalProduct(p)}
                      className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                      title="Update Prices"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                    </button>

                    {/* Update Stock (Audit) */}
                    <button
                      onClick={() => setStockModalProduct(p)}
                      className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-sky-400 hover:bg-sky-500/10 transition-colors cursor-pointer"
                      title="Update Stock (Audit Adjustment)"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit Belt */}
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      title="Edit Belt Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Archive / Unarchive */}
                    <button
                      onClick={() => handleToggleArchive(p)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        p.isArchived
                          ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                          : 'bg-neutral-800/80 text-neutral-400 hover:text-amber-300'
                      }`}
                      title={p.isArchived ? 'Unarchive Belt' : 'Archive Belt'}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>

                    {/* Safe Delete */}
                    <button
                      onClick={() => handleDelete(p)}
                      className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-red-950/60 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete Belt"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="p-10 text-center rounded-2xl border border-neutral-800 bg-neutral-900/40 text-neutral-400 space-y-3">
          <Package className="w-12 h-12 mx-auto text-neutral-600" />
          <div>
            <p className="text-sm font-semibold text-neutral-200">No belts found matching your criteria</p>
            <p className="text-xs text-neutral-500 mt-0.5">Try clearing filters or add a new belt to your inventory.</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs shadow hover:bg-amber-400 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Belt</span>
          </button>
        </div>
      )}

      {/* 1. Add / Edit Belt Modal (Fields for Name, Code, Design, Category, Colour, Size, Material, Costs, Stock, and Photo) */}
      <AddBeltModal
        isOpen={isAddBeltOpen}
        editingProduct={editingProduct}
        onClose={() => setIsAddBeltOpen(false)}
        onSuccess={handleSuccessSave}
      />

      {/* Bulk CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onSuccess={handleCsvImportSuccess}
      />

      {/* 2. View Belt Details Modal */}
      {viewingProduct && (
        <ViewBeltDetailsModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onEdit={(p) => {
            setViewingProduct(null);
            handleOpenEdit(p);
          }}
          onUpdatePrices={(p) => {
            setViewingProduct(null);
            setPriceModalProduct(p);
          }}
          onAdjustStock={(p) => {
            setViewingProduct(null);
            setStockModalProduct(p);
          }}
          onArchiveToggle={(p) => {
            handleToggleArchive(p);
          }}
        />
      )}

      {/* 3. Update Prices Modal */}
      {priceModalProduct && (
        <UpdatePricesModal
          isOpen={!!priceModalProduct}
          product={priceModalProduct}
          onClose={() => setPriceModalProduct(null)}
          onSuccess={() => {
            refreshList();
            setFeedback({
              type: 'success',
              message: `Prices updated for belt ${priceModalProduct.code}!`,
            });
            setTimeout(() => setFeedback(null), 4000);
          }}
        />
      )}

      {/* 4. Stock Adjustment Modal */}
      {stockModalProduct && (
        <StockAdjustmentModal
          isOpen={!!stockModalProduct}
          product={stockModalProduct}
          onClose={() => setStockModalProduct(null)}
          onSuccess={() => {
            refreshList();
            setFeedback({
              type: 'success',
              message: `Stock count adjusted for belt ${stockModalProduct.code}! Movement recorded.`,
            });
            setTimeout(() => setFeedback(null), 4000);
          }}
        />
      )}
    </div>
  );
};

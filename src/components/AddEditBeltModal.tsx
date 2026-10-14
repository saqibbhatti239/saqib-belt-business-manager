import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Package,
  Upload,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Camera,
  Layers,
  Palette,
  Ruler,
  Tag,
  DollarSign,
  FileText,
} from 'lucide-react';
import { BeltProduct, BeltDesign, BeltColour, BeltSize, BeltMaterial } from '../types';
import { db } from '../db/database';

interface Props {
  isOpen: boolean;
  editingProduct?: BeltProduct | null;
  onClose: () => void;
  onSuccess: (product: BeltProduct, isNew: boolean) => void;
}

const DESIGN_PRESETS: BeltDesign[] = [
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

const COLOUR_PRESETS: BeltColour[] = [
  'Black',
  'Dark Brown',
  'Tan',
  'Burgundy',
  'Navy Blue',
  'Coffee',
  'Cognac',
  'Olive Green',
];

const SIZE_PRESETS: BeltSize[] = [
  '28',
  '30',
  '32',
  '34',
  '36',
  '38',
  '40',
  '42',
  '44',
  '46',
  'Free Size (Adjustable)',
];

const MATERIAL_PRESETS: BeltMaterial[] = [
  'Full Grain Leather',
  'Top Grain Cowhide',
  'Genuine Buffalo Leather',
  'Split Leather',
  'Suede Leather',
  'Military Canvas',
  'Synthetic PU',
];

const PHOTO_SAMPLES = [
  { name: 'Black Formal', url: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&auto=format&fit=crop&q=80' },
  { name: 'Classic Brown', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80' },
  { name: 'Ratchet Buckle', url: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400&auto=format&fit=crop&q=80' },
  { name: 'Braided Tan', url: 'https://images.unsplash.com/photo-1585856345914-72648585489f?w=400&auto=format&fit=crop&q=80' },
];

export const AddEditBeltModal: React.FC<Props> = ({
  isOpen,
  editingProduct,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to generate a unique belt code
  const generateUniqueCode = (): string => {
    let nextCode = '';
    let isTaken = true;
    let attempts = 0;
    while (isTaken && attempts < 50) {
      const randNum = Math.floor(100 + Math.random() * 900);
      nextCode = `BLT-${randNum}`;
      isTaken = db.isProductCodeTaken(nextCode);
      attempts++;
    }
    return nextCode || `BLT-${Date.now().toString().slice(-4)}`;
  };

  // Form Fields
  const [name, setName] = useState(editingProduct?.name || '');
  const [code, setCode] = useState(editingProduct?.code || generateUniqueCode());
  const [design, setDesign] = useState(editingProduct?.design || 'Formal Stitch');
  const [colour, setColour] = useState(editingProduct?.colour || 'Black');
  const [size, setSize] = useState(editingProduct?.size || '34');
  const [material, setMaterial] = useState(editingProduct?.material || 'Full Grain Leather');
  const [purchaseCost, setPurchaseCost] = useState<number | string>(
    editingProduct ? editingProduct.purchaseCost : 950
  );
  const [sellingPrice, setSellingPrice] = useState<number | string>(
    editingProduct ? editingProduct.sellingPrice : 1750
  );
  const [openingStock, setOpeningStock] = useState<number | string>(
    editingProduct ? editingProduct.availableQuantity : 0 // allow zero!
  );
  const [minStockLevel, setMinStockLevel] = useState<number | string>(
    editingProduct ? editingProduct.minStockLevel : 5
  );
  const [photoUrl, setPhotoUrl] = useState(editingProduct?.photoUrl || '');
  const [notes, setNotes] = useState(editingProduct?.notes || '');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegenerateCode = () => {
    setCode(generateUniqueCode());
    setErrorMessage(null);
  };

  const handlePhotoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validate Required Fields
    if (!name.trim()) {
      setErrorMessage('Belt Name is required. Please enter a valid name.');
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMessage('Belt Code is required.');
      return;
    }

    // 2. Validate Duplicate Product Code
    const isTaken = db.isProductCodeTaken(cleanCode, editingProduct?.id);
    if (isTaken) {
      setErrorMessage(
        `Belt Code '${cleanCode}' is already in use by another belt! Please enter or generate a unique code.`
      );
      return;
    }

    const costNum = Number(purchaseCost);
    if (isNaN(costNum) || costNum < 0) {
      setErrorMessage('Please enter a valid purchase price per belt (0 or greater).');
      return;
    }

    const priceNum = Number(sellingPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setErrorMessage('Please enter a valid selling price per belt (0 or greater).');
      return;
    }

    const stockNum = Number(openingStock);
    if (isNaN(stockNum) || stockNum < 0) {
      setErrorMessage('Opening stock must be 0 or greater.');
      return;
    }

    const minLevelNum = Number(minStockLevel) || 5;

    // 3. Save to database
    try {
      const saved = db.saveProduct({
        id: editingProduct?.id,
        name: name.trim(),
        code: cleanCode,
        design: design.trim(),
        colour: colour.trim(),
        size: size.trim(),
        material: material.trim(),
        purchaseCost: costNum,
        sellingPrice: priceNum,
        availableQuantity: stockNum,
        minStockLevel: minLevelNum,
        photoUrl: photoUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        isArchived: editingProduct?.isArchived || false,
      });

      onSuccess(saved, !editingProduct);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving belt to database');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-brand font-bold text-base text-neutral-100">
                {editingProduct ? 'Edit Belt Details' : '+ Add New Belt'}
              </h3>
              <p className="text-xs text-neutral-400">
                {editingProduct
                  ? `Updating belt ${editingProduct.code}`
                  : 'Enter belt specifications, pricing, and initial stock'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Row 1: Belt Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Belt Name (7 cols) */}
            <div className="sm:col-span-7">
              <label className="block font-semibold text-neutral-200 mb-1">
                1. Belt Name <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Italian Braided Saddle Cowhide"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Belt Code (5 cols) */}
            <div className="sm:col-span-5">
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-neutral-200">
                  2. Belt Code <span className="text-amber-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateCode}
                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  title="Generate new unique code"
                >
                  <RefreshCw className="w-3 h-3" /> Auto
                </button>
              </div>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="BLT-108"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Row 2: Design, Colour, Size, Material (Optional) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Design */}
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                3. Design / Buckle
              </label>
              <input
                type="text"
                list="design-presets-list"
                value={design}
                onChange={(e) => setDesign(e.target.value)}
                placeholder="Formal Stitch"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:border-amber-500"
              />
              <datalist id="design-presets-list">
                {DESIGN_PRESETS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>

            {/* Colour */}
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                4. Colour
              </label>
              <input
                type="text"
                list="colour-presets-list"
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                placeholder="Black"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:border-amber-500"
              />
              <datalist id="colour-presets-list">
                {COLOUR_PRESETS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            {/* Size */}
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                5. Waist Size
              </label>
              <input
                type="text"
                list="size-presets-list"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="34"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:border-amber-500"
              />
              <datalist id="size-presets-list">
                {SIZE_PRESETS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            {/* Material */}
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                6. Leather Material
              </label>
              <input
                type="text"
                list="material-presets-list"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="Full Grain"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:border-amber-500"
              />
              <datalist id="material-presets-list">
                {MATERIAL_PRESETS.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Row 3: Prices & Stock Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
            {/* Purchase Price */}
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                7. Purchase Cost <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-[10px] text-neutral-500 font-mono">Rs.</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(e.target.value)}
                  placeholder="950"
                  className="w-full pl-8 pr-2 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg font-mono text-neutral-100 font-bold"
                />
              </div>
            </div>

            {/* Selling Price */}
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                8. Sale Price <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-[10px] text-neutral-500 font-mono">Rs.</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="1750"
                  className="w-full pl-8 pr-2 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg font-mono text-amber-400 font-bold"
                />
              </div>
            </div>

            {/* Opening Stock (Allow 0!) */}
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                9. Opening Stock <span className="text-amber-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={openingStock}
                onChange={(e) => setOpeningStock(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg font-mono text-neutral-100 font-bold"
              />
              <span className="text-[10px] text-neutral-500 block mt-0.5">0 = no stock yet</span>
            </div>

            {/* Min Stock Alert */}
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                10. Min Alert Level
              </label>
              <input
                type="number"
                min="0"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(e.target.value)}
                placeholder="5"
                className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg font-mono text-neutral-300"
              />
              <span className="text-[10px] text-neutral-500 block mt-0.5">Alerts below this</span>
            </div>
          </div>

          {/* Row 4: Photo Selection (Mobile Gallery or Presets) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-neutral-200">
                11. Belt Photo (Gallery or Preset)
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Select from Gallery</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoFileSelect}
              />
            </div>

            {/* Photo preview + Presets */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              {/* Thumbnail Preview */}
              <div className="w-16 h-16 rounded-xl bg-neutral-950 border border-neutral-700 overflow-hidden shrink-0 flex items-center justify-center">
                {photoUrl ? (
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-6 h-6 text-neutral-600" />
                )}
              </div>

              {/* Sample Presets */}
              <div className="flex-1 flex flex-wrap gap-1.5">
                {PHOTO_SAMPLES.map((sample, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setPhotoUrl(sample.url)}
                    className={`px-2 py-1 rounded text-[10px] border cursor-pointer ${
                      photoUrl === sample.url
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="Or paste image URL (https://...)"
              className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-400 text-[11px]"
            />
          </div>

          {/* Row 5: Notes */}
          <div>
            <label className="block font-semibold text-neutral-300 mb-1">
              12. Notes &amp; Supplier Remarks (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sourced from Kasur Tanneries; pure brass auto-ratchet buckle"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-200"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-neutral-950 font-bold text-xs shadow-lg hover:brightness-110 cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-neutral-950" />
              <span>Save Belt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

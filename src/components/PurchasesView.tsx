import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  CheckCircle,
  Building2,
  Calendar,
  DollarSign,
  PackageCheck,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { AppSettings, BeltProduct, PurchaseItem, Supplier } from '../types';
import { translations } from '../i18n/translations';
import { themes } from '../theme/themes';
import { db } from '../db/database';

interface Props {
  settings: AppSettings;
  onRefresh: () => void;
  preselectedProductId?: string | null;
}

export const PurchasesView: React.FC<Props> = ({ settings, onRefresh, preselectedProductId }) => {
  const t = translations[settings.language];
  const currentTheme = themes[settings.theme] || themes.black_gold;

  const [purchases, setPurchases] = useState<PurchaseItem[]>(() => db.getPurchases());
  const [products] = useState<BeltProduct[]>(() => db.getProducts());
  const [suppliers] = useState<Supplier[]>(() => db.getSuppliers());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form Fields
  const [supplierName, setSupplierName] = useState(
    suppliers.length > 0 ? suppliers[0].name : 'Haji Aslam Leather Tanneries'
  );
  const [selectedProductId, setSelectedProductId] = useState<string>(
    preselectedProductId || (products.length > 0 ? products[0].id : '')
  );
  const [quantity, setQuantity] = useState<number>(50);
  const [costPerBelt, setCostPerBelt] = useState<number>(950);
  const [amountPaid, setAmountPaid] = useState<number>(40000);
  const [purchaseDate, setPurchaseDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    `BILL-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (preselectedProductId) {
      setSelectedProductId(preselectedProductId);
      const prod = products.find((p) => p.id === preselectedProductId);
      if (prod) {
        setCostPerBelt(prod.purchaseCost);
        setAmountPaid(50 * prod.purchaseCost);
      }
      setIsModalOpen(true);
    }
  }, [preselectedProductId, products]);

  const totalBill = quantity * costPerBelt;
  const remainingBalance = Math.max(0, totalBill - amountPaid);

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setCostPerBelt(prod.purchaseCost);
      const newTotal = quantity * prod.purchaseCost;
      setAmountPaid(newTotal);
    }
  };

  const handleQuantityOrCostChange = (qty: number, cost: number) => {
    setQuantity(qty);
    setCostPerBelt(cost);
    const newTotal = qty * cost;
    setAmountPaid(newTotal);
  };

  const handleOpenAdd = () => {
    setInvoiceNumber(`BILL-${Math.floor(1000 + Math.random() * 9000)}`);
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setIsModalOpen(true);
    setSuccessMsg(null);
  };

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0 || costPerBelt <= 0) return;

    // Find supplier id
    const sup = suppliers.find((s) => s.name === supplierName);
    const supplierId = sup ? sup.id : 'sup_' + Date.now();

    const result = db.addPurchase({
      supplierId,
      supplierName: supplierName.trim(),
      purchaseDate,
      productId: selectedProductId,
      quantity,
      costPerBelt,
      amountPaid,
      invoiceNumber: invoiceNumber.trim(),
      notes: notes.trim() || undefined,
    });

    setPurchases(db.getPurchases());
    setIsModalOpen(false);
    setSuccessMsg(
      `Purchase saved! Stock for ${result.updatedProduct.name} increased by ${quantity} pcs. New weighted avg cost: Rs.${result.updatedProduct.purchaseCost}/pc.`
    );
    onRefresh();
  };

  const filteredPurchases = purchases.filter(
    (p) =>
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 font-brand">
            {t.purchasesTitle}
          </h2>
          <p className="text-xs text-neutral-400">
            Log inward shipments from Kasur tanneries &amp; hardware suppliers, automatically updating inventory and weighted average costing
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-neutral-950" />
          <span>{t.recordPurchase}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-2 shadow">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 font-bold text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Search & List */}
      <div className={`p-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-4`}>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search purchases by supplier, belt name, invoice #..."
            className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-medium">
                <th className="pb-3">Bill / Inv #</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Supplier</th>
                <th className="pb-3">Belt Model</th>
                <th className="pb-3 text-center">Qty</th>
                <th className="pb-3 text-right">Cost/Belt</th>
                <th className="pb-3 text-right">Total Bill</th>
                <th className="pb-3 text-right">Paid</th>
                <th className="pb-3 text-right">Balance Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-sans">
              {filteredPurchases.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="py-3 font-mono font-bold text-amber-400">{p.invoiceNumber}</td>
                  <td className="py-3 text-neutral-400">{p.purchaseDate}</td>
                  <td className="py-3 font-medium text-neutral-200">{p.supplierName}</td>
                  <td className="py-3 text-neutral-300">
                    <span className="font-mono text-amber-300 text-[11px] mr-1">{p.productCode}</span>
                    {p.productName}
                  </td>
                  <td className="py-3 text-center font-bold text-emerald-400">+{p.quantity} pcs</td>
                  <td className="py-3 text-right font-mono text-neutral-300">Rs. {p.costPerBelt.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono font-bold text-neutral-100">Rs. {p.totalAmount.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono text-emerald-400">Rs. {p.amountPaid.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono">
                    {p.remainingBalance > 0 ? (
                      <span className="text-orange-400 font-bold">Rs. {p.remainingBalance.toLocaleString()}</span>
                    ) : (
                      <span className="text-neutral-500">Paid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Inward Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <h3 className="font-brand font-bold text-base text-neutral-100">
                  {t.recordPurchase}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSavePurchase} className="p-5 space-y-4 text-xs">
              {/* Supplier Selection */}
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">{t.supplierName} *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    list="suppliers-list"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Enter or select supplier..."
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                  <datalist id="suppliers-list">
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Belt Product Selection */}
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Belt Model to Restock *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name} (Current Stock: {p.availableQuantity} pcs, Cost: Rs.{p.purchaseCost})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity and Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">{t.quantityPurchased} *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => handleQuantityOrCostChange(Number(e.target.value), costPerBelt)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg font-mono text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">{t.costPerBelt} *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={costPerBelt}
                    onChange={(e) => handleQuantityOrCostChange(quantity, Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg font-mono text-neutral-100"
                  />
                </div>
              </div>

              {/* Total & Paid Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-400 mb-1">Total Bill</label>
                  <div className="px-3 py-2 bg-neutral-950/80 border border-neutral-800 rounded-lg font-mono font-bold text-amber-400 text-sm">
                    Rs. {totalBill.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">{t.amountPaid} (Rs.) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg font-mono text-emerald-400 font-bold"
                  />
                </div>
              </div>

              {remainingBalance > 0 && (
                <div className="p-2.5 rounded-lg bg-orange-950/30 border border-orange-500/30 text-orange-300 flex justify-between font-mono">
                  <span>Payable to Supplier:</span>
                  <span className="font-bold">Rs. {remainingBalance.toLocaleString()}</span>
                </div>
              )}

              {/* Date & Bill Number */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">{t.purchaseDate}</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">{t.invoiceNumber}</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 font-mono"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">{t.notes}</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Grade A cowhide leather, brass buckles included"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold shadow-md cursor-pointer"
                >
                  {t.savePurchase}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

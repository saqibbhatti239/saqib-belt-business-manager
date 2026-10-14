import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  CheckCircle2,
  AlertCircle,
  Printer,
  User,
  Phone,
  CreditCard,
  Percent,
  Plus,
  Minus,
  Sparkles,
  Camera,
  Barcode,
} from 'lucide-react';
import { AppSettings, BeltProduct, PaymentMethod, SaleItem } from '../types';
import { translations } from '../i18n/translations';
import { themes } from '../theme/themes';
import { db } from '../db/database';
import { BarcodeScannerModal } from './BarcodeScannerModal';

interface Props {
  settings: AppSettings;
  onRefresh: () => void;
  onOpenInvoice: (sale: SaleItem) => void;
}

export const PosSalesView: React.FC<Props> = ({
  settings,
  onRefresh,
  onOpenInvoice,
}) => {
  const t = translations[settings.language];
  const currentTheme = themes[settings.theme] || themes.black_gold;

  const [products] = useState<BeltProduct[]>(() => db.getProducts());
  const [customers] = useState(() => db.getCustomers());

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<BeltProduct | null>(
    products.length > 0 ? products[0] : null
  );

  // Sale form states
  const [quantity, setQuantity] = useState<number>(1);
  const [sellingPrice, setSellingPrice] = useState<number>(
    products.length > 0 ? products[0].sellingPrice : 0
  );
  const [discount, setDiscount] = useState<number>(0);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amountReceived, setAmountReceived] = useState<number>(
    products.length > 0 ? products[0].sellingPrice : 0
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [saleDate, setSaleDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [scanSuccessToast, setScanSuccessToast] = useState<string | null>(null);

  // When product changes
  const handleSelectProduct = (p: BeltProduct) => {
    setSelectedProduct(p);
    setSellingPrice(p.sellingPrice);
    setQuantity(1);
    const total = p.sellingPrice - discount;
    setAmountReceived(Math.max(0, total));
    setErrorMsg(null);
  };

  // Barcode scanned from device camera
  const handleBarcodeScan = (scannedCode: string) => {
    const query = scannedCode.trim().toLowerCase();
    const matched = products.find(
      (p) =>
        p.code.toLowerCase() === query ||
        p.id.toLowerCase() === query ||
        p.name.toLowerCase() === query
    );

    if (matched) {
      handleSelectProduct(matched);
      setSearchTerm(matched.code);
      setScanSuccessToast(`Belt found: ${matched.name} (${matched.code})`);
      setTimeout(() => setScanSuccessToast(null), 4000);
    } else {
      setErrorMsg(`No belt product found with code "${scannedCode}". Please check code or add new belt in catalog.`);
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  // Tax configuration from Settings
  const taxConfig = settings.tax || {
    enabled: true,
    name: 'GST',
    rate: 17,
    taxNumber: 'STRN-3277876192834',
    isInclusive: false,
  };
  const isTaxActive = taxConfig.enabled && taxConfig.rate > 0;
  const taxRate = isTaxActive ? taxConfig.rate : 0;
  const isInclusive = taxConfig.isInclusive;

  // Math calculations
  const subtotal = selectedProduct ? quantity * sellingPrice : 0;
  const netBeforeTax = Math.max(0, subtotal - discount);

  let taxAmount = 0;
  let totalAmount = netBeforeTax;

  if (isTaxActive) {
    if (isInclusive) {
      taxAmount = Math.round(netBeforeTax - netBeforeTax / (1 + taxRate / 100));
      totalAmount = netBeforeTax;
    } else {
      taxAmount = Math.round(netBeforeTax * (taxRate / 100));
      totalAmount = netBeforeTax + taxAmount;
    }
  }

  const remainingBalance = Math.max(0, totalAmount - amountReceived);

  // Helper to recalculate total for input handlers
  const calcTotal = (qty: number, price: number, disc: number) => {
    const raw = qty * price;
    const net = Math.max(0, raw - disc);
    if (!isTaxActive) return net;
    if (isInclusive) return net;
    return net + Math.round(net * (taxRate / 100));
  };

  // Update received when total changes if it was full payment
  const handleQuantityChange = (newQty: number) => {
    if (!selectedProduct) return;
    if (newQty < 1) return;
    if (newQty > selectedProduct.availableQuantity) {
      setErrorMsg(
        `Cannot sell ${newQty} items! Only ${selectedProduct.availableQuantity} pieces currently available in inventory.`
      );
      return;
    }
    setErrorMsg(null);
    setQuantity(newQty);
    setAmountReceived(calcTotal(newQty, sellingPrice, discount));
  };

  const handleSellingPriceChange = (val: number) => {
    setSellingPrice(val);
    setAmountReceived(calcTotal(quantity, val, discount));
  };

  const handleDiscountChange = (val: number) => {
    setDiscount(val);
    setAmountReceived(calcTotal(quantity, sellingPrice, val));
  };

  const handleSelectExistingCustomer = (cName: string, cPhone?: string) => {
    setCustomerName(cName);
    if (cPhone) setCustomerPhone(cPhone);
  };

  const handleSubmitSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      setErrorMsg('Please select a belt from the catalog');
      return;
    }

    if (quantity > selectedProduct.availableQuantity) {
      setErrorMsg(
        `Insufficient stock! Only ${selectedProduct.availableQuantity} pcs in stock.`
      );
      return;
    }

    try {
      const { sale } = db.addSale({
        productId: selectedProduct.id,
        quantity,
        sellingPrice,
        discount,
        taxRate: isTaxActive ? taxRate : 0,
        taxAmount: isTaxActive ? taxAmount : 0,
        taxName: taxConfig.name || 'GST',
        totalAmount,
        amountReceived,
        saleDate,
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone: customerPhone.trim() || undefined,
        paymentMethod,
        notes: notes.trim() || undefined,
      });

      onRefresh();
      // Auto open generated invoice
      onOpenInvoice(sale);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing sale');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.design.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 font-brand">
          {t.salesTitle}
        </h2>
        <p className="text-xs text-neutral-400">
          Fast counter POS terminal with instant stock depletion validation and automatic receipt generation
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Belt Catalog Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className={`p-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-3`}>
            {scanSuccessToast && (
              <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between animate-fade-in font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {scanSuccessToast}
                </span>
                <button type="button" onClick={() => setScanSuccessToast(null)} className="text-emerald-400 hover:text-white">✕</button>
              </div>
            )}

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search belt by code, name, design..."
                  className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-2.5 text-xs text-neutral-500 hover:text-neutral-300"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Barcode Camera Scanner Trigger */}
              <button
                type="button"
                onClick={() => setIsBarcodeModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-95"
                title="Scan barcode with device camera"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Scan Barcode</span>
                <Barcode className="w-3.5 h-3.5 opacity-80" />
              </button>
            </div>

            {/* Belts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const isSelected = selectedProduct?.id === p.id;
                const isOutOfStock = p.availableQuantity <= 0;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => handleSelectProduct(p)}
                    className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 shadow-md ring-1 ring-amber-500'
                        : isOutOfStock
                        ? 'border-neutral-800 bg-neutral-950/40 opacity-50 cursor-not-allowed'
                        : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-lg bg-neutral-800 shrink-0 overflow-hidden relative">
                      {p.photoUrl ? (
                        <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600 font-bold text-xs">
                          BLT
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-amber-400">{p.code}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isOutOfStock
                              ? 'bg-red-950 text-red-400'
                              : p.availableQuantity <= p.minStockLevel
                              ? 'bg-amber-950 text-amber-300'
                              : 'bg-emerald-950 text-emerald-300'
                          }`}
                        >
                          {p.availableQuantity} {t.units}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-neutral-200 truncate mt-0.5">{p.name}</h4>
                      <p className="text-[10px] text-neutral-400">
                        Size {p.size} · {p.colour}
                      </p>
                      <div className="text-xs font-mono font-bold text-neutral-100 mt-1">
                        Rs. {p.sellingPrice.toLocaleString()}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Checkout & POS Bill Builder (5 cols) */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSubmitSale}
            className={`p-5 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-xl space-y-4`}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                <h3 className="font-brand font-bold text-base text-neutral-100">Sale Cart</h3>
              </div>
              <span className="text-xs text-neutral-400 font-mono">{saleDate}</span>
            </div>

            {selectedProduct ? (
              <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">{selectedProduct.code}</span>
                  <span className="text-xs text-neutral-400">
                    Max in Stock: <strong className="text-amber-300">{selectedProduct.availableQuantity} pcs</strong>
                  </span>
                </div>
                <div className="font-bold text-sm text-neutral-100">{selectedProduct.name}</div>
                <div className="text-[11px] text-neutral-400">
                  {selectedProduct.design} · {selectedProduct.material} · Waist {selectedProduct.size}
                </div>

                {/* Quantity Controls */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-neutral-300 font-semibold">{t.quantitySold}:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center justify-center font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={selectedProduct.availableQuantity}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(Number(e.target.value))}
                      className="w-14 text-center py-1 bg-neutral-950 border border-neutral-700 rounded-lg text-xs font-bold text-neutral-100"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center justify-center font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-neutral-800 rounded-xl text-neutral-500 text-xs">
                Select a belt from the catalog to build sale bill
              </div>
            )}

            {/* Pricing Adjustments */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">{t.sellingPrice} (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => handleSellingPriceChange(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg font-mono text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">{t.discount} (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => handleDiscountChange(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg font-mono text-neutral-100"
                />
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-2 pt-2 border-t border-neutral-800 text-xs">
              <label className="block font-semibold text-neutral-300">Customer Details (Optional for Udhar)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder={t.customerName}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                />
                <input
                  type="tel"
                  placeholder={t.customerPhone}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                />
              </div>

              {/* Quick Customer Picker */}
              {customers.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  <span className="text-[10px] text-neutral-500 shrink-0">Recent:</span>
                  {customers.slice(0, 3).map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => handleSelectExistingCustomer(c.name, c.phone)}
                      className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300 shrink-0 cursor-pointer"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method & Received */}
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">{t.paymentMethod}</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 cursor-pointer"
                  >
                    <option value="Cash">Cash (نقد)</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit / Udhar">Credit / Udhar (ادھار)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">{t.amountReceived} (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg font-mono text-emerald-400 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Bill Summary Calculations */}
            <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal ({quantity} pcs):</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Discount:</span>
                  <span>- Rs. {discount.toLocaleString()}</span>
                </div>
              )}
              {isTaxActive && taxRate > 0 && !isInclusive && (
                <div className="flex justify-between text-sky-400 font-semibold">
                  <span>{taxConfig.name || 'GST'} ({taxRate}%):</span>
                  <span>+ Rs. {taxAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-100 font-bold text-sm pt-1 border-t border-neutral-800">
                <span>Total Net Bill:</span>
                <span className="text-amber-400">Rs. {totalAmount.toLocaleString()}</span>
              </div>
              {isTaxActive && taxRate > 0 && isInclusive && (
                <div className="text-[10px] text-neutral-500 italic">
                  * Price includes {taxConfig.name || 'GST'} ({taxRate}%): Rs. {taxAmount.toLocaleString()}
                </div>
              )}
              <div className="flex justify-between text-emerald-400">
                <span>Amount Received:</span>
                <span>Rs. {amountReceived.toLocaleString()}</span>
              </div>
              {remainingBalance > 0 ? (
                <div className="flex justify-between text-red-400 font-bold">
                  <span>Customer Due (Udhar):</span>
                  <span>Rs. {remainingBalance.toLocaleString()}</span>
                </div>
              ) : (
                <div className="flex justify-between text-neutral-500 text-[11px]">
                  <span>Payment Status:</span>
                  <span className="text-emerald-400">Paid in Full</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedProduct || (selectedProduct && selectedProduct.availableQuantity < quantity)}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4 text-neutral-950" />
              <span>{t.completeSale}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Barcode Camera Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onScan={handleBarcodeScan}
        products={products}
        title="POS Barcode Scanner"
        subtitle="Align camera with belt price tag or code to auto-add to cart"
      />
    </div>
  );
};

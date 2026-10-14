import React, { useState } from 'react';
import {
  Users,
  Building2,
  DollarSign,
  Phone,
  Search,
  Plus,
  CreditCard,
  MessageCircle,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Calendar,
} from 'lucide-react';
import { AppSettings, Customer, CustomerPayment, PaymentMethod, Supplier, SupplierPayment } from '../types';
import { translations } from '../i18n/translations';
import { themes } from '../theme/themes';
import { db } from '../db/database';

interface Props {
  settings: AppSettings;
  onRefresh: () => void;
}

export const LedgersView: React.FC<Props> = ({ settings, onRefresh }) => {
  const t = translations[settings.language];
  const currentTheme = themes[settings.theme] || themes.black_gold;

  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');
  const [searchTerm, setSearchTerm] = useState('');

  const [customers, setCustomers] = useState<Customer[]>(() => db.getCustomers());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => db.getSuppliers());

  // Selected ledger for drilldown
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Payment Modals
  const [isCustomerPayModal, setIsCustomerPayModal] = useState(false);
  const [isSupplierPayModal, setIsSupplierPayModal] = useState(false);

  // Add Entity Modals
  const [isAddCustModal, setIsAddCustModal] = useState(false);
  const [isAddSupModal, setIsAddSupModal] = useState(false);

  // Payment Form States
  const [payAmount, setPayAmount] = useState<number>(1000);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Cash');
  const [payNotes, setPayNotes] = useState('');

  // New Customer Form States
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // New Supplier Form States
  const [newSupName, setNewSupName] = useState('');
  const [newSupCompany, setNewSupCompany] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupCity, setNewSupCity] = useState('');

  const refreshAll = () => {
    setCustomers(db.getCustomers());
    setSuppliers(db.getSuppliers());
    if (selectedCustomer) {
      const updated = db.getCustomers().find((c) => c.id === selectedCustomer.id);
      setSelectedCustomer(updated || null);
    }
    if (selectedSupplier) {
      const updated = db.getSuppliers().find((s) => s.id === selectedSupplier.id);
      setSelectedSupplier(updated || null);
    }
    onRefresh();
  };

  const handleRecordCustomerPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || payAmount <= 0) return;

    db.recordCustomerPayment({
      customerId: selectedCustomer.id,
      amount: payAmount,
      paymentMethod: payMethod,
      notes: payNotes.trim() || undefined,
    });

    setIsCustomerPayModal(false);
    setPayNotes('');
    refreshAll();
  };

  const handleRecordSupplierPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || payAmount <= 0) return;

    db.recordSupplierPayment({
      supplierId: selectedSupplier.id,
      amount: payAmount,
      paymentMethod: payMethod,
      notes: payNotes.trim() || undefined,
    });

    setIsSupplierPayModal(false);
    setPayNotes('');
    refreshAll();
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    db.addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim() || undefined,
    });

    setIsAddCustModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    refreshAll();
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim()) return;

    db.addSupplier({
      name: newSupName.trim(),
      company: newSupCompany.trim() || undefined,
      phone: newSupPhone.trim(),
      city: newSupCity.trim() || undefined,
    });

    setIsAddSupModal(false);
    setNewSupName('');
    setNewSupCompany('');
    setNewSupPhone('');
    setNewSupCity('');
    refreshAll();
  };

  const handleWhatsAppCustomer = (c: Customer) => {
    const text = encodeURIComponent(
      `Assalam-o-Alaikum ${c.name} Bhai,\nThis is from *SAQIB Belt Business*.\nYour current remaining balance is *Rs. ${c.outstandingBalance.toLocaleString()}*.\nPlease clear the dues when convenient.\nThank you! (Saqib, Adil, Javaid)`
    );
    window.open(`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.company && s.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 font-brand">
            Ledger &amp; Accounts
          </h2>
          <p className="text-xs text-neutral-400">
            Track customer credit balances (Udhar) and supplier payables with partial receipts and payment logs
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('customers');
                setSelectedCustomer(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'customers'
                  ? 'bg-amber-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t.customersTitle}</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('suppliers');
                setSelectedSupplier(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'suppliers'
                  ? 'bg-amber-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t.suppliersTitle}</span>
            </button>
          </div>

          <button
            onClick={() => (activeTab === 'customers' ? setIsAddCustModal(true) : setIsAddSupModal(true))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow cursor-pointer"
          >
            <Plus className="w-4 h-4 text-neutral-950" />
            <span>{activeTab === 'customers' ? t.addCustomer : t.addSupplier}</span>
          </button>
        </div>
      </div>

      {/* CUSTOMER LEDGER VIEW */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer name, phone number..."
              className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Customer List (6 cols) */}
            <div className="lg:col-span-6 space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
              {filteredCustomers.map((c) => {
                const isSelected = selectedCustomer?.id === c.id;
                const hasDue = c.outstandingBalance > 0;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 shadow-md ring-1 ring-amber-500'
                        : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-neutral-100">{c.name}</h4>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-neutral-500" />
                          {c.phone || 'No phone'}
                        </span>
                        {c.address && <span>· {c.address}</span>}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-1">
                        Total Purchases: Rs. {c.totalPurchased.toLocaleString()} · Paid: Rs. {c.totalPaid.toLocaleString()}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Udhar Balance</span>
                      <span className={`font-mono font-bold text-sm ${hasDue ? 'text-amber-400' : 'text-emerald-400'}`}>
                        Rs. {c.outstandingBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Customer Statement & Payment Drilldown (6 cols) */}
            <div className="lg:col-span-6">
              {selectedCustomer ? (
                <div className={`p-5 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-lg space-y-4`}>
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div>
                      <h3 className="font-brand font-bold text-base text-neutral-100">{selectedCustomer.name}</h3>
                      <p className="text-xs text-neutral-400">{selectedCustomer.phone || 'Retail Customer'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedCustomer.phone && (
                        <button
                          onClick={() => handleWhatsAppCustomer(selectedCustomer)}
                          className="p-2 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          title="Send balance reminder on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setPayAmount(selectedCustomer.outstandingBalance);
                          setIsCustomerPayModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold shadow cursor-pointer"
                      >
                        {t.recordPayment}
                      </button>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase">Total Invoiced</span>
                      <span className="font-bold text-neutral-200">Rs. {selectedCustomer.totalPurchased.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase">Total Paid</span>
                      <span className="font-bold text-emerald-400">Rs. {selectedCustomer.totalPaid.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase">Current Due</span>
                      <span className="font-bold text-amber-400">Rs. {selectedCustomer.outstandingBalance.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Sales & Payments History Ledger */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-neutral-300">Transaction Ledger</h4>
                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 text-xs">
                      {db
                        .getSales()
                        .filter((s) => s.customerId === selectedCustomer.id || s.customerName.toLowerCase() === selectedCustomer.name.toLowerCase())
                        .map((s) => (
                          <div key={s.id} className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-neutral-200">
                                {s.productName} <span className="text-neutral-400">({s.quantity} pcs)</span>
                              </div>
                              <div className="text-[10px] text-neutral-400 font-mono">
                                {s.invoiceNumber} · {s.saleDate}
                              </div>
                            </div>
                            <div className="text-right font-mono">
                              <span className="text-neutral-200 font-bold">Rs. {s.totalAmount.toLocaleString()}</span>
                              <div className="text-[10px] text-emerald-400">Paid: Rs. {s.amountReceived.toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-10 rounded-2xl border border-dashed border-neutral-800 text-center text-neutral-500 text-xs">
                  Select a customer from the left to view complete statement, payments, and send WhatsApp reminder
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUPPLIER LEDGER VIEW */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Suppliers List (6 cols) */}
            <div className="lg:col-span-6 space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
              {filteredSuppliers.map((s) => {
                const isSelected = selectedSupplier?.id === s.id;
                const hasDue = s.outstandingBalance > 0;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSupplier(s)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 shadow-md ring-1 ring-amber-500'
                        : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-neutral-100">{s.name}</h4>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                        <span>{s.company || 'Tannery / Hardware'}</span>
                        {s.city && <span>· {s.city}</span>}
                        <span>· {s.phone}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-1">
                        Total Purchased: Rs. {s.totalPurchased.toLocaleString()} · Paid: Rs. {s.totalPaid.toLocaleString()}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Payable Balance</span>
                      <span className={`font-mono font-bold text-sm ${hasDue ? 'text-orange-400' : 'text-neutral-500'}`}>
                        Rs. {s.outstandingBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Supplier Drilldown Statement (6 cols) */}
            <div className="lg:col-span-6">
              {selectedSupplier ? (
                <div className={`p-5 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-lg space-y-4`}>
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div>
                      <h3 className="font-brand font-bold text-base text-neutral-100">{selectedSupplier.name}</h3>
                      <p className="text-xs text-neutral-400">{selectedSupplier.company || 'Tannery'} · {selectedSupplier.city}</p>
                    </div>

                    <button
                      onClick={() => {
                        setPayAmount(selectedSupplier.outstandingBalance);
                        setIsSupplierPayModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold shadow cursor-pointer"
                    >
                      Pay Supplier
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase">Total Bills</span>
                      <span className="font-bold text-neutral-200">Rs. {selectedSupplier.totalPurchased.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase">Paid to Supplier</span>
                      <span className="font-bold text-emerald-400">Rs. {selectedSupplier.totalPaid.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase">Remaining Due</span>
                      <span className="font-bold text-orange-400">Rs. {selectedSupplier.outstandingBalance.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Purchase Bills Ledger */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-neutral-300">Inward Shipments &amp; Invoices</h4>
                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 text-xs">
                      {db
                        .getPurchases()
                        .filter((p) => p.supplierId === selectedSupplier.id || p.supplierName.toLowerCase() === selectedSupplier.name.toLowerCase())
                        .map((p) => (
                          <div key={p.id} className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-neutral-200">
                                {p.productName} <span className="text-neutral-400">({p.quantity} pcs)</span>
                              </div>
                              <div className="text-[10px] text-neutral-400 font-mono">
                                Bill #{p.invoiceNumber} · {p.purchaseDate}
                              </div>
                            </div>
                            <div className="text-right font-mono">
                              <span className="text-neutral-200 font-bold">Rs. {p.totalAmount.toLocaleString()}</span>
                              <div className="text-[10px] text-emerald-400">Paid: Rs. {p.amountPaid.toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-10 rounded-2xl border border-dashed border-neutral-800 text-center text-neutral-500 text-xs">
                  Select a supplier from the left to view inward purchases, pending bills, and record payments
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Payment Modal */}
      {isCustomerPayModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl p-5 space-y-4 text-xs shadow-2xl">
            <h3 className="font-brand font-bold text-base text-neutral-100">
              Receive Payment from {selectedCustomer.name}
            </h3>
            <div className="text-neutral-400">
              Current Due: <strong className="text-amber-400 font-mono">Rs. {selectedCustomer.outstandingBalance.toLocaleString()}</strong>
            </div>

            <form onSubmit={handleRecordCustomerPayment} className="space-y-3">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Amount Received (Rs.) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg font-mono text-emerald-400 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                >
                  <option value="Cash">Cash (نقد)</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Cleared partial pending balance"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerPayModal(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 text-neutral-950 font-bold shadow"
                >
                  Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Payment Modal */}
      {isSupplierPayModal && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl p-5 space-y-4 text-xs shadow-2xl">
            <h3 className="font-brand font-bold text-base text-neutral-100">
              Pay Supplier: {selectedSupplier.name}
            </h3>
            <div className="text-neutral-400">
              Remaining Payable: <strong className="text-orange-400 font-mono">Rs. {selectedSupplier.outstandingBalance.toLocaleString()}</strong>
            </div>

            <form onSubmit={handleRecordSupplierPayment} className="space-y-3">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Amount Paid (Rs.) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg font-mono text-emerald-400 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Notes / Bill Reference</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Kasur cargo delivery bill cleared"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierPayModal(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 text-neutral-950 font-bold shadow"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {isAddCustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl p-5 space-y-4 text-xs shadow-2xl">
            <h3 className="font-brand font-bold text-base text-neutral-100">{t.addCustomer}</h3>
            <form onSubmit={handleAddCustomer} className="space-y-3">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">{t.customerName} *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Chaudhry Tariq"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">{t.phone}</label>
                <input
                  type="tel"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">{t.address}</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="Shop / Area, Lahore"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddCustModal(false)} className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-neutral-950 font-bold">
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Supplier Modal */}
      {isAddSupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl p-5 space-y-4 text-xs shadow-2xl">
            <h3 className="font-brand font-bold text-base text-neutral-100">{t.addSupplier}</h3>
            <form onSubmit={handleAddSupplier} className="space-y-3">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">{t.supplierName} *</label>
                <input
                  type="text"
                  required
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  placeholder="e.g. Kashif Buckle Traders"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Company / Brand</label>
                <input
                  type="text"
                  value={newSupCompany}
                  onChange={(e) => setNewSupCompany(e.target.value)}
                  placeholder="e.g. Kasur Tanneries Ltd."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">{t.phone}</label>
                <input
                  type="tel"
                  value={newSupPhone}
                  onChange={(e) => setNewSupPhone(e.target.value)}
                  placeholder="+92 321 9876543"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">{t.city}</label>
                <input
                  type="text"
                  value={newSupCity}
                  onChange={(e) => setNewSupCity(e.target.value)}
                  placeholder="Kasur / Lahore / Gujranwala"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddSupModal(false)} className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-neutral-950 font-bold">
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

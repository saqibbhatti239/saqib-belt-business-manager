import React, { useState } from 'react';
import {
  Printer,
  X,
  Share2,
  CheckCircle,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Mail,
  Copy,
} from 'lucide-react';
import { AppSettings, SaleItem } from '../types';
import { translations } from '../i18n/translations';

interface Props {
  sale: SaleItem | null;
  settings: AppSettings;
  onClose: () => void;
}

export const InvoiceModal: React.FC<Props> = ({ sale, settings, onClose }) => {
  if (!sale) return null;

  const t = translations[settings.language];
  const [copied, setCopied] = React.useState(false);

  const rawSubtotal = sale.quantity * sale.sellingPrice;
  const netBeforeTax = Math.max(0, rawSubtotal - (sale.discount || 0));

  // Tax Management & Configuration
  const taxConfig = settings.tax || {
    enabled: true,
    name: 'GST',
    rate: 17,
    taxNumber: 'STRN-3277876192834',
    isInclusive: false,
  };

  const isTaxActive =
    sale.taxAmount !== undefined
      ? sale.taxAmount > 0 || (sale.taxRate ?? 0) > 0
      : taxConfig.enabled;
  const taxName = sale.taxName || taxConfig.name || 'GST';
  const taxRate =
    sale.taxRate !== undefined ? sale.taxRate : taxConfig.enabled ? taxConfig.rate : 0;
  const isInclusive = taxConfig.isInclusive;

  // Calculate tax amount automatically
  let calculatedTax = 0;
  let displayTotal = sale.totalAmount;

  if (isTaxActive && taxRate > 0) {
    if (sale.taxAmount !== undefined) {
      calculatedTax = sale.taxAmount;
      displayTotal = sale.totalAmount;
    } else if (isInclusive) {
      // Selling price is tax inclusive
      calculatedTax = Math.round(netBeforeTax - netBeforeTax / (1 + taxRate / 100));
      displayTotal = netBeforeTax;
    } else {
      // Selling price is tax exclusive (tax added on top)
      calculatedTax = Math.round(netBeforeTax * (taxRate / 100));
      // If sale totalAmount was recorded without tax, display the total with tax
      displayTotal =
        sale.totalAmount === netBeforeTax
          ? netBeforeTax + calculatedTax
          : sale.totalAmount;
    }
  }

  const getInvoiceText = () => {
    let taxLine = '';
    if (isTaxActive && taxRate > 0) {
      taxLine = isInclusive
        ? `Tax: Includes ${taxName} (${taxRate}%): Rs. ${calculatedTax.toLocaleString()}\n`
        : `${taxName} (${taxRate}%): +Rs. ${calculatedTax.toLocaleString()}\n`;
    }

    const regNumber = taxConfig.taxNumber ? `Tax Reg # (${taxName}): ${taxConfig.taxNumber}\n` : '';

    return (
      `*SALES INVOICE — ${settings.businessName.toUpperCase()}*\n` +
      `Invoice #: ${sale.invoiceNumber}\n` +
      `Date: ${sale.saleDate}\n` +
      regNumber +
      `Customer: ${sale.customerName}${sale.customerPhone ? ' (' + sale.customerPhone + ')' : ''}\n` +
      `Item: ${sale.productName} [Code: ${sale.productCode}]\n` +
      `Quantity: ${sale.quantity} pcs @ Rs. ${sale.sellingPrice.toLocaleString()}\n` +
      `Subtotal: Rs. ${rawSubtotal.toLocaleString()}\n` +
      (sale.discount > 0 ? `Discount: -Rs. ${sale.discount.toLocaleString()}\n` : '') +
      taxLine +
      `Total Net Bill: Rs. ${displayTotal.toLocaleString()}\n` +
      `Amount Paid: Rs. ${sale.amountReceived.toLocaleString()}\n` +
      `Balance Due (Udhar): Rs. ${Math.max(0, displayTotal - sale.amountReceived).toLocaleString()}\n` +
      `Payment Mode: ${sale.paymentMethod}\n` +
      `Status: ${Math.max(0, displayTotal - sale.amountReceived) > 0 ? 'Balance Pending' : 'Fully Settled'}\n\n` +
      `Thank you for doing business with ${settings.businessName}!\n` +
      `Address: ${settings.businessAddress}\n` +
      `Phone: ${settings.businessPhone}`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  // Mobile Native Web Share API (WhatsApp, Messages, Telegram, Social Media, Gmail)
  const handleNativeShare = async () => {
    const invoiceText = getInvoiceText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${sale.invoiceNumber} - ${settings.businessName}`,
          text: invoiceText,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // Fallback to clipboard
          copyToClipboard(invoiceText);
        }
      }
    } else {
      copyToClipboard(invoiceText);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Invoice #${sale.invoiceNumber} — ${settings.businessName}`);
    const body = encodeURIComponent(getInvoiceText());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(getInvoiceText());
    const phone = sale.customerPhone ? sale.customerPhone.replace(/[^0-9]/g, '') : '';
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Top Modal Controls (Hidden in print) */}
        <div className="p-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between no-print">
          <span className="text-xs font-semibold text-amber-400 font-brand">
            Retail Invoice Preview
          </span>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {/* Native Mobile Share API */}
            <button
              onClick={handleNativeShare}
              className="p-1.5 rounded-lg bg-sky-600/20 text-sky-300 hover:bg-sky-600/30 text-xs flex items-center gap-1 cursor-pointer transition-colors"
              title="Share via Native Share (Apps, Messages, Email)"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Email Share Button */}
            <button
              onClick={handleEmailShare}
              className="p-1.5 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 text-xs flex items-center gap-1 cursor-pointer transition-colors"
              title="Share via Email"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Email</span>
            </button>

            {/* WhatsApp Share Button */}
            <button
              onClick={handleWhatsAppShare}
              className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 text-xs flex items-center gap-1 cursor-pointer transition-colors"
              title="Share via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Print Receipt Button */}
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1 cursor-pointer shadow"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5 text-neutral-950" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Share Copy Notification Banner */}
        {copied && (
          <div className="bg-emerald-950 border-b border-emerald-500/40 text-emerald-300 px-4 py-2 text-xs flex items-center justify-between animate-fade-in no-print">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Invoice text copied to clipboard!
            </span>
          </div>
        )}

        {/* Printable Receipt Paper */}
        <div className="p-6 bg-white text-neutral-950 printable-invoice space-y-4 font-mono text-xs">
          {/* Header */}
          <div className="text-center border-b border-dashed border-neutral-400 pb-3">
            <h2 className="text-lg font-black font-brand uppercase tracking-wider text-neutral-950">
              {settings.businessName}
            </h2>
            <p className="text-[10px] text-neutral-600 font-sans">
              Specialist in Full-Grain, Buffalo Hide &amp; Ratchet Leather Belts
            </p>
            <p className="text-[10px] text-neutral-600">
              {settings.businessAddress}
            </p>
            <p className="text-[10px] text-neutral-600">
              Phone: {settings.businessPhone}
            </p>
            {taxConfig.taxNumber && (
              <p className="text-[10px] font-bold text-neutral-800">
                {taxName} Reg # (STRN/NTN): {taxConfig.taxNumber}
              </p>
            )}
            <p className="text-[9px] text-neutral-500 mt-0.5">
              Partners: Saqib · Adil · Javaid
            </p>
          </div>

          {/* Invoice Meta */}
          <div className="space-y-0.5 text-[11px] border-b border-dashed border-neutral-300 pb-2">
            <div className="flex justify-between">
              <span className="font-bold">Invoice #:</span>
              <span className="font-bold">{sale.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{sale.saleDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-bold">{sale.customerName}</span>
            </div>
            {sale.customerPhone && (
              <div className="flex justify-between">
                <span>Phone:</span>
                <span>{sale.customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span>{sale.paymentMethod}</span>
            </div>
          </div>

          {/* Line Items */}
          <div className="border-b border-dashed border-neutral-400 pb-2">
            <div className="flex justify-between font-bold border-b border-neutral-300 pb-1 text-[11px]">
              <span>Item Description</span>
              <span className="text-right">Amount (PKR)</span>
            </div>

            <div className="pt-1.5 space-y-1">
              <div className="flex justify-between font-medium">
                <div>
                  <div>{sale.productName}</div>
                  <div className="text-[10px] text-neutral-600">
                    Code: {sale.productCode} · Qty: {sale.quantity} @ Rs.{sale.sellingPrice}
                  </div>
                </div>
                <div className="text-right font-bold">
                  Rs. {rawSubtotal.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-1 text-[11px] border-b border-dashed border-neutral-400 pb-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rs. {rawSubtotal.toLocaleString()}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-neutral-700">
                <span>Discount:</span>
                <span>- Rs. {sale.discount.toLocaleString()}</span>
              </div>
            )}
            {/* Applicable Sales Tax (GST / VAT) */}
            {isTaxActive && taxRate > 0 && !isInclusive && (
              <div className="flex justify-between font-semibold text-neutral-900">
                <span>{taxName} ({taxRate}%):</span>
                <span>+ Rs. {calculatedTax.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-sm pt-1 border-t border-neutral-300">
              <span>Total Bill:</span>
              <span>Rs. {displayTotal.toLocaleString()}</span>
            </div>
            {isTaxActive && taxRate > 0 && isInclusive && (
              <div className="text-[9.5px] text-neutral-600 italic">
                * Price includes {taxName} ({taxRate}%): Rs. {calculatedTax.toLocaleString()}
              </div>
            )}
            <div className="flex justify-between font-bold text-neutral-800">
              <span>Amount Received:</span>
              <span>Rs. {sale.amountReceived.toLocaleString()}</span>
            </div>
            {Math.max(0, displayTotal - sale.amountReceived) > 0 ? (
              <div className="flex justify-between font-bold text-red-600">
                <span>Balance Due (Udhar):</span>
                <span>Rs. {Math.max(0, displayTotal - sale.amountReceived).toLocaleString()}</span>
              </div>
            ) : (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Status:</span>
                <span>Fully Paid</span>
              </div>
            )}
          </div>

          {/* Barcode & Footer Greeting */}
          <div className="text-center pt-2 space-y-1">
            <div className="h-7 w-3/4 mx-auto bg-neutral-900 flex items-center justify-center text-white text-[9px] tracking-widest font-mono">
              ||| {sale.invoiceNumber} |||
            </div>
            <p className="text-[10px] font-bold text-neutral-800">
              Pure Leather Warranty Guarantee
            </p>
            <p className="text-[9px] text-neutral-500">
              No cash returns after 3 days. Original receipt required for exchange.
            </p>
          </div>
        </div>

        {/* Modal Bottom Buttons (Hidden in print) */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex justify-end gap-2 no-print">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

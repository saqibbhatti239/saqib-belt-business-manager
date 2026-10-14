import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { BeltProduct, BeltCategory } from '../types';
import { db } from '../db/database';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (importedCount: number) => void;
}

interface ParsedBeltRow {
  code: string;
  name: string;
  design?: string;
  category?: string;
  colour?: string;
  size?: string;
  material?: string;
  purchaseCost: number;
  sellingPrice: number;
  availableQuantity: number;
  minStockLevel: number;
  isValid: boolean;
  error?: string;
}

const SAMPLE_CSV = `Code,Name,Design,Category,Colour,Size,Material,PurchaseCost,SellingPrice,OpeningStock,MinStock
BLT-501,Formal Calfskin Executive,Formal Stitch,Executive Formal,Black,34,Full Grain Leather,1100,1950,25,5
BLT-502,Heavy Duty Buffalo Jeans,Heavy Duty Jeans,Casual & Denim,Dark Brown,36,Genuine Buffalo Leather,1250,2200,30,8
BLT-503,Wedding Gold Buckle Velvet,Custom Designer,Wedding & Festive,Burgundy,32,Top Grain Cowhide,1400,2600,15,4
BLT-504,Casual Olive Webbing Belt,Casual Canvas,Summer Breeze,Olive Green,Free Size (Adjustable),Military Canvas,650,1200,40,10`;

export const CsvImportModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvRawText, setCsvRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedBeltRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'belt_inventory_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseCsvContent = (content: string) => {
    setParseError(null);
    try {
      const lines = content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length < 2) {
        setParseError('CSV must include a header row and at least one data row.');
        setParsedRows([]);
        return;
      }

      // Split header
      const headers = lines[0]
        .split(',')
        .map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

      const codeIdx = headers.findIndex((h) => h === 'code' || h === 'belt code' || h === 'product code');
      const nameIdx = headers.findIndex((h) => h === 'name' || h === 'belt name' || h === 'title');
      const designIdx = headers.findIndex((h) => h === 'design' || h === 'style' || h === 'buckle');
      const categoryIdx = headers.findIndex((h) => h === 'category' || h === 'collection');
      const colourIdx = headers.findIndex((h) => h === 'colour' || h === 'color');
      const sizeIdx = headers.findIndex((h) => h === 'size' || h === 'waist size');
      const materialIdx = headers.findIndex((h) => h === 'material' || h === 'leather');
      const costIdx = headers.findIndex((h) => h.includes('cost') || h.includes('purchase'));
      const priceIdx = headers.findIndex((h) => h.includes('price') || h.includes('sale') || h.includes('selling'));
      const stockIdx = headers.findIndex((h) => h.includes('stock') || h.includes('quantity') || h.includes('qty'));
      const minStockIdx = headers.findIndex((h) => h.includes('min') || h.includes('alert') || h.includes('threshold'));

      if (codeIdx === -1 || nameIdx === -1) {
        setParseError('CSV header must contain at least "Code" and "Name" columns.');
        setParsedRows([]);
        return;
      }

      const rows: ParsedBeltRow[] = [];
      const seenCodes = new Set<string>();

      for (let i = 1; i < lines.length; i++) {
        // Parse comma separated respecting possible quotes
        const rawLine = lines[i];
        const cols: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let c = 0; c < rawLine.length; c++) {
          const char = rawLine[c];
          if (char === '"' || char === "'") {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            cols.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        cols.push(cur.trim());

        const codeVal = cols[codeIdx] ? cols[codeIdx].replace(/^["']|["']$/g, '').trim().toUpperCase() : '';
        const nameVal = cols[nameIdx] ? cols[nameIdx].replace(/^["']|["']$/g, '').trim() : '';
        const designVal = designIdx !== -1 && cols[designIdx] ? cols[designIdx].replace(/^["']|["']$/g, '').trim() : 'Formal Stitch';
        const categoryVal = categoryIdx !== -1 && cols[categoryIdx] ? cols[categoryIdx].replace(/^["']|["']$/g, '').trim() : 'Executive Formal';
        const colourVal = colourIdx !== -1 && cols[colourIdx] ? cols[colourIdx].replace(/^["']|["']$/g, '').trim() : 'Black';
        const sizeVal = sizeIdx !== -1 && cols[sizeIdx] ? cols[sizeIdx].replace(/^["']|["']$/g, '').trim() : '34';
        const materialVal = materialIdx !== -1 && cols[materialIdx] ? cols[materialIdx].replace(/^["']|["']$/g, '').trim() : 'Full Grain Leather';

        const costVal = costIdx !== -1 && cols[costIdx] ? Number(cols[costIdx].replace(/[^0-9.]/g, '')) : 950;
        const priceVal = priceIdx !== -1 && cols[priceIdx] ? Number(cols[priceIdx].replace(/[^0-9.]/g, '')) : 1750;
        const stockVal = stockIdx !== -1 && cols[stockIdx] ? Number(cols[stockIdx].replace(/[^0-9.]/g, '')) : 0;
        const minVal = minStockIdx !== -1 && cols[minStockIdx] ? Number(cols[minStockIdx].replace(/[^0-9.]/g, '')) : 5;

        let rowError: string | undefined;
        let isValid = true;

        if (!codeVal) {
          isValid = false;
          rowError = 'Missing code';
        } else if (!nameVal) {
          isValid = false;
          rowError = 'Missing name';
        } else if (seenCodes.has(codeVal)) {
          isValid = false;
          rowError = `Duplicate code in file (${codeVal})`;
        } else if (db.isProductCodeTaken(codeVal)) {
          isValid = false;
          rowError = `Code already exists in DB (${codeVal})`;
        }

        if (codeVal) {
          seenCodes.add(codeVal);
        }

        rows.push({
          code: codeVal,
          name: nameVal,
          design: designVal,
          category: categoryVal,
          colour: colourVal,
          size: sizeVal,
          material: materialVal,
          purchaseCost: isNaN(costVal) ? 0 : costVal,
          sellingPrice: isNaN(priceVal) ? 0 : priceVal,
          availableQuantity: isNaN(stockVal) ? 0 : stockVal,
          minStockLevel: isNaN(minVal) ? 5 : minVal,
          isValid,
          error: rowError,
        });
      }

      setParsedRows(rows);
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse CSV file');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvRawText(content);
      parseCsvContent(content);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    setIsImporting(true);
    try {
      let imported = 0;
      for (const row of validRows) {
        db.addProduct({
          code: row.code,
          name: row.name,
          design: row.design || 'Formal Stitch',
          category: (row.category || 'Executive Formal') as BeltCategory,
          colour: row.colour || 'Black',
          size: row.size || '34',
          material: row.material || 'Full Grain Leather',
          purchaseCost: row.purchaseCost,
          sellingPrice: row.sellingPrice,
          availableQuantity: row.availableQuantity,
          minStockLevel: row.minStockLevel,
          notes: 'Imported via CSV bulk tool',
        });
        imported++;
      }

      onSuccess(imported);
      onClose();
    } catch (err: any) {
      setParseError(err.message || 'Error occurred while saving belts');
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-brand font-bold text-base text-neutral-100">
                Bulk CSV Inventory Import
              </h3>
              <p className="text-xs text-neutral-400">
                Mass upload belt products with Code, Name, Design, Category, Cost, and Stock
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

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Top Actions: Template download + Upload button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <div>
              <span className="font-bold text-neutral-200 block">Download CSV Format Template</span>
              <span className="text-[11px] text-neutral-500">
                Contains columns: Code, Name, Design, Category, Colour, Size, Material, Cost, Price, OpeningStock, MinStock
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadSample}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer border border-neutral-700"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Download Sample CSV</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Upload className="w-3.5 h-3.5 text-neutral-950" />
                <span>Select CSV File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Error Message */}
          {parseError && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Or Paste CSV text */}
          <div>
            <label className="block font-semibold text-neutral-300 mb-1">
              Or Paste CSV Data Directly:
            </label>
            <textarea
              rows={4}
              value={csvRawText}
              onChange={(e) => {
                setCsvRawText(e.target.value);
                if (e.target.value.trim()) {
                  parseCsvContent(e.target.value);
                } else {
                  setParsedRows([]);
                }
              }}
              placeholder={`Code,Name,Design,Category,Cost,Price,OpeningStock\nBLT-901,Formal Leather Elite,Formal Stitch,Executive Formal,1200,2100,20`}
              className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-[11px] text-neutral-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-200">
                  Import Preview ({parsedRows.length} items parsed)
                </span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {validCount} Valid &amp; Ready
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-red-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {invalidCount} Skipped (Duplicates/Invalid)
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-neutral-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="bg-neutral-950 text-neutral-400 sticky top-0 border-b border-neutral-800">
                    <tr>
                      <th className="p-2">Status</th>
                      <th className="p-2">Code</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Design</th>
                      <th className="p-2">Cost (PKR)</th>
                      <th className="p-2">Price (PKR)</th>
                      <th className="p-2">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 bg-neutral-900/60">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'hover:bg-neutral-800/40' : 'bg-red-950/20 text-red-300'}>
                        <td className="p-2 whitespace-nowrap">
                          {row.isValid ? (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px]">
                              OK
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/30 text-[10px]" title={row.error}>
                              {row.error}
                            </span>
                          )}
                        </td>
                        <td className="p-2 font-bold text-amber-400">{row.code || '—'}</td>
                        <td className="p-2 font-sans font-medium text-neutral-200">{row.name || '—'}</td>
                        <td className="p-2 text-neutral-400">{row.category || 'Executive Formal'}</td>
                        <td className="p-2 text-neutral-400">{row.design || 'Formal Stitch'}</td>
                        <td className="p-2 text-neutral-300">Rs. {row.purchaseCost.toLocaleString()}</td>
                        <td className="p-2 font-bold text-amber-400">Rs. {row.sellingPrice.toLocaleString()}</td>
                        <td className="p-2 text-neutral-200">{row.availableQuantity} pcs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={validCount === 0 || isImporting}
            onClick={handleExecuteImport}
            className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg ${
              validCount > 0 && !isImporting
                ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 cursor-pointer active:scale-95'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isImporting ? 'Importing Belts...' : `Import ${validCount} Belts to Inventory`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

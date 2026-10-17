export type Language = 'en' | 'ur' | 'roman_ur';

export type ThemeId =
  | 'black_gold'
  | 'blue_white'
  | 'green_white'
  | 'brown_black'
  | 'purple'
  | 'light'
  | 'dark'
  | 'system';

export type BeltDesign =
  | 'Formal Stitch'
  | 'Reversible Classic'
  | 'Automatic Buckle'
  | 'Italian Braided'
  | 'Heavy Duty Jeans'
  | 'Western Embossed'
  | 'Casual Canvas'
  | 'Executive Dress'
  | 'Custom Designer';

export type BeltMaterial =
  | 'Full Grain Leather'
  | 'Top Grain Cowhide'
  | 'Genuine Buffalo Leather'
  | 'Split Leather'
  | 'Suede Leather'
  | 'Military Canvas'
  | 'Synthetic PU';

export type BeltColour =
  | 'Black'
  | 'Dark Brown'
  | 'Tan'
  | 'Burgundy'
  | 'Navy Blue'
  | 'Coffee'
  | 'Cognac'
  | 'Olive Green';

export type BeltSize =
  | '28'
  | '30'
  | '32'
  | '34'
  | '36'
  | '38'
  | '40'
  | '42'
  | '44'
  | '46'
  | 'Free Size (Adjustable)';

export type BeltCategory =
  | 'Executive Formal'
  | 'Casual & Denim'
  | 'Wedding & Festive'
  | 'Winter Collection'
  | 'Summer Breeze'
  | 'Heavy Duty Workwear'
  | 'Vintage Heritage'
  | 'All Seasons Classic';

export interface BeltProduct {
  id: string;
  code: string;
  name: string;
  design: BeltDesign | string;
  colour: BeltColour | string;
  size: BeltSize | string;
  material: BeltMaterial | string;
  category?: BeltCategory | string; // Categories / Collections for style or season
  purchaseCost: number; // Weighted average cost
  sellingPrice: number;
  availableQuantity: number;
  minStockLevel: number;
  photoUrl?: string;
  notes?: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  id: string;
  supplierId: string;
  supplierName: string;
  purchaseDate: string; // YYYY-MM-DD
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  costPerBelt: number;
  totalAmount: number;
  amountPaid: number;
  remainingBalance: number;
  invoiceNumber: string;
  notes?: string;
  createdAt: string;
}

export type PaymentMethod = 'Cash' | 'EasyPaisa' | 'JazzCash' | 'Bank Transfer' | 'Credit / Udhar';

export interface SaleItem {
  id: string;
  invoiceNumber: string;
  saleDate: string; // YYYY-MM-DD
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  sellingPrice: number;
  discount: number; // in PKR
  taxRate?: number; // Tax % applied (e.g. 17)
  taxAmount?: number; // Tax in PKR
  taxName?: string; // e.g. 'GST' or 'VAT'
  totalAmount: number; // Final net bill including/factoring tax
  costBasis: number; // Snapshot of weighted average cost per belt at sale time for true profit calc
  amountReceived: number;
  remainingBalance: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export type MovementType =
  | 'PURCHASE'
  | 'SALE'
  | 'RETURN_CUSTOMER'
  | 'RETURN_SUPPLIER'
  | 'DAMAGED_WRITE_OFF'
  | 'OPENING_STOCK'
  | 'MANUAL_ADJUSTMENT';

export interface StockMovement {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantityChange: number; // positive or negative
  newBalance: number;
  referenceId?: string; // invoice or purchase ID
  notes: string;
}

export interface DamagedStockItem {
  id: string;
  date: string;
  productId: string;
  productName: string;
  quantity: number;
  reason: 'Scratched Buckle' | 'Torn Leather' | 'Stitching Defect' | 'Water Damage' | 'Other';
  costLoss: number;
  recordedBy: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  totalPurchased: number;
  totalPaid: number;
  outstandingBalance: number;
  createdAt: string;
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceInvoice?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  company?: string;
  phone: string;
  city?: string;
  totalPurchased: number;
  totalPaid: number;
  outstandingBalance: number;
  createdAt: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceBill?: string;
  notes?: string;
}

export type ExpenseCategory =
  | 'Shop Rent'
  | 'Transportation & Cargo'
  | 'Electricity & Utilities'
  | 'Staff Salaries'
  | 'Packaging & Belt Boxes'
  | 'Tea & Refreshments'
  | 'Shop Maintenance'
  | 'Marketing & Signs'
  | 'Miscellaneous';

export interface BusinessExpense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  notes: string;
  paidBy: string;
}

export interface Owner {
  id: string;
  name: 'Saqib' | 'Adil' | 'Javaid';
  role: 'Administrator' | 'Managing Partner' | 'Operations Partner';
  sharePercentage: number;
  phone: string;
  active: boolean;
}

export interface WallpaperConfig {
  imageUrl: string;
  brightness: number; // 0 to 100
  blur: number; // 0 to 20
  overlayOpacity: number; // 0 to 90
  isCustom: boolean;
}

export interface SecurityConfig {
  pinEnabled: boolean;
  pinCode: string; // 4-6 digit string
  biometricEnabled: boolean;
  autoLockMinutes: number; // 0 = immediate, 1, 5, 15, -1 = never
  isLocked: boolean;
}

export interface TaxConfig {
  enabled: boolean;
  name: string; // e.g. 'GST' | 'VAT' | 'Sales Tax'
  rate: number; // percentage, e.g. 17 or 18
  taxNumber?: string; // Tax Registration Number (STRN / NTN / VAT ID)
  isInclusive: boolean; // false = Exclusive (tax added on top of subtotal), true = Inclusive (tax included in retail price)
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  role?: string;
  bio?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  lowStockAlerts: boolean;
  dailySalesTarget: boolean;
  cloudSyncUpdates: boolean;
  backupReminders: boolean;
  soundAlerts: boolean;
}

export interface AppSettings {
  language: Language;
  theme: ThemeId;
  wallpaper: WallpaperConfig;
  security: SecurityConfig;
  currentOwner: 'Saqib' | 'Adil' | 'Javaid';
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  currency: string;
  dailySalesTarget?: number; // Target daily sales revenue in PKR
  tax?: TaxConfig; // Custom GST/VAT tax management
  profile?: UserProfile;
  notifications?: NotificationSettings;
  privacyMode?: boolean; // Hide financial summaries until hovered/clicked
  autoPurchaseSuggestions?: boolean; // Flag items below minimum stock and enable 1-click draft POs
  lowStockThreshold?: number; // Minimum stock count threshold (default 10)
}

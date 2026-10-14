import {
  BeltProduct,
  PurchaseItem,
  SaleItem,
  StockMovement,
  DamagedStockItem,
  Customer,
  CustomerPayment,
  Supplier,
  SupplierPayment,
  BusinessExpense,
  Owner,
  AppSettings,
  PaymentMethod,
} from '../types';

const STORAGE_KEY_PREFIX = 'saqib_belt_db_';

const defaultSettings: AppSettings = {
  language: 'en',
  theme: 'black_gold',
  wallpaper: {
    imageUrl: '',
    brightness: 100,
    blur: 0,
    overlayOpacity: 70,
    isCustom: false,
  },
  security: {
    pinEnabled: true,
    pinCode: '1234',
    biometricEnabled: true,
    autoLockMinutes: 0,
    isLocked: false,
  },
  currentOwner: 'Saqib',
  businessName: 'SAQIB Belt Business',
  businessAddress: 'Main Anarkali Bazaar, Leather Market, Lahore',
  businessPhone: '+92 300 1234567',
  currency: 'PKR',
  dailySalesTarget: 50000,
  tax: {
    enabled: true,
    name: 'GST',
    rate: 17,
    taxNumber: 'STRN-3277876192834',
    isInclusive: false,
  },
  profile: {
    name: 'Saqib Khan',
    email: 'saqib@saqibbelts.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    phone: '+92 300 1234567',
    role: 'Administrator & Founder',
    bio: 'Premium Wholesale & Retail Leather Belt Merchant · Lahore, Pakistan',
  },
  notifications: {
    enabled: true,
    lowStockAlerts: true,
    dailySalesTarget: true,
    cloudSyncUpdates: true,
    backupReminders: true,
    soundAlerts: true,
  },
  privacyMode: false,
};

const initialOwners: Owner[] = [
  {
    id: 'owner_1',
    name: 'Saqib',
    role: 'Administrator',
    sharePercentage: 40,
    phone: '+92 300 7654321',
    active: true,
  },
  {
    id: 'owner_2',
    name: 'Adil',
    role: 'Managing Partner',
    sharePercentage: 30,
    phone: '+92 321 4567890',
    active: true,
  },
  {
    id: 'owner_3',
    name: 'Javaid',
    role: 'Operations Partner',
    sharePercentage: 30,
    phone: '+92 333 9876543',
    active: true,
  },
];

const initialProducts: BeltProduct[] = [
  {
    id: 'prod_1',
    code: 'BLT-101',
    name: 'Royal Italian Formal Stitch',
    design: 'Formal Stitch',
    colour: 'Black',
    size: '34',
    material: 'Full Grain Leather',
    category: 'Executive Formal',
    purchaseCost: 950,
    sellingPrice: 1750,
    availableQuantity: 42,
    minStockLevel: 10,
    photoUrl: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'prod_2',
    code: 'BLT-102',
    name: 'Executive Reversible Dual-Tone',
    design: 'Reversible Classic',
    colour: 'Dark Brown',
    size: '36',
    material: 'Top Grain Cowhide',
    category: 'Executive Formal',
    purchaseCost: 1100,
    sellingPrice: 2100,
    availableQuantity: 28,
    minStockLevel: 8,
    photoUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-10-01T11:00:00Z',
    updatedAt: '2026-10-01T11:00:00Z',
  },
  {
    id: 'prod_3',
    code: 'BLT-103',
    name: 'Titanium Auto-Lock Ratchet',
    design: 'Automatic Buckle',
    colour: 'Black',
    size: 'Free Size (Adjustable)',
    material: 'Genuine Buffalo Leather',
    category: 'Executive Formal',
    purchaseCost: 1350,
    sellingPrice: 2500,
    availableQuantity: 15,
    minStockLevel: 5,
    photoUrl: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-10-02T09:30:00Z',
    updatedAt: '2026-10-02T09:30:00Z',
  },
  {
    id: 'prod_4',
    code: 'BLT-104',
    name: 'Handcrafted Braided Belt',
    design: 'Italian Braided',
    colour: 'Cognac',
    size: '32',
    material: 'Split Leather',
    category: 'Summer Breeze',
    purchaseCost: 800,
    sellingPrice: 1550,
    availableQuantity: 6, // Low stock alert!
    minStockLevel: 8,
    photoUrl: 'https://images.unsplash.com/photo-1585856345914-72648585489f?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-10-03T14:15:00Z',
    updatedAt: '2026-10-03T14:15:00Z',
  },
  {
    id: 'prod_5',
    code: 'BLT-105',
    name: 'Heavy Duty Denim Jeans Belt',
    design: 'Heavy Duty Jeans',
    colour: 'Tan',
    size: '38',
    material: 'Genuine Buffalo Leather',
    category: 'Casual & Denim',
    purchaseCost: 850,
    sellingPrice: 1600,
    availableQuantity: 35,
    minStockLevel: 10,
    photoUrl: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T12:00:00Z',
    updatedAt: '2026-10-04T12:00:00Z',
  },
  {
    id: 'prod_6',
    code: 'BLT-106',
    name: 'Western Floral Embossed Belt',
    design: 'Western Embossed',
    colour: 'Burgundy',
    size: '34',
    material: 'Full Grain Leather',
    category: 'Vintage Heritage',
    purchaseCost: 1200,
    sellingPrice: 2300,
    availableQuantity: 4, // Low stock alert!
    minStockLevel: 6,
    photoUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-10-05T15:00:00Z',
    updatedAt: '2026-10-05T15:00:00Z',
  },
  {
    id: 'prod_7',
    code: 'BLT-107',
    name: 'Tactical Military Canvas Belt',
    design: 'Casual Canvas',
    colour: 'Olive Green',
    size: 'Free Size (Adjustable)',
    material: 'Military Canvas',
    category: 'Heavy Duty Workwear',
    purchaseCost: 450,
    sellingPrice: 950,
    availableQuantity: 50,
    minStockLevel: 15,
    photoUrl: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-10-06T10:00:00Z',
    updatedAt: '2026-10-06T10:00:00Z',
  },
];

const initialSuppliers: Supplier[] = [
  {
    id: 'sup_1',
    name: 'Haji Aslam Leather Tanneries',
    company: 'Punjab Leather Industries',
    phone: '+92 300 9411223',
    city: 'Kasur',
    totalPurchased: 145000,
    totalPaid: 115000,
    outstandingBalance: 30000,
    createdAt: '2026-09-15',
  },
  {
    id: 'sup_2',
    name: 'Bilal Buckle & Hardware Corp',
    company: 'Bilal Metalworks',
    phone: '+92 321 8899001',
    city: 'Gujranwala',
    totalPurchased: 85000,
    totalPaid: 70000,
    outstandingBalance: 15000,
    createdAt: '2026-09-20',
  },
  {
    id: 'sup_3',
    name: 'Karachi Pure Hide Import',
    company: 'Sindh Leather Traders',
    phone: '+92 333 5566778',
    city: 'Karachi',
    totalPurchased: 210000,
    totalPaid: 210000,
    outstandingBalance: 0,
    createdAt: '2026-09-25',
  },
];

const initialCustomers: Customer[] = [
  {
    id: 'cust_1',
    name: 'Malik Usman Retailer',
    phone: '+92 301 2345678',
    address: 'Shop # 12, Liberty Market, Lahore',
    totalPurchased: 34500,
    totalPaid: 26000,
    outstandingBalance: 8500,
    createdAt: '2026-10-01',
  },
  {
    id: 'cust_2',
    name: 'Chaudhry Kamran',
    phone: '+92 312 9876543',
    address: 'DHA Phase 5, Lahore',
    totalPurchased: 8900,
    totalPaid: 8900,
    outstandingBalance: 0,
    createdAt: '2026-10-04',
  },
  {
    id: 'cust_3',
    name: 'Tariq Butt Garments',
    phone: '+92 322 4561230',
    address: 'Ichhra Bazaar, Lahore',
    totalPurchased: 48000,
    totalPaid: 36000,
    outstandingBalance: 12000,
    createdAt: '2026-10-05',
  },
];

const initialExpenses: BusinessExpense[] = [
  {
    id: 'exp_1',
    date: '2026-10-01',
    category: 'Shop Rent',
    amount: 35000,
    paymentMethod: 'Bank Transfer',
    notes: 'Shop rent for October 2026',
    paidBy: 'Saqib',
  },
  {
    id: 'exp_2',
    date: '2026-10-03',
    category: 'Electricity & Utilities',
    amount: 7800,
    paymentMethod: 'Cash',
    notes: 'LESCO Electricity Bill',
    paidBy: 'Adil',
  },
  {
    id: 'exp_3',
    date: '2026-10-07',
    category: 'Packaging & Belt Boxes',
    amount: 4500,
    paymentMethod: 'Cash',
    notes: '100 Velvet gift boxes and printed shopping bags',
    paidBy: 'Javaid',
  },
  {
    id: 'exp_4',
    date: '2026-10-10',
    category: 'Transportation & Cargo',
    amount: 2200,
    paymentMethod: 'Cash',
    notes: 'Cargo freight from Kasur tanneries',
    paidBy: 'Saqib',
  },
  {
    id: 'exp_5',
    date: '2026-10-12',
    category: 'Tea & Refreshments',
    amount: 650,
    paymentMethod: 'Cash',
    notes: 'Shop daily refreshments & customer hospitality',
    paidBy: 'Adil',
  },
];

const initialPurchases: PurchaseItem[] = [
  {
    id: 'pur_1',
    supplierId: 'sup_1',
    supplierName: 'Haji Aslam Leather Tanneries',
    purchaseDate: '2026-10-02',
    productId: 'prod_1',
    productName: 'Royal Italian Formal Stitch',
    productCode: 'BLT-101',
    quantity: 50,
    costPerBelt: 950,
    totalAmount: 47500,
    amountPaid: 35000,
    remainingBalance: 12500,
    invoiceNumber: 'HAL-9081',
    notes: 'Grade A black calfskin with rust-free brass buckles',
    createdAt: '2026-10-02T10:00:00Z',
  },
  {
    id: 'pur_2',
    supplierId: 'sup_2',
    supplierName: 'Bilal Buckle & Hardware Corp',
    purchaseDate: '2026-10-05',
    productId: 'prod_3',
    productName: 'Titanium Auto-Lock Ratchet',
    productCode: 'BLT-103',
    quantity: 25,
    costPerBelt: 1350,
    totalAmount: 33750,
    amountPaid: 25000,
    remainingBalance: 8750,
    invoiceNumber: 'BM-4432',
    notes: 'Titanium finish ratchet auto buckle with warranty',
    createdAt: '2026-10-05T11:00:00Z',
  },
];

const initialSales: SaleItem[] = [
  {
    id: 'sale_1',
    invoiceNumber: 'INV-202610-001',
    saleDate: '2026-10-08',
    customerId: 'cust_1',
    customerName: 'Malik Usman Retailer',
    customerPhone: '+92 301 2345678',
    productId: 'prod_1',
    productName: 'Royal Italian Formal Stitch',
    productCode: 'BLT-101',
    quantity: 5,
    sellingPrice: 1750,
    discount: 250,
    totalAmount: 8500,
    costBasis: 950, // snapshot of weighted avg cost
    amountReceived: 5000,
    remainingBalance: 3500,
    paymentMethod: 'Cash',
    notes: 'Regular retail order, remaining due next week',
    createdAt: '2026-10-08T12:00:00Z',
  },
  {
    id: 'sale_2',
    invoiceNumber: 'INV-202610-002',
    saleDate: '2026-10-10',
    customerId: 'cust_2',
    customerName: 'Chaudhry Kamran',
    customerPhone: '+92 312 9876543',
    productId: 'prod_3',
    productName: 'Titanium Auto-Lock Ratchet',
    productCode: 'BLT-103',
    quantity: 2,
    sellingPrice: 2500,
    discount: 0,
    totalAmount: 5000,
    costBasis: 1350,
    amountReceived: 5000,
    remainingBalance: 0,
    paymentMethod: 'EasyPaisa',
    notes: 'Gift packaging requested',
    createdAt: '2026-10-10T14:30:00Z',
  },
  {
    id: 'sale_3',
    invoiceNumber: 'INV-202610-003',
    saleDate: '2026-10-12', // Today!
    customerId: 'cust_3',
    customerName: 'Tariq Butt Garments',
    customerPhone: '+92 322 4561230',
    productId: 'prod_2',
    productName: 'Executive Reversible Dual-Tone',
    productCode: 'BLT-102',
    quantity: 3,
    sellingPrice: 2100,
    discount: 300,
    totalAmount: 6000,
    costBasis: 1100,
    amountReceived: 4000,
    remainingBalance: 2000,
    paymentMethod: 'JazzCash',
    notes: 'Dual tone brown/black belts for boutique display',
    createdAt: '2026-10-12T09:00:00Z',
  },
];

const initialMovements: StockMovement[] = [
  {
    id: 'mov_1',
    date: '2026-10-02',
    productId: 'prod_1',
    productName: 'Royal Italian Formal Stitch',
    type: 'PURCHASE',
    quantityChange: 50,
    newBalance: 50,
    referenceId: 'HAL-9081',
    notes: 'Initial purchase from Kasur tanneries',
  },
  {
    id: 'mov_2',
    date: '2026-10-08',
    productId: 'prod_1',
    productName: 'Royal Italian Formal Stitch',
    type: 'SALE',
    quantityChange: -5,
    newBalance: 45,
    referenceId: 'INV-202610-001',
    notes: 'Counter sale to Malik Usman',
  },
  {
    id: 'mov_3',
    date: '2026-10-09',
    productId: 'prod_1',
    productName: 'Royal Italian Formal Stitch',
    type: 'DAMAGED_WRITE_OFF',
    quantityChange: -3,
    newBalance: 42,
    notes: 'Buckle scratches during unboxing',
  },
];

const initialDamaged: DamagedStockItem[] = [
  {
    id: 'dmg_1',
    date: '2026-10-09',
    productId: 'prod_1',
    productName: 'Royal Italian Formal Stitch',
    quantity: 3,
    reason: 'Scratched Buckle',
    costLoss: 2850,
    recordedBy: 'Saqib',
    notes: 'Transport friction scratches on polished buckle',
  },
];

class BeltDatabase {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }

  constructor() {
    this.initIfEmpty();
  }

  public initIfEmpty(): void {
    if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'products')) {
      this.set('products', initialProducts);
    }
    if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'suppliers')) {
      this.set('suppliers', initialSuppliers);
    }
    if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'customers')) {
      this.set('customers', initialCustomers);
    }
    if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'expenses')) {
      this.set('expenses', initialExpenses);
    }
    if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'purchases')) {
      this.set('purchases', initialPurchases);
    }
    if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'sales')) {
      this.set('sales', initialSales);
    }
    if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'movements')) {
      this.set('movements', initialMovements);
    }
    if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'damaged')) {
      this.set('damaged', initialDamaged);
    }
    if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'owners')) {
      this.set('owners', initialOwners);
    }
    if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'settings')) {
      this.set('settings', defaultSettings);
    }
  }

  // --- SETTINGS & OWNERS ---
  public getSettings(): AppSettings {
    const s = this.get<AppSettings>('settings', defaultSettings);
    if (!s.tax) {
      s.tax = defaultSettings.tax;
    }
    if (!s.profile) {
      s.profile = defaultSettings.profile;
    }
    if (!s.notifications) {
      s.notifications = defaultSettings.notifications;
    }
    return s;
  }

  public updateSettings(updates: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    this.set('settings', updated);
    return updated;
  }

  public getOwners(): Owner[] {
    return this.get<Owner[]>('owners', initialOwners);
  }

  public updateOwner(ownerId: string, updates: Partial<Owner>): Owner[] {
    const list = this.getOwners();
    const idx = list.findIndex((o) => o.id === ownerId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.set('owners', list);
    }
    return list;
  }

  // --- PRODUCTS ---
  public getProducts(): BeltProduct[] {
    return this.get<BeltProduct[]>('products', []);
  }

  public getProductById(id: string): BeltProduct | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  public saveProduct(product: Omit<BeltProduct, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): BeltProduct {
    const products = this.getProducts();
    const now = new Date().toISOString();

    if (product.id) {
      const idx = products.findIndex((p) => p.id === product.id);
      if (idx !== -1) {
        const updated: BeltProduct = {
          ...products[idx],
          ...product,
          id: product.id,
          updatedAt: now,
        };
        products[idx] = updated;
        this.set('products', products);
        return updated;
      }
    }

    const newProduct: BeltProduct = {
      ...product,
      id: 'prod_' + Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    products.unshift(newProduct);
    this.set('products', products);

    // Record opening stock movement if quantity > 0
    if (newProduct.availableQuantity > 0) {
      this.addStockMovement({
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'OPENING_STOCK',
        quantityChange: newProduct.availableQuantity,
        newBalance: newProduct.availableQuantity,
        notes: `Opening inventory for ${newProduct.name}`,
      });
    }

    return newProduct;
  }

  public addProduct(product: Omit<BeltProduct, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): BeltProduct {
    return this.saveProduct(product);
  }

  public isProductCodeTaken(code: string, excludeId?: string): boolean {
    const trimmed = code.trim().toUpperCase();
    return this.getProducts().some(
      (p) => p.code.trim().toUpperCase() === trimmed && p.id !== excludeId
    );
  }

  public canDeleteProduct(id: string): { canDelete: boolean; salesCount: number; purchasesCount: number } {
    const salesCount = this.getSales().filter((s) => s.productId === id).length;
    const purchasesCount = this.getPurchases().filter((p) => p.productId === id).length;
    return {
      canDelete: salesCount === 0 && purchasesCount === 0,
      salesCount,
      purchasesCount,
    };
  }

  public archiveProduct(id: string, isArchived: boolean = true): BeltProduct | undefined {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      products[idx].isArchived = isArchived;
      products[idx].updatedAt = new Date().toISOString();
      this.set('products', products);
      return products[idx];
    }
    return undefined;
  }

  public updateProductPrices(id: string, purchaseCost: number, sellingPrice: number): BeltProduct | undefined {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      products[idx].purchaseCost = purchaseCost;
      products[idx].sellingPrice = sellingPrice;
      products[idx].updatedAt = new Date().toISOString();
      this.set('products', products);
      return products[idx];
    }
    return undefined;
  }

  public adjustStock(id: string, newQuantity: number, reason: string): { product: BeltProduct; movement: StockMovement } {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');

    const product = products[idx];
    const diff = newQuantity - product.availableQuantity;
    product.availableQuantity = newQuantity;
    product.updatedAt = new Date().toISOString();
    products[idx] = product;
    this.set('products', products);

    const movement = this.addStockMovement({
      productId: product.id,
      productName: product.name,
      type: 'MANUAL_ADJUSTMENT',
      quantityChange: diff,
      newBalance: newQuantity,
      notes: reason || 'Manual stock inventory audit adjustment',
    });

    return { product, movement };
  }

  public deleteProduct(id: string): boolean {
    const check = this.canDeleteProduct(id);
    if (!check.canDelete) {
      throw new Error(
        `Cannot permanently delete this belt because it has ${check.salesCount} sales and ${check.purchasesCount} purchase transactions. Archive it instead to preserve audit records.`
      );
    }
    const products = this.getProducts().filter((p) => p.id !== id);
    this.set('products', products);
    return true;
  }

  // --- PURCHASES (with Weighted Average Costing & Automatic Stock Increase) ---
  public getPurchases(): PurchaseItem[] {
    return this.get<PurchaseItem[]>('purchases', []);
  }

  public addPurchase(params: {
    supplierId: string;
    supplierName: string;
    purchaseDate: string;
    productId: string;
    quantity: number;
    costPerBelt: number;
    amountPaid: number;
    invoiceNumber: string;
    notes?: string;
  }): { purchase: PurchaseItem; updatedProduct: BeltProduct } {
    const products = this.getProducts();
    const productIndex = products.findIndex((p) => p.id === params.productId);
    if (productIndex === -1) {
      throw new Error('Product not found in database');
    }

    const currentProduct = products[productIndex];
    const totalAmount = params.quantity * params.costPerBelt;
    const remainingBalance = Math.max(0, totalAmount - params.amountPaid);

    // Weighted Average Inventory Costing Formula:
    // new_avg_cost = ((old_qty * old_cost) + (purchase_qty * purchase_cost)) / (old_qty + purchase_qty)
    const oldQty = Math.max(0, currentProduct.availableQuantity);
    const oldCost = currentProduct.purchaseCost;
    const newQty = oldQty + params.quantity;
    const newWeightedCost =
      newQty > 0
        ? Math.round(((oldQty * oldCost) + (params.quantity * params.costPerBelt)) / newQty)
        : params.costPerBelt;

    // Update Product stock & weighted average cost
    const updatedProduct: BeltProduct = {
      ...currentProduct,
      availableQuantity: currentProduct.availableQuantity + params.quantity,
      purchaseCost: newWeightedCost,
      updatedAt: new Date().toISOString(),
    };
    products[productIndex] = updatedProduct;
    this.set('products', products);

    // Create Purchase Record
    const purchase: PurchaseItem = {
      id: 'pur_' + Date.now(),
      supplierId: params.supplierId,
      supplierName: params.supplierName,
      purchaseDate: params.purchaseDate,
      productId: params.productId,
      productName: currentProduct.name,
      productCode: currentProduct.code,
      quantity: params.quantity,
      costPerBelt: params.costPerBelt,
      totalAmount,
      amountPaid: params.amountPaid,
      remainingBalance,
      invoiceNumber: params.invoiceNumber,
      notes: params.notes,
      createdAt: new Date().toISOString(),
    };

    const purchases = this.getPurchases();
    purchases.unshift(purchase);
    this.set('purchases', purchases);

    // Update Supplier totals
    const suppliers = this.getSuppliers();
    const supIndex = suppliers.findIndex((s) => s.id === params.supplierId);
    if (supIndex !== -1) {
      suppliers[supIndex].totalPurchased += totalAmount;
      suppliers[supIndex].totalPaid += params.amountPaid;
      suppliers[supIndex].outstandingBalance += remainingBalance;
      this.set('suppliers', suppliers);
    }

    // Log Stock Movement
    this.addStockMovement({
      productId: currentProduct.id,
      productName: currentProduct.name,
      type: 'PURCHASE',
      quantityChange: params.quantity,
      newBalance: updatedProduct.availableQuantity,
      referenceId: purchase.invoiceNumber,
      notes: `Purchased from ${params.supplierName} @ Rs.${params.costPerBelt}/pc`,
    });

    return { purchase, updatedProduct };
  }

  // --- SALES (with Stock Validation, Automatic Decrease, Cost Basis Lock, & Invoice) ---
  public getSales(): SaleItem[] {
    return this.get<SaleItem[]>('sales', []);
  }

  public addSale(params: {
    productId: string;
    quantity: number;
    sellingPrice: number;
    discount: number;
    amountReceived: number;
    saleDate: string;
    customerName: string;
    customerPhone?: string;
    paymentMethod: PaymentMethod;
    notes?: string;
    taxRate?: number;
    taxAmount?: number;
    taxName?: string;
    totalAmount?: number;
  }): { sale: SaleItem; updatedProduct: BeltProduct } {
    const products = this.getProducts();
    const productIndex = products.findIndex((p) => p.id === params.productId);
    if (productIndex === -1) {
      throw new Error('Product not found in database');
    }

    const product = products[productIndex];

    // INVENTORY SUFFICIENCY VALIDATION
    if (product.availableQuantity < params.quantity) {
      throw new Error(
        `Insufficient stock! Only ${product.availableQuantity} pieces available in warehouse for ${product.name}. Cannot sell ${params.quantity}.`
      );
    }

    const subtotal = params.quantity * params.sellingPrice;
    const netBeforeTax = Math.max(0, subtotal - (params.discount || 0));
    
    // Total amount calculation factoring tax if not explicitly provided
    let totalAmount = params.totalAmount;
    if (totalAmount === undefined) {
      const taxAmt = params.taxAmount || 0;
      totalAmount = Math.max(0, netBeforeTax + taxAmt);
    }
    const remainingBalance = Math.max(0, totalAmount - params.amountReceived);

    // Generate Invoice Number: INV-YYYYMM-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 7).replace('-', '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${dateStr}-${randSuffix}`;

    // Snapshot the current weighted-average cost basis so historical profit calculations remain immutable
    const costBasis = product.purchaseCost;

    // Deduct stock
    const updatedProduct: BeltProduct = {
      ...product,
      availableQuantity: product.availableQuantity - params.quantity,
      updatedAt: now.toISOString(),
    };
    products[productIndex] = updatedProduct;
    this.set('products', products);

    // Manage or update Customer record
    let customerId = '';
    const customers = this.getCustomers();
    const existingCustomer = customers.find(
      (c) => c.name.toLowerCase().trim() === params.customerName.toLowerCase().trim()
    );

    if (existingCustomer) {
      customerId = existingCustomer.id;
      existingCustomer.totalPurchased += totalAmount;
      existingCustomer.totalPaid += params.amountReceived;
      existingCustomer.outstandingBalance += remainingBalance;
      if (params.customerPhone && !existingCustomer.phone) {
        existingCustomer.phone = params.customerPhone;
      }
      this.set('customers', customers);
    } else {
      customerId = 'cust_' + Date.now();
      const newCustomer: Customer = {
        id: customerId,
        name: params.customerName.trim(),
        phone: params.customerPhone || '',
        totalPurchased: totalAmount,
        totalPaid: params.amountReceived,
        outstandingBalance: remainingBalance,
        createdAt: params.saleDate,
      };
      customers.unshift(newCustomer);
      this.set('customers', customers);
    }

    // Save Sale record
    const sale: SaleItem = {
      id: 'sale_' + Date.now(),
      invoiceNumber,
      saleDate: params.saleDate,
      customerId,
      customerName: params.customerName.trim(),
      customerPhone: params.customerPhone,
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      quantity: params.quantity,
      sellingPrice: params.sellingPrice,
      discount: params.discount || 0,
      taxRate: params.taxRate,
      taxAmount: params.taxAmount,
      taxName: params.taxName,
      totalAmount,
      costBasis, // Cost basis locked!
      amountReceived: params.amountReceived,
      remainingBalance,
      paymentMethod: params.paymentMethod,
      notes: params.notes,
      createdAt: now.toISOString(),
    };

    const sales = this.getSales();
    sales.unshift(sale);
    this.set('sales', sales);

    // Stock Movement log
    this.addStockMovement({
      productId: product.id,
      productName: product.name,
      type: 'SALE',
      quantityChange: -params.quantity,
      newBalance: updatedProduct.availableQuantity,
      referenceId: invoiceNumber,
      notes: `Counter sale to ${params.customerName} (${params.quantity} pcs)`,
    });

    return { sale, updatedProduct };
  }

  // --- DAMAGED STOCK MANAGEMENT (Keeps damaged separate from saleable) ---
  public getDamagedStock(): DamagedStockItem[] {
    return this.get<DamagedStockItem[]>('damaged', []);
  }

  public logDamagedBelt(params: {
    productId: string;
    quantity: number;
    reason: DamagedStockItem['reason'];
    recordedBy: string;
    notes?: string;
  }): DamagedStockItem {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === params.productId);
    if (idx === -1) throw new Error('Product not found');

    const product = products[idx];
    if (product.availableQuantity < params.quantity) {
      throw new Error(`Cannot write off ${params.quantity} items; only ${product.availableQuantity} in stock`);
    }

    const costLoss = params.quantity * product.purchaseCost;

    // Deduct from saleable inventory
    product.availableQuantity -= params.quantity;
    product.updatedAt = new Date().toISOString();
    products[idx] = product;
    this.set('products', products);

    const damagedItem: DamagedStockItem = {
      id: 'dmg_' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      productId: product.id,
      productName: product.name,
      quantity: params.quantity,
      reason: params.reason,
      costLoss,
      recordedBy: params.recordedBy,
      notes: params.notes,
    };

    const damagedList = this.getDamagedStock();
    damagedList.unshift(damagedItem);
    this.set('damaged', damagedList);

    // Log Stock Movement
    this.addStockMovement({
      productId: product.id,
      productName: product.name,
      type: 'DAMAGED_WRITE_OFF',
      quantityChange: -params.quantity,
      newBalance: product.availableQuantity,
      notes: `Damaged write-off: ${params.reason} (${params.quantity} pcs) - Value Rs.${costLoss}`,
    });

    return damagedItem;
  }

  // --- STOCK MOVEMENTS ---
  public getStockMovements(): StockMovement[] {
    return this.get<StockMovement[]>('movements', []);
  }

  public addStockMovement(movement: Omit<StockMovement, 'id' | 'date'> & { date?: string }): StockMovement {
    const movements = this.getStockMovements();
    const newMovement: StockMovement = {
      ...movement,
      id: 'mov_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      date: movement.date || new Date().toISOString().slice(0, 10),
    };
    movements.unshift(newMovement);
    this.set('movements', movements);
    return newMovement;
  }

  // --- CUSTOMERS & PAYMENTS ---
  public getCustomers(): Customer[] {
    return this.get<Customer[]>('customers', []);
  }

  public addCustomer(customer: Omit<Customer, 'id' | 'totalPurchased' | 'totalPaid' | 'outstandingBalance' | 'createdAt'>): Customer {
    const customers = this.getCustomers();
    const newCust: Customer = {
      ...customer,
      id: 'cust_' + Date.now(),
      totalPurchased: 0,
      totalPaid: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    customers.unshift(newCust);
    this.set('customers', customers);
    return newCust;
  }

  public recordCustomerPayment(params: {
    customerId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): CustomerPayment {
    const customers = this.getCustomers();
    const idx = customers.findIndex((c) => c.id === params.customerId);
    if (idx === -1) throw new Error('Customer not found');

    const customer = customers[idx];
    customer.totalPaid += params.amount;
    customer.outstandingBalance = Math.max(0, customer.outstandingBalance - params.amount);
    customers[idx] = customer;
    this.set('customers', customers);

    const payment: CustomerPayment = {
      id: 'cpay_' + Date.now(),
      customerId: customer.id,
      customerName: customer.name,
      date: new Date().toISOString().slice(0, 10),
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      notes: params.notes,
    };

    const payments = this.get<CustomerPayment[]>('customer_payments', []);
    payments.unshift(payment);
    this.set('customer_payments', payments);

    return payment;
  }

  public getCustomerPayments(customerId?: string): CustomerPayment[] {
    const all = this.get<CustomerPayment[]>('customer_payments', []);
    return customerId ? all.filter((p) => p.customerId === customerId) : all;
  }

  // --- SUPPLIERS & PAYMENTS ---
  public getSuppliers(): Supplier[] {
    return this.get<Supplier[]>('suppliers', []);
  }

  public addSupplier(supplier: Omit<Supplier, 'id' | 'totalPurchased' | 'totalPaid' | 'outstandingBalance' | 'createdAt'>): Supplier {
    const suppliers = this.getSuppliers();
    const newSup: Supplier = {
      ...supplier,
      id: 'sup_' + Date.now(),
      totalPurchased: 0,
      totalPaid: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    suppliers.unshift(newSup);
    this.set('suppliers', suppliers);
    return newSup;
  }

  public recordSupplierPayment(params: {
    supplierId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): SupplierPayment {
    const suppliers = this.getSuppliers();
    const idx = suppliers.findIndex((s) => s.id === params.supplierId);
    if (idx === -1) throw new Error('Supplier not found');

    const supplier = suppliers[idx];
    supplier.totalPaid += params.amount;
    supplier.outstandingBalance = Math.max(0, supplier.outstandingBalance - params.amount);
    suppliers[idx] = supplier;
    this.set('suppliers', suppliers);

    const payment: SupplierPayment = {
      id: 'spay_' + Date.now(),
      supplierId: supplier.id,
      supplierName: supplier.name,
      date: new Date().toISOString().slice(0, 10),
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      notes: params.notes,
    };

    const payments = this.get<SupplierPayment[]>('supplier_payments', []);
    payments.unshift(payment);
    this.set('supplier_payments', payments);

    return payment;
  }

  public getSupplierPayments(supplierId?: string): SupplierPayment[] {
    const all = this.get<SupplierPayment[]>('supplier_payments', []);
    return supplierId ? all.filter((p) => p.supplierId === supplierId) : all;
  }

  // --- EXPENSES ---
  public getExpenses(): BusinessExpense[] {
    return this.get<BusinessExpense[]>('expenses', []);
  }

  public addExpense(expense: Omit<BusinessExpense, 'id'>): BusinessExpense {
    const expenses = this.getExpenses();
    const newExp: BusinessExpense = {
      ...expense,
      id: 'exp_' + Date.now(),
    };
    expenses.unshift(newExp);
    this.set('expenses', expenses);
    return newExp;
  }

  public deleteExpense(id: string): void {
    const expenses = this.getExpenses().filter((e) => e.id !== id);
    this.set('expenses', expenses);
  }

  // --- DASHBOARD STATISTICS (Calculated strictly from real database records) ---
  public getDashboardStats() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const thisMonthStr = todayStr.slice(0, 7);

    const sales = this.getSales();
    const products = this.getProducts();
    const purchases = this.getPurchases();
    const expenses = this.getExpenses();
    const customers = this.getCustomers();
    const suppliers = this.getSuppliers();

    // Today's Sales
    const todaySalesItems = sales.filter((s) => s.saleDate === todayStr);
    const todaySalesRevenue = todaySalesItems.reduce((sum, s) => sum + s.totalAmount, 0);

    // Today's Cost of Goods Sold & Gross Profit
    const todayCogs = todaySalesItems.reduce((sum, s) => sum + s.quantity * s.costBasis, 0);
    const todayGrossProfit = todaySalesRevenue - todayCogs;

    // Today's Expenses
    const todayExpenses = expenses
      .filter((e) => e.date === todayStr)
      .reduce((sum, e) => sum + e.amount, 0);
    const todayNetProfit = todayGrossProfit - todayExpenses;

    // Monthly Sales
    const monthSalesItems = sales.filter((s) => s.saleDate.startsWith(thisMonthStr));
    const monthlySalesRevenue = monthSalesItems.reduce((sum, s) => sum + s.totalAmount, 0);

    // Monthly COGS & Gross Profit
    const monthCogs = monthSalesItems.reduce((sum, s) => sum + s.quantity * s.costBasis, 0);
    const monthlyGrossProfit = monthlySalesRevenue - monthCogs;

    // Monthly Expenses
    const monthlyExpenses = expenses
      .filter((e) => e.date.startsWith(thisMonthStr))
      .reduce((sum, e) => sum + e.amount, 0);
    const monthlyNetProfit = monthlyGrossProfit - monthlyExpenses;

    // Inventory & Stock
    const totalStock = products.reduce((sum, p) => sum + p.availableQuantity, 0);
    const stockValuation = products.reduce((sum, p) => sum + p.availableQuantity * p.purchaseCost, 0);

    // Purchases
    const totalPurchases = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

    // Total Expenses All Time
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Outstanding balances
    const customerOutstanding = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
    const supplierOutstanding = suppliers.reduce((sum, s) => sum + s.outstandingBalance, 0);

    // Low Stock Alerts
    const lowStockAlerts = products.filter((p) => p.availableQuantity <= p.minStockLevel);

    return {
      todaySalesRevenue,
      todayNetProfit,
      todayGrossProfit,
      todayExpenses,
      monthlySalesRevenue,
      monthlyNetProfit,
      monthlyGrossProfit,
      monthlyExpenses,
      totalStock,
      stockValuation,
      totalPurchases,
      totalExpenses,
      customerOutstanding,
      supplierOutstanding,
      lowStockAlertsCount: lowStockAlerts.length,
      lowStockAlerts,
    };
  }

  // --- PROFIT AND LOSS CALCULATOR (Weighted Average COGS basis) ---
  public calculateProfitLoss(period: 'daily' | 'weekly' | 'monthly' | 'all', customStartDate?: string, customEndDate?: string) {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    let startDate = '';
    const endDate = customEndDate || todayStr;

    if (period === 'daily') {
      startDate = todayStr;
    } else if (period === 'weekly') {
      const d = new Date(today);
      d.setDate(d.getDate() - 7);
      startDate = d.toISOString().slice(0, 10);
    } else if (period === 'monthly') {
      startDate = todayStr.slice(0, 7) + '-01';
    } else if (customStartDate) {
      startDate = customStartDate;
    } else {
      startDate = '2000-01-01';
    }

    const sales = this.getSales().filter((s) => s.saleDate >= startDate && s.saleDate <= endDate);
    const expenses = this.getExpenses().filter((e) => e.date >= startDate && e.date <= endDate);
    const damaged = this.getDamagedStock().filter((d) => d.date >= startDate && d.date <= endDate);

    const totalSalesRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalDiscountsGiven = sales.reduce((sum, s) => sum + (s.discount || 0), 0);
    const totalItemsSold = sales.reduce((sum, s) => sum + s.quantity, 0);

    // True COGS from locked weighted-average cost basis
    const costOfGoodsSold = sales.reduce((sum, s) => sum + s.quantity * s.costBasis, 0);
    const grossProfit = totalSalesRevenue - costOfGoodsSold;
    const grossMarginPercent = totalSalesRevenue > 0 ? (grossProfit / totalSalesRevenue) * 100 : 0;

    const totalBusinessExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalDamagedLoss = damaged.reduce((sum, d) => sum + d.costLoss, 0);

    const netProfit = grossProfit - totalBusinessExpenses - totalDamagedLoss;
    const netMarginPercent = totalSalesRevenue > 0 ? (netProfit / totalSalesRevenue) * 100 : 0;

    return {
      period,
      startDate,
      endDate,
      totalSalesRevenue,
      totalDiscountsGiven,
      totalItemsSold,
      costOfGoodsSold,
      grossProfit,
      grossMarginPercent,
      totalBusinessExpenses,
      totalDamagedLoss,
      netProfit,
      netMarginPercent,
      salesCount: sales.length,
      expensesCount: expenses.length,
    };
  }

  // --- BACKUP & RESTORE (Offline JSON Database File) ---
  public getBackupSummary() {
    return {
      productsCount: this.getProducts().length,
      salesCount: this.getSales().length,
      purchasesCount: this.getPurchases().length,
      customersCount: this.getCustomers().length,
      suppliersCount: this.getSuppliers().length,
      expensesCount: this.getExpenses().length,
      lastBackupDate: typeof window !== 'undefined' ? localStorage.getItem('saqib_belt_last_backup_date') : null,
    };
  }

  public exportBackup(): string {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      app: 'SAQIB Belt Business Manager',
      owners: this.getOwners(),
      settings: this.getSettings(),
      products: this.getProducts(),
      purchases: this.getPurchases(),
      sales: this.getSales(),
      stockMovements: this.getStockMovements(),
      damagedStock: this.getDamagedStock(),
      customers: this.getCustomers(),
      customerPayments: this.getCustomerPayments(),
      suppliers: this.getSuppliers(),
      supplierPayments: this.getSupplierPayments(),
      expenses: this.getExpenses(),
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('saqib_belt_last_backup_date', new Date().toISOString());
      } catch {
        // ignore
      }
    }
    return JSON.stringify(data, null, 2);
  }

  public restoreBackup(jsonString: string): {
    success: boolean;
    message: string;
    details?: {
      productsCount: number;
      salesCount: number;
      purchasesCount: number;
      customersCount: number;
      expensesCount: number;
      exportedAt?: string;
    };
  } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.version || !data.products || !Array.isArray(data.products)) {
        return { success: false, message: 'Invalid backup format! Missing required table collections.' };
      }

      this.set('products', data.products);
      if (Array.isArray(data.purchases)) this.set('purchases', data.purchases);
      if (Array.isArray(data.sales)) this.set('sales', data.sales);
      if (Array.isArray(data.stockMovements)) this.set('movements', data.stockMovements);
      if (Array.isArray(data.damagedStock)) this.set('damaged', data.damagedStock);
      if (Array.isArray(data.customers)) this.set('customers', data.customers);
      if (Array.isArray(data.customerPayments)) this.set('customer_payments', data.customerPayments);
      if (Array.isArray(data.suppliers)) this.set('suppliers', data.suppliers);
      if (Array.isArray(data.supplierPayments)) this.set('supplier_payments', data.supplierPayments);
      if (Array.isArray(data.expenses)) this.set('expenses', data.expenses);
      if (data.settings) this.set('settings', data.settings);
      if (data.owners) this.set('owners', data.owners);

      return {
        success: true,
        message: 'Database successfully restored from backup file.',
        details: {
          productsCount: data.products?.length || 0,
          salesCount: data.sales?.length || 0,
          purchasesCount: data.purchases?.length || 0,
          customersCount: data.customers?.length || 0,
          expensesCount: data.expenses?.length || 0,
          exportedAt: data.exportedAt,
        },
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, message: 'Failed to parse backup JSON file: ' + errorMsg };
    }
  }

  public eraseAllData(): void {
    this.set('products', []);
    this.set('purchases', []);
    this.set('sales', []);
    this.set('movements', []);
    this.set('damaged', []);
    this.set('customers', []);
    this.set('customer_payments', []);
    this.set('suppliers', []);
    this.set('supplier_payments', []);
    this.set('expenses', []);
  }

  public resetToFactory(): void {
    localStorage.clear();
    this.initIfEmpty();
  }
}

export const db = new BeltDatabase();

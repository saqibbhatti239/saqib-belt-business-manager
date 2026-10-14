import { Language } from '../types';

export interface Translations {
  appName: string;
  tagline: string;
  currency: string;
  currencySymbol: string;

  // Nav
  navDashboard: string;
  navProducts: string;
  navSales: string;
  navPurchases: string;
  navStock: string;
  navProfitLoss: string;
  navCustomers: string;
  navSuppliers: string;
  navExpenses: string;
  navReports: string;
  navOwners: string;
  navSettings: string;
  navAndroidStudio: string;
  navCloudSync: string;

  // Dashboard
  todaySales: string;
  todayProfit: string;
  monthlySales: string;
  monthlyProfit: string;
  totalStockUnits: string;
  totalPurchases: string;
  businessExpenses: string;
  customerOutstanding: string;
  supplierOutstanding: string;
  lowStockAlerts: string;
  inventoryValuation: string;
  grossMargin: string;
  quickActions: string;
  newSale: string;
  newPurchase: string;
  addExpense: string;
  recentSales: string;
  stockAlertsTitle: string;
  noAlerts: string;

  // Products
  productsTitle: string;
  addProduct: string;
  editProduct: string;
  searchProducts: string;
  productName: string;
  productCode: string;
  design: string;
  colour: string;
  size: string;
  material: string;
  purchaseCost: string;
  sellingPrice: string;
  availableQuantity: string;
  minStockLevel: string;
  productPhoto: string;
  saveProduct: string;
  deleteProduct: string;
  units: string;
  lowStock: string;
  inStock: string;
  openingStock: string;
  openingStockHelp: string;
  viewBeltDetails: string;
  updatePrices: string;
  adjustStock: string;
  archiveBelt: string;
  unarchiveBelt: string;
  restartApp: string;
  restartConfirmTitle: string;
  restartConfirmMessage: string;
  restartSuccess: string;
  cannotDeleteBeltWithHistory: string;

  // Purchases
  purchasesTitle: string;
  recordPurchase: string;
  supplierName: string;
  purchaseDate: string;
  quantityPurchased: string;
  costPerBelt: string;
  totalPurchaseAmount: string;
  amountPaid: string;
  remainingSupplierBalance: string;
  invoiceNumber: string;
  notes: string;
  savePurchase: string;
  purchaseHistory: string;

  // Sales
  salesTitle: string;
  posSale: string;
  customerName: string;
  customerPhone: string;
  quantitySold: string;
  discount: string;
  totalSale: string;
  amountReceived: string;
  remainingCustomerBalance: string;
  saleDate: string;
  paymentMethod: string;
  completeSale: string;
  printReceipt: string;
  insufficientStock: string;
  cannotSellMoreThanAvailable: string;

  // Stock
  stockTitle: string;
  availableStock: string;
  damagedStock: string;
  stockMovements: string;
  logDamagedBelt: string;
  reason: string;
  damageLoss: string;
  movementHistory: string;
  allBeltsGood: string;

  // Profit Loss
  plTitle: string;
  dailyProfit: string;
  weeklyProfit: string;
  costOfGoodsSold: string;
  grossProfit: string;
  netProfit: string;
  weightedAvgExplanation: string;
  cogsBasisNote: string;

  // Customers & Suppliers
  customersTitle: string;
  suppliersTitle: string;
  addCustomer: string;
  addSupplier: string;
  customerLedger: string;
  supplierLedger: string;
  phone: string;
  address: string;
  city: string;
  company: string;
  recordPayment: string;
  sendWhatsApp: string;

  // Expenses
  expensesTitle: string;
  recordExpense: string;
  category: string;
  amount: string;
  paidBy: string;

  // Reports
  reportsTitle: string;
  filterDaily: string;
  filterWeekly: string;
  filterMonthly: string;
  filterCustom: string;
  exportCsv: string;
  printReport: string;

  // Settings & Theme
  settingsTitle: string;
  selectLanguage: string;
  selectTheme: string;
  customWallpaper: string;
  securityPin: string;
  backupRestore: string;
  backupData: string;
  restoreData: string;
  ownersTitle: string;
  brightness: string;
  blur: string;
  overlay: string;
  resetWallpaper: string;
  lockAppNow: string;
  enterPin: string;
  changePin: string;
  biometricUnlock: string;

  // Common
  cancel: string;
  confirm: string;
  save: string;
  delete: string;
  view: string;
  date: string;
  status: string;
  action: string;
  search: string;
  all: string;
  total: string;
  balance: string;
  paid: string;
  success: string;
  error: string;
  downloadZip: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'SAQIB',
    tagline: 'Belt Business Manager',
    currency: 'PKR',
    currencySymbol: 'Rs.',

    navDashboard: 'Dashboard',
    navProducts: 'Products',
    navSales: 'Sales POS',
    navPurchases: 'Purchases',
    navStock: 'Stock & Audit',
    navProfitLoss: 'Profit & Loss',
    navCustomers: 'Customers',
    navSuppliers: 'Suppliers',
    navExpenses: 'Expenses',
    navReports: 'Reports',
    navOwners: 'Partners',
    navSettings: 'Settings',
    navAndroidStudio: 'Android Project',
    navCloudSync: 'Cloud Sync',

    todaySales: "Today's Sales",
    todayProfit: "Today's Net Profit",
    monthlySales: 'Monthly Sales',
    monthlyProfit: 'Monthly Net Profit',
    totalStockUnits: 'Available Stock',
    totalPurchases: 'Total Purchases',
    businessExpenses: 'Total Expenses',
    customerOutstanding: 'Customer Dues (Udhar)',
    supplierOutstanding: 'Supplier Payable',
    lowStockAlerts: 'Low Stock Alerts',
    inventoryValuation: 'Stock Valuation',
    grossMargin: 'Gross Margin',
    quickActions: 'Quick Actions',
    newSale: 'New Sale',
    newPurchase: 'Add Purchase',
    addExpense: 'Add Expense',
    recentSales: 'Recent Sales',
    stockAlertsTitle: 'Critical Low Stock',
    noAlerts: 'All belt stocks are above minimum threshold.',

    productsTitle: 'Belt Catalog',
    addProduct: 'Add New Belt',
    editProduct: 'Edit Belt',
    searchProducts: 'Search by code, design, size, colour...',
    productName: 'Product Name',
    productCode: 'Item Code',
    design: 'Buckle / Design',
    colour: 'Colour',
    size: 'Size (Waist)',
    material: 'Material',
    purchaseCost: 'Cost Price (Rs.)',
    sellingPrice: 'Sale Price (Rs.)',
    availableQuantity: 'Quantity',
    minStockLevel: 'Min Alert Level',
    productPhoto: 'Belt Photo',
    saveProduct: 'Save Belt',
    deleteProduct: 'Delete Belt',
    units: 'pcs',
    lowStock: 'Low Stock',
    inStock: 'In Stock',
    openingStock: 'Opening Stock Quantity',
    openingStockHelp: 'Enter 0 if no inventory purchased yet',
    viewBeltDetails: 'View Belt Details',
    updatePrices: 'Update Prices',
    adjustStock: 'Update Stock (Audit)',
    archiveBelt: 'Archive Belt',
    unarchiveBelt: 'Unarchive Belt',
    restartApp: 'Restart & Erase All Data',
    restartConfirmTitle: 'Erase All Business Data & Restart?',
    restartConfirmMessage: 'This will permanently wipe all products, sales, purchases, expenses, ledgers, and inventory records. All data will be erased to give you a clean fresh slate. Are you sure?',
    restartSuccess: 'App restarted successfully! All data has been erased.',
    cannotDeleteBeltWithHistory: 'Cannot delete belt because it has existing sales or purchase records. Transaction history must be preserved. You can Archive it instead.',

    purchasesTitle: 'Purchase Inward',
    recordPurchase: 'Record Belt Purchase',
    supplierName: 'Supplier Name',
    purchaseDate: 'Purchase Date',
    quantityPurchased: 'Quantity Purchased',
    costPerBelt: 'Cost Per Belt (Rs.)',
    totalPurchaseAmount: 'Total Bill Amount',
    amountPaid: 'Amount Paid (Rs.)',
    remainingSupplierBalance: 'Supplier Balance Due',
    invoiceNumber: 'Invoice / Bill #',
    notes: 'Remarks / Notes',
    savePurchase: 'Save Purchase & Update Stock',
    purchaseHistory: 'Purchase History',

    salesTitle: 'Counter POS Sale',
    posSale: 'Sell Belts',
    customerName: 'Customer Name',
    customerPhone: 'Customer Phone',
    quantitySold: 'Qty Sold',
    discount: 'Discount (Rs.)',
    totalSale: 'Final Amount (Rs.)',
    amountReceived: 'Cash Received (Rs.)',
    remainingCustomerBalance: 'Customer Due (Rs.)',
    saleDate: 'Sale Date',
    paymentMethod: 'Payment Mode',
    completeSale: 'Confirm Sale & Print Invoice',
    printReceipt: 'Print Invoice',
    insufficientStock: 'Insufficient Stock!',
    cannotSellMoreThanAvailable: 'Cannot sell more than available warehouse inventory.',

    stockTitle: 'Inventory & Auditing',
    availableStock: 'Saleable Belts',
    damagedStock: 'Damaged / Scratched Belts',
    stockMovements: 'Stock Movement Ledger',
    logDamagedBelt: 'Write-off Damaged Belt',
    reason: 'Reason of Damage',
    damageLoss: 'Damage Value Loss',
    movementHistory: 'Movement Audit Log',
    allBeltsGood: 'No damaged stock recorded.',

    plTitle: 'Profit & Loss Statement',
    dailyProfit: 'Daily Net Profit',
    weeklyProfit: 'Weekly Net Profit',
    costOfGoodsSold: 'Cost of Goods Sold (COGS)',
    grossProfit: 'Gross Profit',
    netProfit: 'Net Profit',
    weightedAvgExplanation: 'Calculated using real Weighted Average Costing basis locked per invoice.',
    cogsBasisNote: 'Net Profit = Gross Profit - Business Expenses. Total sales revenue is never counted as pure profit.',

    customersTitle: 'Customer Ledgers',
    suppliersTitle: 'Supplier Ledgers',
    addCustomer: 'Add Customer',
    addSupplier: 'Add Supplier',
    customerLedger: 'Customer Statement',
    supplierLedger: 'Supplier Statement',
    phone: 'Phone Number',
    address: 'Address / Shop',
    city: 'City',
    company: 'Company / Brand',
    recordPayment: 'Receive / Make Payment',
    sendWhatsApp: 'Send WhatsApp Statement',

    expensesTitle: 'Shop Expense Tracker',
    recordExpense: 'Log Expense',
    category: 'Expense Category',
    amount: 'Amount (Rs.)',
    paidBy: 'Paid By Partner',

    reportsTitle: 'Financial & Inventory Reports',
    filterDaily: 'Today',
    filterWeekly: 'This Week',
    filterMonthly: 'This Month',
    filterCustom: 'All Time',
    exportCsv: 'Export CSV',
    printReport: 'Print Statement',

    settingsTitle: 'Settings & Android Configuration',
    selectLanguage: 'Application Language',
    selectTheme: 'Appearance Theme',
    customWallpaper: 'Custom Gallery Wallpaper',
    securityPin: 'PIN & Biometric Lock',
    backupRestore: 'Local Backup & Restore',
    backupData: 'Create Local Backup (.json)',
    restoreData: 'Restore Backup File',
    ownersTitle: 'Business Partners',
    brightness: 'Wallpaper Brightness',
    blur: 'Wallpaper Blur',
    overlay: 'Dark Contrast Tint',
    resetWallpaper: 'Reset to Default Wallpaper',
    lockAppNow: 'Lock Screen Now',
    enterPin: 'Enter 4-Digit Security PIN',
    changePin: 'Change Security PIN',
    biometricUnlock: 'Fingerprint / Biometric Sensor',

    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save Changes',
    delete: 'Delete',
    view: 'View',
    date: 'Date',
    status: 'Status',
    action: 'Action',
    search: 'Search...',
    all: 'All',
    total: 'Total',
    balance: 'Balance',
    paid: 'Paid',
    success: 'Operation Successful',
    error: 'Error',
    downloadZip: 'Download Android Studio Project (.ZIP)',
  },

  ur: {
    appName: 'ثاقب',
    tagline: 'بیلٹ بزنس مینیجر',
    currency: 'PKR',
    currencySymbol: 'روپے',

    navDashboard: 'ڈیش بورڈ',
    navProducts: 'بیلٹس / مال',
    navSales: 'کاؤنٹر سیل (فروخت)',
    navPurchases: 'خریداری (پرچیز)',
    navStock: 'سٹاک اور گودام',
    navProfitLoss: 'نفع و نقصان (P&L)',
    navCustomers: 'گاہک کھاتہ',
    navSuppliers: 'سپلائرز کھاتہ',
    navExpenses: 'دکان کے اخراجات',
    navReports: 'رپورٹس',
    navOwners: 'شراکت دار (مالکان)',
    navSettings: 'سیٹنگز',
    navAndroidStudio: 'اینڈرائیڈ پروجیکٹ',
    navCloudSync: 'کلاؤڈ سنک',

    todaySales: 'آج کی فروخت',
    todayProfit: 'آج کا خالص منافع',
    monthlySales: 'ماہانہ فروخت',
    monthlyProfit: 'ماہانہ خالص منافع',
    totalStockUnits: 'موجودہ بیلٹس سٹاک',
    totalPurchases: 'کل خریداری',
    businessExpenses: 'کل اخراجات',
    customerOutstanding: 'گاہکوں کا بقایا (ادھار)',
    supplierOutstanding: 'سپلائرز کو واجب الادا',
    lowStockAlerts: 'کم سٹاک الرٹس',
    inventoryValuation: 'سٹاک کی کل مالیت',
    grossMargin: 'مجموعی مارجن',
    quickActions: 'فوری کارروائی',
    newSale: 'نئی فروخت',
    newPurchase: 'نئی خریداری',
    addExpense: 'خرچہ درج کریں',
    recentSales: 'حالیہ فروخت',
    stockAlertsTitle: 'کم سٹاک والی بیلٹس',
    noAlerts: 'تمام بیلٹس کا سٹاک تسلی بخش ہے۔',

    productsTitle: 'بیلٹس کی فہرست',
    addProduct: 'نئی بیلٹ شامل کریں',
    editProduct: 'بیلٹ میں ترمیم',
    searchProducts: 'کوڈ، ڈیزائن، سائز یا رنگ سے تلاش کریں...',
    productName: 'بیلٹ کا نام',
    productCode: 'آئٹم کوڈ',
    design: 'بکل / ڈیزائن',
    colour: 'رنگ',
    size: 'سائز (کمر)',
    material: 'چمڑا / میٹریل',
    purchaseCost: 'قیمت خرید (روپے)',
    sellingPrice: 'قیمت فروخت (روپے)',
    availableQuantity: 'تعداد',
    minStockLevel: 'کم از کم انتباہی تعداد',
    productPhoto: 'بیلٹ تصویر',
    saveProduct: 'بیلٹ محفوظ کریں',
    deleteProduct: 'حذف کریں',
    units: 'عدد',
    lowStock: 'کم سٹاک',
    inStock: 'موجود',
    openingStock: 'ابتدائی اسٹاک تعداد',
    openingStockHelp: 'اگر ابھی مال نہیں خریدا تو 0 درج کریں',
    viewBeltDetails: 'بیلٹ کی مکمل تفصیلات دیکھیں',
    updatePrices: 'قیمتیں تبدیل کریں',
    adjustStock: 'سٹاک ایڈجسٹمنٹ (آڈٹ)',
    archiveBelt: 'بیلٹ آرکائیو کریں',
    unarchiveBelt: 'آرکائیو سے نکالیں',
    restartApp: 'ایپ دوبارہ شروع کریں اور تمام ڈیٹا مٹائیں',
    restartConfirmTitle: 'کیا آپ تمام ڈیٹا مٹا کر دوبارہ شروع کرنا چاہتے ہیں؟',
    restartConfirmMessage: 'اس سے تمام بیلٹس، فروخت، خریداری، اخراجات اور کھاتوں کا تمام ریکارڈ مستقل طور پر صاف ہو جائے گا اور ایپ بالکل نئی ہو جائے گی۔ کیا آپ کو یقین ہے؟',
    restartSuccess: 'ایپ کامیابی سے دوبارہ شروع کر دی گئی ہے۔ تمام ڈیٹا مٹا دیا گیا ہے۔',
    cannotDeleteBeltWithHistory: 'اس بیلٹ کو مستقل طور پر حذف نہیں کیا جا سکتا کیونکہ اس کی فروخت یا خریداری کا ریکارڈ موجود ہے۔ آپ اسے آرکائیو کر سکتے ہیں۔',

    purchasesTitle: 'خریداری کا اندراج',
    recordPurchase: 'سپلائر سے خریداری درج کریں',
    supplierName: 'سپلائر کا نام',
    purchaseDate: 'خریداری کی تاریخ',
    quantityPurchased: 'خریداری تعداد',
    costPerBelt: 'فی بیلٹ لاگت (روپے)',
    totalPurchaseAmount: 'کل بل رقم',
    amountPaid: 'ادا شدہ رقم',
    remainingSupplierBalance: 'بقیہ واجب الادا',
    invoiceNumber: 'انوائس / بل نمبر',
    notes: 'تفصیل / نوٹ',
    savePurchase: 'خریداری محفوظ کریں اور سٹاک بڑھائیں',
    purchaseHistory: 'خریداری کی تاریخ وار فہرست',

    salesTitle: 'کاؤنٹر سیل پوائنٹ',
    posSale: 'بیلٹ فروخت کریں',
    customerName: 'گاہک کا نام',
    customerPhone: 'گاہک کا فون',
    quantitySold: 'فروخت شدہ تعداد',
    discount: 'رعایت (روپے)',
    totalSale: 'حتمی بل رقم (روپے)',
    amountReceived: 'وصول شدہ نقد (روپے)',
    remainingCustomerBalance: 'بقیہ ادھار (روپے)',
    saleDate: 'تاریخ فروخت',
    paymentMethod: 'طریقہ ادائیگی',
    completeSale: 'فروخت مکمل کریں اور بل بنائیں',
    printReceipt: 'انوائس پرنٹ کریں',
    insufficientStock: 'سٹاک ناکافی ہے!',
    cannotSellMoreThanAvailable: 'موجودہ سٹاک سے زیادہ بیلٹس فروخت نہیں کی جا سکتیں۔',

    stockTitle: 'گودام و سٹاک کی نگرانی',
    availableStock: 'فروخت کیلئے تیار بیلٹس',
    damagedStock: 'خراب / سکریچ والی بیلٹس',
    stockMovements: 'سٹاک کی نقل و حرکت کا کھاتہ',
    logDamagedBelt: 'خراب بیلٹ درج کریں',
    reason: 'نقصان کی وجہ',
    damageLoss: 'نقصان کی رقم',
    movementHistory: 'سٹاک کھاتہ ہسٹری',
    allBeltsGood: 'کوئی خراب بیلٹ درج نہیں ہے۔',

    plTitle: 'نفع و نقصان کا گوشوارہ',
    dailyProfit: 'روزانہ کا خالص نفع',
    weeklyProfit: 'ہفتہ وار خالص نفع',
    costOfGoodsSold: 'فروخت شدہ مال کی اصل لاگت',
    grossProfit: 'مجموعی نفع (Gross Profit)',
    netProfit: 'خالص منافع (Net Profit)',
    weightedAvgExplanation: 'اصل وزنی اوسط لاگت کے فارمولے کے مطابق حساب کیا گیا ہے۔',
    cogsBasisNote: 'خالص نفع = مجموعی نفع منفی اخراجات۔ کل سیلز کو کبھی منافع نہیں سمجھا جاتا۔',

    customersTitle: 'گاہکوں کے کھاتے',
    suppliersTitle: 'سپلائرز کے کھاتے',
    addCustomer: 'نیا گاہک درج کریں',
    addSupplier: 'نیا سپلائر درج کریں',
    customerLedger: 'گاہک کا لیجر',
    supplierLedger: 'سپلائر کا لیجر',
    phone: 'فون نمبر',
    address: 'پتہ / دکان',
    city: 'شہر',
    company: 'کمپنی',
    recordPayment: 'رقم وصولی / ادائیگی درج کریں',
    sendWhatsApp: 'واٹس ایپ پر کھاتہ بھیجیں',

    expensesTitle: 'دکان کے اخراجات',
    recordExpense: 'خرچہ درج کریں',
    category: 'خرچے کی قسم',
    amount: 'رقم (روپے)',
    paidBy: 'کس پارٹنر نے ادا کیا',

    reportsTitle: 'مالیاتی و سٹاک رپورٹس',
    filterDaily: 'آج',
    filterWeekly: 'اس ہفتے',
    filterMonthly: 'اس ماہ',
    filterCustom: 'تمام عرصہ',
    exportCsv: 'ایکسل / CSV ڈاؤن لوڈ',
    printReport: 'رپورٹ پرنٹ کریں',

    settingsTitle: 'سیٹنگز اور ایپ کنفیگریشن',
    selectLanguage: 'ایپلی کیشن کی زبان',
    selectTheme: 'رنگین تھیم',
    customWallpaper: 'گیلری سے وال پیپر لگائیں',
    securityPin: 'پن کوڈ اور فنگر پرنٹ لاک',
    backupRestore: 'لوکل بیک اپ اور بحالی',
    backupData: 'ڈیٹا کا بیک اپ لیں (.json)',
    restoreData: 'بیک اپ فائل بحال کریں',
    ownersTitle: 'کاروباری مالکان',
    brightness: 'وال پیپر کی چمک',
    blur: 'وال پیپر دھندلاہٹ',
    overlay: 'ڈارک اوورلے (پڑھنے میں آسانی)',
    resetWallpaper: 'اصلی وال پیپر بحال کریں',
    lockAppNow: 'ایپ کو ابھی لاک کریں',
    enterPin: '4 ہندسوں کا سیکیورٹی پن درج کریں',
    changePin: 'سیکیورٹی پن تبدیل کریں',
    biometricUnlock: 'فنگر پرنٹ ان لاک',

    cancel: 'منسوخ کریں',
    confirm: 'تصدیق کریں',
    save: 'محفوظ کریں',
    delete: 'حذف کریں',
    view: 'دیکھیں',
    date: 'تاریخ',
    status: 'حالت',
    action: 'عمل',
    search: 'تلاش کریں...',
    all: 'سب',
    total: 'کل',
    balance: 'بقیہ',
    paid: 'ادا شدہ',
    success: 'کامیابی کے ساتھ عمل ہوا',
    error: 'غلطی',
    downloadZip: 'مکمل اینڈرائیڈ سٹوڈیو پروجیکٹ ڈاؤن لوڈ کریں (.ZIP)',
  },

  roman_ur: {
    appName: 'SAQIB',
    tagline: 'Belt Business Manager',
    currency: 'PKR',
    currencySymbol: 'Rs.',

    navDashboard: 'Dashboard',
    navProducts: 'Belts / Maal',
    navSales: 'Farokht (Sales POS)',
    navPurchases: 'Khareedari (Purchases)',
    navStock: 'Stock & Godown',
    navProfitLoss: 'Nafa Nuqsan (P&L)',
    navCustomers: 'Grahak Khata',
    navSuppliers: 'Supplier Khata',
    navExpenses: 'Dukan Ke Kharchay',
    navReports: 'Reports',
    navOwners: 'Hissaydar (Partners)',
    navSettings: 'Settings',
    navAndroidStudio: 'Android Project',
    navCloudSync: 'Cloud Sync',

    todaySales: 'Aaj Ki Farokht',
    todayProfit: 'Aaj Ka Asal Nafa',
    monthlySales: 'Is Mahinay Ki Farokht',
    monthlyProfit: 'Is Mahinay Ka Asal Nafa',
    totalStockUnits: 'Mojooda Belts Stock',
    totalPurchases: 'Kul Khareedari',
    businessExpenses: 'Dukan Ke Kul Kharchay',
    customerOutstanding: 'Grahakon Ka Udhar (Bakaya)',
    supplierOutstanding: 'Suppliers Ka Dena (Payable)',
    lowStockAlerts: 'Kam Stock Alerts',
    inventoryValuation: 'Stock Ki Asal Maliyat',
    grossMargin: 'Gross Margin',
    quickActions: 'Jaldi Kaam',
    newSale: 'Nayi Farokht',
    newPurchase: 'Nayi Khareedari',
    addExpense: 'Kharcha Likhain',
    recentSales: 'Taza Farokht',
    stockAlertsTitle: 'Kam Stock Wali Belts',
    noAlerts: 'Sabhi belts ka stock pura hai.',

    productsTitle: 'Belts Ki List',
    addProduct: 'Nayi Belt Shamil Karain',
    editProduct: 'Belt Tabdeel Karain',
    searchProducts: 'Code, design, size ya rang se dhoondain...',
    productName: 'Belt Ka Naam',
    productCode: 'Item Code',
    design: 'Buckle / Design',
    colour: 'Rang (Colour)',
    size: 'Size (Kamar)',
    material: 'Chamra / Material',
    purchaseCost: 'Khareed Qimat (Rs.)',
    sellingPrice: 'Bechnay Ki Qimat (Rs.)',
    availableQuantity: 'Mojood Tadaad',
    minStockLevel: 'Kam se kam Alert Level',
    productPhoto: 'Belt Ki Tasveer',
    saveProduct: 'Belt Save Karain',
    deleteProduct: 'Khatam Karain',
    units: 'pcs',
    lowStock: 'Kam Stock',
    inStock: 'Mojood',
    openingStock: 'Ibtidai Stock Qty',
    openingStockHelp: 'Agar abhi stock nahi khareeda to 0 likhain',
    viewBeltDetails: 'Belt Ki Tafseel Dekhain',
    updatePrices: 'Qeematein Update Karain',
    adjustStock: 'Stock Tabdeel Karain (Audit)',
    archiveBelt: 'Belt Archive Karain',
    unarchiveBelt: 'Unarchive Karain',
    restartApp: 'App Restart Karein & Saara Data Mitayein',
    restartConfirmTitle: 'Kya Aap Saara Data Mita Kar Restart Karna Chahtay Hain?',
    restartConfirmMessage: 'Is se saari belts, bikri, khareedari, kharchay aur ledgers ka record bilkul saaf ho jaye ga aur app nayi shuru ho jaye gi. Kya aapko yaqeen hai?',
    restartSuccess: 'App kamyabi se restart ho gayi hai! Saara data mita diya gaya hai.',
    cannotDeleteBeltWithHistory: 'Is belt ko delete nahi kiya ja sakta kyunki iski bikri ya khareedari ka record mojood hai. Aap isay Archive kar saktay hain.',

    purchasesTitle: 'Khareedari Ka Record',
    recordPurchase: 'Supplier Se Khareedari Likhain',
    supplierName: 'Supplier Ka Naam',
    purchaseDate: 'Khareedari Ki Tareekh',
    quantityPurchased: 'Kitni Belts Khareedeen',
    costPerBelt: 'Fi Belt Kharch (Rs.)',
    totalPurchaseAmount: 'Kul Bill Amount',
    amountPaid: 'Ada Kiye Gaye Paise',
    remainingSupplierBalance: 'Supplier Ka Baqi Dena',
    invoiceNumber: 'Invoice / Bill Number',
    notes: 'Tafseel / Notes',
    savePurchase: 'Khareedari Save & Stock Update',
    purchaseHistory: 'Khareedari Ki Tareekh',

    salesTitle: 'Counter POS Farokht',
    posSale: 'Belt Baichain',
    customerName: 'Grahak Ka Naam',
    customerPhone: 'Grahak Ka Phone',
    quantitySold: 'Tadaad (Qty)',
    discount: 'Discount (Rs.)',
    totalSale: 'Kul Bill (Rs.)',
    amountReceived: 'Wasool Hui Raqam (Rs.)',
    remainingCustomerBalance: 'Baqi Udhar (Rs.)',
    saleDate: 'Farokht Ki Tareekh',
    paymentMethod: 'Tareeqa-e-Adaiygi',
    completeSale: 'Sale Pura Karain & Bill Nikalain',
    printReceipt: 'Invoice Print Karain',
    insufficientStock: 'Stock Kam Hai!',
    cannotSellMoreThanAvailable: 'Mojooda stock se zyada belts nahi baichi ja saktin.',

    stockTitle: 'Godown & Stock Hisaab',
    availableStock: 'Bechnay Wali Belts',
    damagedStock: 'Kharab / Scratched Belts',
    stockMovements: 'Stock Aane Janay Ka Khata',
    logDamagedBelt: 'Kharab Belt Note Karain',
    reason: 'Kharabi Ki Wajah',
    damageLoss: 'Nuqsan Ki Qimat',
    movementHistory: 'Stock Movement History',
    allBeltsGood: 'Koi kharab belt record me nahi.',

    plTitle: 'Nafa Nuqsan Ka Hisaab',
    dailyProfit: 'Rozana Ka Asal Nafa',
    weeklyProfit: 'Haftay Ka Asal Nafa',
    costOfGoodsSold: 'Farokht Shuda Maal Ki Asal Qimat',
    grossProfit: 'Gross Nafa',
    netProfit: 'Net Nafa (Asal Bachat)',
    weightedAvgExplanation: 'Weighted Average Costing formula ke mutabiq hisaab lagaya gaya hai.',
    cogsBasisNote: 'Net Nafa = Gross Nafa - Dukan Ke Kharchay. Kul sales ko kabhi nafa nahi gina jata.',

    customersTitle: 'Grahak Khata (Udhar)',
    suppliersTitle: 'Supplier Khata (Payables)',
    addCustomer: 'Naya Grahak Shamil Karain',
    addSupplier: 'Naya Supplier Shamil Karain',
    customerLedger: 'Grahak Ka Statement',
    supplierLedger: 'Supplier Ka Statement',
    phone: 'Phone Number',
    address: 'Pata / Dukan',
    city: 'Sheher',
    company: 'Company',
    recordPayment: 'Wasooli / Adaiygi Likhain',
    sendWhatsApp: 'WhatsApp Par Khata Bhejayn',

    expensesTitle: 'Dukan Ke Kharchay',
    recordExpense: 'Kharcha Likhain',
    category: 'Kharchay Ki Qisam',
    amount: 'Raqam (Rs.)',
    paidBy: 'Kis Partner Ne Diya',

    reportsTitle: 'Maliati & Stock Reports',
    filterDaily: 'Aaj Ka',
    filterWeekly: 'Is Haftay Ka',
    filterMonthly: 'Is Mahinay Ka',
    filterCustom: 'Tamam Muddat',
    exportCsv: 'Excel / CSV Download',
    printReport: 'Report Print Karain',

    settingsTitle: 'Settings & Android Configuration',
    selectLanguage: 'App Ki Zuban',
    selectTheme: 'Theme Ka Rang',
    customWallpaper: 'Gallery Se Wallpaper Lagayein',
    securityPin: 'PIN Code & Fingerprint Lock',
    backupRestore: 'Local Backup & Restore',
    backupData: 'Local Backup File Banayein (.json)',
    restoreData: 'Backup Restore Karain',
    ownersTitle: 'Karobar Ke Malik',
    brightness: 'Wallpaper Roshni (Brightness)',
    blur: 'Wallpaper Dhundlahat (Blur)',
    overlay: 'Dark Tint (Parhnay Me Asani)',
    resetWallpaper: 'Purana Wallpaper Wapis Layen',
    lockAppNow: 'App Ko Foran Lock Karain',
    enterPin: '4 Hindsay Ka Security PIN Likhain',
    changePin: 'Security PIN Badlain',
    biometricUnlock: 'Fingerprint Sensor',

    cancel: 'Cancel',
    confirm: 'Tasdeeq',
    save: 'Save Karain',
    delete: 'Khatam Karain',
    view: 'Daikhain',
    date: 'Tareekh',
    status: 'Status',
    action: 'Action',
    search: 'Talaash...',
    all: 'Sab',
    total: 'Kul',
    balance: 'Baqi',
    paid: 'Wasool Shuda',
    success: 'Kamiyabi se ho gaya',
    error: 'Kharabi',
    downloadZip: 'Complete Android Studio Project (.ZIP)',
  },
};

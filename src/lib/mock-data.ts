import {
  Product, Category, Customer, Employee, Sale, Store, TaxRate,
  StockAdjustment, LoyaltyLog, BusinessSettings, LoyaltyConfig,
  ModifierGroup, Discount, Supplier, PurchaseOrder, Shift, CashMovement,
  Table, TableSection, KDSTicket,
} from './types';

const uid = () => Math.random().toString(36).slice(2, 11);

export const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Food & Drinks', color: '#0F766E' },
  { id: 'cat-2', name: 'Electronics', color: '#6D28D9' },
  { id: 'cat-3', name: 'Clothing', color: '#DB2777' },
  { id: 'cat-4', name: 'Beauty', color: '#EA580C' },
];

export const defaultStores: Store[] = [
  { id: 'store-1', name: 'Main Branch', address: '123 Commerce St, Downtown', phone: '+1 555-0100', manager: 'Alice Johnson', active: true },
  { id: 'store-2', name: 'Annexe', address: '456 Market Ave, Uptown', phone: '+1 555-0200', manager: 'Bob Smith', active: true },
];

export const defaultTaxRates: TaxRate[] = [
  { id: 'tax-1', name: 'Standard', rate: 19.25 },
  { id: 'tax-2', name: 'Reduced', rate: 9 },
  { id: 'tax-3', name: 'Zero', rate: 0 },
];

export const defaultEmployees: Employee[] = [
  { id: 'emp-1', name: 'Alice Johnson', email: 'admin@swiftpos.com', password: 'demo1234', role: 'owner', pin: '1234', active: true, lastLogin: new Date().toISOString() },
  { id: 'emp-2', name: 'Bob Smith', email: 'bob@swiftpos.com', password: 'demo1234', role: 'manager', pin: '5678', active: true, lastLogin: new Date(Date.now() - 86400000).toISOString() },
  { id: 'emp-3', name: 'Carol Davis', email: 'carol@swiftpos.com', password: 'demo1234', role: 'cashier', pin: '9012', active: true, lastLogin: new Date(Date.now() - 172800000).toISOString() },
];

// ─── Modifiers ────────────────────────────────────────────────────────────────

export const defaultModifierGroups: ModifierGroup[] = [
  {
    id: 'mod-1',
    name: 'Size',
    required: true,
    multiSelect: false,
    minSelections: 1,
    maxSelections: 1,
    options: [
      { id: 'mopt-1-1', name: 'Small', price: 0 },
      { id: 'mopt-1-2', name: 'Medium', price: 500 },
      { id: 'mopt-1-3', name: 'Large', price: 1000 },
    ],
  },
  {
    id: 'mod-2',
    name: 'Extras',
    required: false,
    multiSelect: true,
    minSelections: 0,
    maxSelections: 5,
    options: [
      { id: 'mopt-2-1', name: 'Extra Shot', price: 500 },
      { id: 'mopt-2-2', name: 'Oat Milk', price: 300 },
      { id: 'mopt-2-3', name: 'Vanilla Syrup', price: 200 },
      { id: 'mopt-2-4', name: 'Whipped Cream', price: 250 },
    ],
  },
  {
    id: 'mod-3',
    name: 'Cooking',
    required: false,
    multiSelect: false,
    minSelections: 0,
    maxSelections: 1,
    options: [
      { id: 'mopt-3-1', name: 'Rare', price: 0 },
      { id: 'mopt-3-2', name: 'Medium', price: 0 },
      { id: 'mopt-3-3', name: 'Well Done', price: 0 },
    ],
  },
  {
    id: 'mod-4',
    name: 'Sugar Level',
    required: false,
    multiSelect: false,
    minSelections: 0,
    maxSelections: 1,
    options: [
      { id: 'mopt-4-1', name: 'No Sugar', price: 0 },
      { id: 'mopt-4-2', name: '25%', price: 0 },
      { id: 'mopt-4-3', name: '50%', price: 0 },
      { id: 'mopt-4-4', name: '100%', price: 0 },
    ],
  },
];

export const defaultProducts: Product[] = [
  { id: 'prod-1', name: 'Espresso Coffee', sku: 'FD-001', category: 'cat-1', description: 'Rich espresso shot', price: 1500, cost: 600, taxRate: 19.25, barcode: '1000000001', image: '', trackInventory: true, stock: 150, lowStockThreshold: 20, active: true, storeId: 'store-1', modifierGroupIds: ['mod-1', 'mod-2', 'mod-4'] },
  { id: 'prod-2', name: 'Croissant', sku: 'FD-002', category: 'cat-1', description: 'Butter croissant', price: 1200, cost: 450, taxRate: 19.25, barcode: '1000000002', image: '', trackInventory: true, stock: 45, lowStockThreshold: 10, active: true, storeId: 'store-1', modifierGroupIds: [] },
  { id: 'prod-3', name: 'Fresh Orange Juice', sku: 'FD-003', category: 'cat-1', description: 'Freshly squeezed', price: 2000, cost: 800, taxRate: 9, barcode: '1000000003', image: '', trackInventory: true, stock: 60, lowStockThreshold: 15, active: true, storeId: 'store-1', modifierGroupIds: ['mod-1', 'mod-4'] },
  { id: 'prod-4', name: 'USB-C Cable', sku: 'EL-001', category: 'cat-2', description: '1m braided cable', price: 5000, cost: 2000, taxRate: 19.25, barcode: '2000000001', image: '', trackInventory: true, stock: 80, lowStockThreshold: 10, active: true, storeId: 'store-1', modifierGroupIds: [] },
  { id: 'prod-5', name: 'Wireless Earbuds', sku: 'EL-002', category: 'cat-2', description: 'Bluetooth 5.0', price: 15000, cost: 6000, taxRate: 19.25, barcode: '2000000002', image: '', trackInventory: true, stock: 25, lowStockThreshold: 5, active: true, storeId: 'store-1', modifierGroupIds: [] },
  { id: 'prod-6', name: 'Phone Case', sku: 'EL-003', category: 'cat-2', description: 'Silicone protective case', price: 3500, cost: 1200, taxRate: 19.25, barcode: '2000000003', image: '', trackInventory: true, stock: 8, lowStockThreshold: 10, active: true, storeId: 'store-1', modifierGroupIds: [] },
  { id: 'prod-7', name: 'Cotton T-Shirt', sku: 'CL-001', category: 'cat-3', description: '100% cotton, unisex', price: 8000, cost: 3000, taxRate: 19.25, barcode: '3000000001', image: '', trackInventory: true, stock: 40, lowStockThreshold: 8, active: true, storeId: 'store-1', modifierGroupIds: [] },
  { id: 'prod-8', name: 'Denim Jeans', sku: 'CL-002', category: 'cat-3', description: 'Classic fit', price: 25000, cost: 9000, taxRate: 19.25, barcode: '3000000002', image: '', trackInventory: true, stock: 15, lowStockThreshold: 5, active: true, storeId: 'store-1', modifierGroupIds: [] },
  { id: 'prod-9', name: 'Moisturizing Cream', sku: 'BT-001', category: 'cat-4', description: 'Daily moisturizer 50ml', price: 7500, cost: 2500, taxRate: 9, barcode: '4000000001', image: '', trackInventory: true, stock: 35, lowStockThreshold: 8, active: true, storeId: 'store-1', modifierGroupIds: [] },
  { id: 'prod-10', name: 'Lip Balm Set', sku: 'BT-002', category: 'cat-4', description: 'Set of 3 flavors', price: 4500, cost: 1400, taxRate: 9, barcode: '4000000002', image: '', trackInventory: true, stock: 50, lowStockThreshold: 12, active: true, storeId: 'store-1', modifierGroupIds: [] },
];

const customerNames = [
  ['Emma', 'Wilson'], ['James', 'Brown'], ['Sophia', 'Garcia'], ['Liam', 'Martinez'],
  ['Olivia', 'Anderson'], ['Noah', 'Taylor'], ['Ava', 'Thomas'], ['William', 'Jackson'],
  ['Isabella', 'White'], ['Mason', 'Harris'], ['Mia', 'Clark'], ['Ethan', 'Lewis'],
  ['Charlotte', 'Robinson'], ['Alexander', 'Walker'], ['Amelia', 'Hall'],
];

export const defaultCustomers: Customer[] = customerNames.map(([first, last], i) => ({
  id: `cust-${i + 1}`,
  firstName: first,
  lastName: last,
  email: `${first.toLowerCase()}.${last.toLowerCase()}@email.com`,
  phone: `+1 555-${String(1000 + i).padStart(4, '0')}`,
  address: `${100 + i * 10} Oak Street`,
  birthday: `199${i % 10}-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
  notes: '',
  loyaltyPoints: Math.floor(Math.random() * 500) + 10,
  totalVisits: Math.floor(Math.random() * 30) + 1,
  totalSpent: Math.round(Math.random() * 400000 + 25000),
  lastVisit: new Date(Date.now() - Math.random() * 14 * 86400000).toISOString(),
}));

function generateSales(): Sale[] {
  const sales: Sale[] = [];
  const methods: ('cash' | 'card' | 'mobile')[] = ['cash', 'card', 'mobile'];
  const cashiers = defaultEmployees;

  for (let i = 0; i < 30; i++) {
    const dayOffset = Math.floor(Math.random() * 14);
    const date = new Date(Date.now() - dayOffset * 86400000 - Math.random() * 86400000);
    const cashier = cashiers[Math.floor(Math.random() * cashiers.length)];
    const itemCount = Math.floor(Math.random() * 4) + 1;
    const items = [];
    let subtotal = 0;
    let taxTotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const p = defaultProducts[Math.floor(Math.random() * defaultProducts.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      const lineTotal = p.price * qty;
      const lineTax = lineTotal * (p.taxRate / 100);
      subtotal += lineTotal;
      taxTotal += lineTax;
      items.push({ productId: p.id, productName: p.name, quantity: qty, unitPrice: p.price, total: lineTotal, taxRate: p.taxRate });
    }

    const discount = Math.random() > 0.7 ? Math.round(Math.random() * 2000) : 0;
    const total = Math.round(subtotal - discount + taxTotal);
    const method = methods[Math.floor(Math.random() * methods.length)];
    const cust = Math.random() > 0.4 ? defaultCustomers[Math.floor(Math.random() * defaultCustomers.length)] : undefined;

    sales.push({
      id: `sale-${uid()}`,
      receiptNumber: `RCP-${String(1000 + i).padStart(5, '0')}`,
      date: date.toISOString(),
      cashier: cashier.name,
      cashierId: cashier.id,
      customerId: cust?.id,
      customerName: cust ? `${cust.firstName} ${cust.lastName}` : undefined,
      items,
      subtotal: Math.round(subtotal),
      discount,
      discountType: 'fixed',
      tax: Math.round(taxTotal),
      total,
      paymentMethod: method,
      cashTendered: method === 'cash' ? Math.ceil(total / 500) * 500 : undefined,
      change: method === 'cash' ? Math.ceil(total / 500) * 500 - total : undefined,
      note: '',
      storeId: 'store-1',
      orderType: Math.random() > 0.5 ? 'dine-in' : 'takeaway',
    });
  }

  return sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const defaultSales = generateSales();

export const defaultStockAdjustments: StockAdjustment[] = [
  { id: 'adj-1', date: new Date(Date.now() - 86400000 * 3).toISOString(), productId: 'prod-1', productName: 'Espresso Coffee', type: 'received', quantity: 50, reason: 'Supplier delivery', employee: 'Alice Johnson' },
  { id: 'adj-2', date: new Date(Date.now() - 86400000 * 2).toISOString(), productId: 'prod-6', productName: 'Phone Case', type: 'correction', quantity: -2, reason: 'Damaged units', employee: 'Bob Smith' },
];

export const defaultLoyaltyConfig: LoyaltyConfig = { enabled: true, pointsPerDollar: 1, pointRedemptionValue: 0.01 };

export const defaultLoyaltyLogs: LoyaltyLog[] = defaultSales.slice(0, 10).filter(s => s.customerId).map((s, i) => ({
  id: `loy-${i}`,
  customerId: s.customerId!,
  customerName: s.customerName!,
  date: s.date,
  transactionId: s.id,
  pointsEarned: Math.floor(s.total),
  pointsRedeemed: 0,
  balance: Math.floor(s.total) + Math.floor(Math.random() * 100),
}));

export const defaultBusinessSettings: BusinessSettings = {
  name: 'RootedPOS Store',
  address: '123 Commerce St, Downtown',
  phone: '+1 555-0100',
  email: 'info@rootedpos.com',
  currency: 'XOF',
  timezone: 'Africa/Dakar',
  logo: '',
  receiptHeader: 'RootedPOS Store',
  receiptFooter: 'Thank you for your visit!',
  receiptWidth: '80mm',
  showTaxNumber: true,
  showCashierName: true,
  showCustomerName: true,
  taxNumber: 'TAX-12345678',
  showProductImages: true,
  requireCustomer: false,
  paymentMethods: { cash: true, card: true, mobile: true },
};

// ─── Discounts ────────────────────────────────────────────────────────────────

export const defaultDiscounts: Discount[] = [
  { id: 'disc-1', name: 'Staff Discount', type: 'percent', value: 15, active: true },
  { id: 'disc-2', name: 'Happy Hour', type: 'percent', value: 10, active: true },
  { id: 'disc-3', name: 'Loyalty Reward', type: 'fixed', value: 1000, active: true },
  { id: 'disc-4', name: 'Weekend Special', type: 'percent', value: 5, active: true },
  { id: 'disc-5', name: 'Bulk Buy', type: 'percent', value: 20, active: false },
];

// ─── Suppliers ────────────────────────────────────────────────────────────────

export const defaultSuppliers: Supplier[] = [
  { id: 'sup-1', name: 'Global Foods Ltd', email: 'orders@globalfoods.com', phone: '+1 555-2001', address: '1 Industrial Zone, City', contactPerson: 'Marie Dupont', notes: 'Main food supplier', active: true },
  { id: 'sup-2', name: 'Tech Wholesale Co', email: 'supply@techwholesale.com', phone: '+1 555-2002', address: '50 Tech Park, Downtown', contactPerson: 'Jean Pierre', notes: 'Electronics supplier', active: true },
  { id: 'sup-3', name: 'Fashion House SA', email: 'b2b@fashionhouse.com', phone: '+1 555-2003', address: '12 Fashion District', contactPerson: 'Amina Diallo', notes: 'Clothing & accessories', active: true },
  { id: 'sup-4', name: 'Beauty & Care Dist.', email: 'orders@beautycare.com', phone: '+1 555-2004', address: '8 Boulevard Central', contactPerson: 'Fatou Ndiaye', notes: 'Beauty products', active: true },
];

// ─── Purchase Orders ─────────────────────────────────────────────────────────

export const defaultPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-00001',
    supplierId: 'sup-1',
    supplierName: 'Global Foods Ltd',
    status: 'received',
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    expectedDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    receivedDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    items: [
      { productId: 'prod-1', productName: 'Espresso Coffee', orderedQty: 100, receivedQty: 100, unitCost: 600, total: 60000 },
      { productId: 'prod-2', productName: 'Croissant', orderedQty: 50, receivedQty: 50, unitCost: 450, total: 22500 },
    ],
    subtotal: 82500,
    total: 82500,
    notes: 'Regular weekly order',
    storeId: 'store-1',
  },
  {
    id: 'po-2',
    poNumber: 'PO-00002',
    supplierId: 'sup-2',
    supplierName: 'Tech Wholesale Co',
    status: 'ordered',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    expectedDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    items: [
      { productId: 'prod-4', productName: 'USB-C Cable', orderedQty: 50, receivedQty: 0, unitCost: 2000, total: 100000 },
      { productId: 'prod-5', productName: 'Wireless Earbuds', orderedQty: 20, receivedQty: 0, unitCost: 6000, total: 120000 },
    ],
    subtotal: 220000,
    total: 220000,
    notes: '',
    storeId: 'store-1',
  },
  {
    id: 'po-3',
    poNumber: 'PO-00003',
    supplierId: 'sup-3',
    supplierName: 'Fashion House SA',
    status: 'draft',
    date: new Date().toISOString(),
    expectedDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    items: [
      { productId: 'prod-7', productName: 'Cotton T-Shirt', orderedQty: 30, receivedQty: 0, unitCost: 3000, total: 90000 },
    ],
    subtotal: 90000,
    total: 90000,
    notes: 'New season stock',
    storeId: 'store-1',
  },
];

// ─── Shifts ───────────────────────────────────────────────────────────────────

export const defaultShifts: Shift[] = [
  {
    id: 'shift-1',
    employeeId: 'emp-1',
    employeeName: 'Alice Johnson',
    storeId: 'store-1',
    openTime: new Date(Date.now() - 86400000).toISOString(),
    closeTime: new Date(Date.now() - 86400000 + 8 * 3600000).toISOString(),
    openingCash: 50000,
    closingCash: 187500,
    expectedCash: 190000,
    cashSales: 142000,
    cardSales: 85000,
    mobileSales: 43000,
    totalSales: 270000,
    totalTransactions: 18,
    cashIn: 0,
    cashOut: 4500,
    note: '',
    status: 'closed',
  },
];

export const defaultCashMovements: CashMovement[] = [
  { id: 'cm-1', shiftId: 'shift-1', date: new Date(Date.now() - 86400000 + 3600000).toISOString(), type: 'out', amount: 4500, reason: 'Petty cash - cleaning supplies', employee: 'Alice Johnson' },
];

// ─── Tables ───────────────────────────────────────────────────────────────────

export const defaultTableSections: TableSection[] = [
  { id: 'sec-1', name: 'Main Hall' },
  { id: 'sec-2', name: 'Terrace' },
  { id: 'sec-3', name: 'VIP Room' },
];

export const defaultTables: Table[] = [
  { id: 'tbl-1', name: 'T1', sectionId: 'sec-1', seats: 4, status: 'available' },
  { id: 'tbl-2', name: 'T2', sectionId: 'sec-1', seats: 4, status: 'occupied', guestCount: 3, openedAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'tbl-3', name: 'T3', sectionId: 'sec-1', seats: 6, status: 'reserved' },
  { id: 'tbl-4', name: 'T4', sectionId: 'sec-1', seats: 2, status: 'available' },
  { id: 'tbl-5', name: 'T5', sectionId: 'sec-1', seats: 4, status: 'available' },
  { id: 'tbl-6', name: 'T6', sectionId: 'sec-1', seats: 8, status: 'occupied', guestCount: 6, openedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'tbl-7', name: 'Terrace 1', sectionId: 'sec-2', seats: 2, status: 'available' },
  { id: 'tbl-8', name: 'Terrace 2', sectionId: 'sec-2', seats: 2, status: 'available' },
  { id: 'tbl-9', name: 'Terrace 3', sectionId: 'sec-2', seats: 4, status: 'occupied', guestCount: 2, openedAt: new Date(Date.now() - 900000).toISOString() },
  { id: 'tbl-10', name: 'VIP 1', sectionId: 'sec-3', seats: 10, status: 'available' },
];

// ─── KDS Tickets ─────────────────────────────────────────────────────────────

export const defaultKDSTickets: KDSTicket[] = [
  {
    id: 'kds-1',
    ticketNumber: 'T-001',
    tableId: 'tbl-2',
    tableName: 'T2',
    orderType: 'dine-in',
    items: [
      { productId: 'prod-1', productName: 'Espresso Coffee', quantity: 2, modifiers: ['Large', 'Extra Shot'], note: '', status: 'done' },
      { productId: 'prod-2', productName: 'Croissant', quantity: 2, modifiers: [], note: 'No butter', status: 'pending' },
    ],
    status: 'preparing',
    createdAt: new Date(Date.now() - 600000).toISOString(),
    startedAt: new Date(Date.now() - 540000).toISOString(),
    note: '',
    cashier: 'Carol Davis',
  },
  {
    id: 'kds-2',
    ticketNumber: 'T-002',
    tableId: 'tbl-6',
    tableName: 'T6',
    orderType: 'dine-in',
    items: [
      { productId: 'prod-3', productName: 'Fresh Orange Juice', quantity: 3, modifiers: ['Medium'], note: '', status: 'pending' },
      { productId: 'prod-1', productName: 'Espresso Coffee', quantity: 2, modifiers: ['Small', 'No Sugar'], note: '', status: 'pending' },
    ],
    status: 'pending',
    createdAt: new Date(Date.now() - 120000).toISOString(),
    note: 'Allergic to nuts',
    cashier: 'Alice Johnson',
  },
  {
    id: 'kds-3',
    ticketNumber: 'T-003',
    orderType: 'takeaway',
    items: [
      { productId: 'prod-1', productName: 'Espresso Coffee', quantity: 1, modifiers: ['Large', 'Oat Milk'], note: '', status: 'pending' },
    ],
    status: 'ready',
    createdAt: new Date(Date.now() - 900000).toISOString(),
    startedAt: new Date(Date.now() - 840000).toISOString(),
    completedAt: new Date(Date.now() - 300000).toISOString(),
    note: 'Name: Jean',
    cashier: 'Bob Smith',
  },
];

// ─── Seed Function ─────────────────────────────────────────────────────────────

export function seedData() {
  const SEED_VERSION = 'v3-loyverse';
  if (localStorage.getItem('swiftpos_seed_version') !== SEED_VERSION) {
    Object.keys(localStorage).filter(k => k.startsWith('swiftpos_')).forEach(k => localStorage.removeItem(k));
    localStorage.setItem('swiftpos_products', JSON.stringify(defaultProducts));
    localStorage.setItem('swiftpos_categories', JSON.stringify(defaultCategories));
    localStorage.setItem('swiftpos_customers', JSON.stringify(defaultCustomers));
    localStorage.setItem('swiftpos_employees', JSON.stringify(defaultEmployees));
    localStorage.setItem('swiftpos_sales', JSON.stringify(defaultSales));
    localStorage.setItem('swiftpos_stores', JSON.stringify(defaultStores));
    localStorage.setItem('swiftpos_taxRates', JSON.stringify(defaultTaxRates));
    localStorage.setItem('swiftpos_stockAdjustments', JSON.stringify(defaultStockAdjustments));
    localStorage.setItem('swiftpos_loyaltyConfig', JSON.stringify(defaultLoyaltyConfig));
    localStorage.setItem('swiftpos_loyaltyLogs', JSON.stringify(defaultLoyaltyLogs));
    localStorage.setItem('swiftpos_businessSettings', JSON.stringify(defaultBusinessSettings));
    localStorage.setItem('swiftpos_heldOrders', JSON.stringify([]));
    localStorage.setItem('swiftpos_currentStore', 'store-1');
    // New entities
    localStorage.setItem('swiftpos_modifierGroups', JSON.stringify(defaultModifierGroups));
    localStorage.setItem('swiftpos_discounts', JSON.stringify(defaultDiscounts));
    localStorage.setItem('swiftpos_suppliers', JSON.stringify(defaultSuppliers));
    localStorage.setItem('swiftpos_purchaseOrders', JSON.stringify(defaultPurchaseOrders));
    localStorage.setItem('swiftpos_shifts', JSON.stringify(defaultShifts));
    localStorage.setItem('swiftpos_cashMovements', JSON.stringify(defaultCashMovements));
    localStorage.setItem('swiftpos_tables', JSON.stringify(defaultTables));
    localStorage.setItem('swiftpos_tableSections', JSON.stringify(defaultTableSections));
    localStorage.setItem('swiftpos_kdsTickets', JSON.stringify(defaultKDSTickets));
    localStorage.setItem('swiftpos_seed_version', SEED_VERSION);
  }
}

export function getData<T>(key: string): T {
  const raw = localStorage.getItem(`swiftpos_${key}`);
  return raw ? JSON.parse(raw) : ([] as unknown as T);
}

export function setData<T>(key: string, data: T) {
  localStorage.setItem(`swiftpos_${key}`, JSON.stringify(data));
}

import { Product, Category, Customer, Employee, Sale, Store, TaxRate, StockAdjustment, LoyaltyLog, BusinessSettings, LoyaltyConfig } from './types';

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

export const defaultProducts: Product[] = [
  { id: 'prod-1', name: 'Espresso Coffee', sku: 'FD-001', category: 'cat-1', description: 'Rich espresso shot', price: 1500, cost: 600, taxRate: 19.25, barcode: '1000000001', image: '', trackInventory: true, stock: 150, lowStockThreshold: 20, active: true, storeId: 'store-1' },
  { id: 'prod-2', name: 'Croissant', sku: 'FD-002', category: 'cat-1', description: 'Butter croissant', price: 1200, cost: 450, taxRate: 19.25, barcode: '1000000002', image: '', trackInventory: true, stock: 45, lowStockThreshold: 10, active: true, storeId: 'store-1' },
  { id: 'prod-3', name: 'Fresh Orange Juice', sku: 'FD-003', category: 'cat-1', description: 'Freshly squeezed', price: 2000, cost: 800, taxRate: 9, barcode: '1000000003', image: '', trackInventory: true, stock: 60, lowStockThreshold: 15, active: true, storeId: 'store-1' },
  { id: 'prod-4', name: 'USB-C Cable', sku: 'EL-001', category: 'cat-2', description: '1m braided cable', price: 5000, cost: 2000, taxRate: 19.25, barcode: '2000000001', image: '', trackInventory: true, stock: 80, lowStockThreshold: 10, active: true, storeId: 'store-1' },
  { id: 'prod-5', name: 'Wireless Earbuds', sku: 'EL-002', category: 'cat-2', description: 'Bluetooth 5.0', price: 15000, cost: 6000, taxRate: 19.25, barcode: '2000000002', image: '', trackInventory: true, stock: 25, lowStockThreshold: 5, active: true, storeId: 'store-1' },
  { id: 'prod-6', name: 'Phone Case', sku: 'EL-003', category: 'cat-2', description: 'Silicone protective case', price: 3500, cost: 1200, taxRate: 19.25, barcode: '2000000003', image: '', trackInventory: true, stock: 8, lowStockThreshold: 10, active: true, storeId: 'store-1' },
  { id: 'prod-7', name: 'Cotton T-Shirt', sku: 'CL-001', category: 'cat-3', description: '100% cotton, unisex', price: 8000, cost: 3000, taxRate: 19.25, barcode: '3000000001', image: '', trackInventory: true, stock: 40, lowStockThreshold: 8, active: true, storeId: 'store-1' },
  { id: 'prod-8', name: 'Denim Jeans', sku: 'CL-002', category: 'cat-3', description: 'Classic fit', price: 25000, cost: 9000, taxRate: 19.25, barcode: '3000000002', image: '', trackInventory: true, stock: 15, lowStockThreshold: 5, active: true, storeId: 'store-1' },
  { id: 'prod-9', name: 'Moisturizing Cream', sku: 'BT-001', category: 'cat-4', description: 'Daily moisturizer 50ml', price: 7500, cost: 2500, taxRate: 9, barcode: '4000000001', image: '', trackInventory: true, stock: 35, lowStockThreshold: 8, active: true, storeId: 'store-1' },
  { id: 'prod-10', name: 'Lip Balm Set', sku: 'BT-002', category: 'cat-4', description: 'Set of 3 flavors', price: 4500, cost: 1400, taxRate: 9, barcode: '4000000002', image: '', trackInventory: true, stock: 50, lowStockThreshold: 12, active: true, storeId: 'store-1' },
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
  totalSpent: Math.round((Math.random() * 800 + 50) * 100) / 100,
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

    const discount = Math.random() > 0.7 ? Math.round(Math.random() * 5 * 100) / 100 : 0;
    const total = Math.round((subtotal - discount + taxTotal) * 100) / 100;
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
      subtotal: Math.round(subtotal * 100) / 100,
      discount,
      discountType: 'fixed',
      tax: Math.round(taxTotal * 100) / 100,
      total,
      paymentMethod: method,
      cashTendered: method === 'cash' ? Math.ceil(total / 5) * 5 : undefined,
      change: method === 'cash' ? Math.round((Math.ceil(total / 5) * 5 - total) * 100) / 100 : undefined,
      note: '',
      storeId: 'store-1',
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
  name: 'SwiftPOS Store',
  address: '123 Commerce St, Downtown',
  phone: '+1 555-0100',
  email: 'info@swiftpos.com',
  currency: 'USD',
  timezone: 'America/New_York',
  logo: '',
  receiptHeader: 'SwiftPOS Store',
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

export function seedData() {
  if (!localStorage.getItem('swiftpos_seeded')) {
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
    localStorage.setItem('swiftpos_seeded', 'true');
  }
}

export function getData<T>(key: string): T {
  const raw = localStorage.getItem(`swiftpos_${key}`);
  return raw ? JSON.parse(raw) : ([] as unknown as T);
}

export function setData<T>(key: string, data: T) {
  localStorage.setItem(`swiftpos_${key}`, JSON.stringify(data));
}

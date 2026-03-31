export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  cost: number;
  taxRate: number;
  barcode: string;
  image: string;
  trackInventory: boolean;
  stock: number;
  lowStockThreshold: number;
  active: boolean;
  storeId: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  birthday: string;
  notes: string;
  loyaltyPoints: number;
  totalVisits: number;
  totalSpent: number;
  lastVisit: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'owner' | 'manager' | 'cashier';
  pin: string;
  active: boolean;
  lastLogin: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  date: string;
  cashier: string;
  cashierId: string;
  customerId?: string;
  customerName?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  discountType: 'fixed' | 'percent';
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mobile';
  cashTendered?: number;
  change?: number;
  note: string;
  storeId: string;
  refunded?: boolean;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate: number;
}

export interface HeldOrder {
  id: string;
  items: CartItem[];
  customerId?: string;
  customerName?: string;
  discount: number;
  discountType: 'fixed' | 'percent';
  note: string;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
  active: boolean;
}

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
}

export interface LoyaltyConfig {
  enabled: boolean;
  pointsPerDollar: number;
  pointRedemptionValue: number;
}

export interface LoyaltyLog {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  transactionId?: string;
  pointsEarned: number;
  pointsRedeemed: number;
  balance: number;
}

export interface StockAdjustment {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: 'received' | 'removed' | 'correction';
  quantity: number;
  reason: string;
  employee: string;
}

export interface BusinessSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  timezone: string;
  logo: string;
  receiptHeader: string;
  receiptFooter: string;
  receiptWidth: '58mm' | '80mm';
  showTaxNumber: boolean;
  showCashierName: boolean;
  showCustomerName: boolean;
  taxNumber: string;
  showProductImages: boolean;
  requireCustomer: boolean;
  paymentMethods: { cash: boolean; card: boolean; mobile: boolean };
}

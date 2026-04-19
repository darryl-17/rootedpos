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
  modifierGroupIds?: string[];
  type?: 'standard' | 'composite';
  compositeItems?: CompositeItem[];
}

export interface CompositeItem {
  productId: string;
  productName: string;
  quantity: number;
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

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedModifiers?: SelectedModifier[];
  itemNote?: string;
  itemDiscount?: number;
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
  discountName?: string;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mobile' | 'split';
  payments?: PaymentSplit[];
  cashTendered?: number;
  change?: number;
  note: string;
  storeId: string;
  refunded?: boolean;
  tableId?: string;
  tableName?: string;
  orderType?: 'dine-in' | 'takeaway' | 'delivery';
  shiftId?: string;
}

export interface PaymentSplit {
  method: 'cash' | 'card' | 'mobile';
  amount: number;
  cashTendered?: number;
  change?: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  modifiersPrice?: number;
  total: number;
  taxRate: number;
  selectedModifiers?: SelectedModifier[];
  itemNote?: string;
  itemDiscount?: number;
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
  tableId?: string;
  tableName?: string;
  orderType?: 'dine-in' | 'takeaway';
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

// ─── Modifiers ───────────────────────────────────────────────────────────────

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  multiSelect: boolean;
  minSelections: number;
  maxSelections: number;
  options: ModifierOption[];
}

// ─── Discounts ────────────────────────────────────────────────────────────────

export interface Discount {
  id: string;
  name: string;
  type: 'fixed' | 'percent';
  value: number;
  active: boolean;
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  notes: string;
  active: boolean;
}

// ─── Purchase Orders ─────────────────────────────────────────────────────────

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  orderedQty: number;
  receivedQty: number;
  unitCost: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  date: string;
  expectedDate: string;
  receivedDate?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  total: number;
  notes: string;
  storeId: string;
}

// ─── Shifts & Cash Management ─────────────────────────────────────────────────

export interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  storeId: string;
  openTime: string;
  closeTime?: string;
  openingCash: number;
  closingCash?: number;
  expectedCash?: number;
  cashSales: number;
  cardSales: number;
  mobileSales: number;
  totalSales: number;
  totalTransactions: number;
  cashIn: number;
  cashOut: number;
  note: string;
  status: 'open' | 'closed';
}

export interface CashMovement {
  id: string;
  shiftId: string;
  date: string;
  type: 'in' | 'out';
  amount: number;
  reason: string;
  employee: string;
}

// ─── Tables ───────────────────────────────────────────────────────────────────

export interface TableSection {
  id: string;
  name: string;
}

export interface Table {
  id: string;
  name: string;
  sectionId: string;
  seats: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
  guestCount?: number;
  openedAt?: string;
}

// ─── Kitchen Display System ───────────────────────────────────────────────────

export interface KDSItem {
  productId: string;
  productName: string;
  quantity: number;
  modifiers: string[];
  note: string;
  status: 'pending' | 'done';
}

export interface KDSTicket {
  id: string;
  ticketNumber: string;
  tableId?: string;
  tableName?: string;
  orderType: 'dine-in' | 'takeaway';
  items: KDSItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  note: string;
  cashier: string;
}

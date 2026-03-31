import { useState, useMemo } from 'react';
import { Package } from 'lucide-react';
import { Search, ShoppingCart, Pause, Clock, Trash2, Plus, Minus, X, Banknote, CreditCard, Smartphone, FileText, Printer, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { usePOSStore } from '@/stores/pos-store';
import { useAuthStore } from '@/stores/auth-store';
import { getData, setData } from '@/lib/mock-data';
import { Product, Category, Customer, Sale, SaleItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function POSPage() {
  const { toast } = useToast();
  const user = useAuthStore(s => s.user);
  const pos = usePOSStore();

  const products = useMemo(() => getData<Product[]>('products').filter(p => p.active), []);
  const categories = useMemo(() => getData<Category[]>('categories'), []);
  const customers = useMemo(() => getData<Customer[]>('customers'), []);

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [showReceipt, setShowReceipt] = useState(false);
  const [showHeld, setShowHeld] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [payMethod, setPayMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [cashTendered, setCashTendered] = useState('');
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
    const matchCat = catFilter === 'all' || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const filteredCustomers = customers.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const completeSale = () => {
    if (pos.cart.length === 0) return;

    const total = pos.getTotal();
    const tendered = payMethod === 'cash' ? parseFloat(cashTendered) || 0 : total;
    if (payMethod === 'cash' && tendered < total) {
      toast({ title: 'Insufficient cash', variant: 'destructive' });
      return;
    }

    const saleItems: SaleItem[] = pos.cart.map(i => ({
      productId: i.product.id,
      productName: i.product.name,
      quantity: i.quantity,
      unitPrice: i.product.price,
      total: i.product.price * i.quantity,
      taxRate: i.product.taxRate,
    }));

    const salesList = getData<Sale[]>('sales');
    const receiptNum = `RCP-${String(salesList.length + 1001).padStart(5, '0')}`;

    const sale: Sale = {
      id: `sale-${Math.random().toString(36).slice(2)}`,
      receiptNumber: receiptNum,
      date: new Date().toISOString(),
      cashier: user?.name || '',
      cashierId: user?.id || '',
      customerId: pos.customerId || undefined,
      customerName: pos.customerName || undefined,
      items: saleItems,
      subtotal: Math.round(pos.getSubtotal() * 100) / 100,
      discount: pos.discount,
      discountType: pos.discountType,
      tax: Math.round(pos.getTax() * 100) / 100,
      total: Math.round(total * 100) / 100,
      paymentMethod: payMethod,
      cashTendered: payMethod === 'cash' ? tendered : undefined,
      change: payMethod === 'cash' ? Math.round((tendered - total) * 100) / 100 : undefined,
      note: pos.note,
      storeId: localStorage.getItem('swiftpos_currentStore') || 'store-1',
    };

    // Update stock
    const allProducts = getData<Product[]>('products');
    pos.cart.forEach(item => {
      const idx = allProducts.findIndex(p => p.id === item.product.id);
      if (idx !== -1 && allProducts[idx].trackInventory) {
        allProducts[idx].stock = Math.max(0, allProducts[idx].stock - item.quantity);
      }
    });
    setData('products', allProducts);
    setData('sales', [sale, ...salesList]);

    setLastSale(sale);
    pos.clearCart();
    setShowPayment(false);
    setShowReceipt(true);
    setCashTendered('');
    toast({ title: 'Sale completed!', description: `Receipt ${receiptNum}` });
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] animate-fade-in">
      {/* LEFT — Products */}
      <div className="flex-[3] flex flex-col border-r">
        <div className="p-4 border-b flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search products or scan barcode..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" className="gap-2 relative" onClick={() => { pos.loadHeldOrders(); setShowHeld(true); }}>
            <Clock className="h-4 w-4" />
            Held
            {pos.heldOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">{pos.heldOrders.length}</span>
            )}
          </Button>
        </div>

        {/* Category filter */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto border-b">
          <button
            onClick={() => setCatFilter('all')}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors', catFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}
          >All</button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setCatFilter(c.id)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors', catFilter === c.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}
            >{c.name}</button>
          ))}
        </div>

        {/* Product grid */}
        <ScrollArea className="flex-1">
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => pos.addToCart(p)}
                className="group text-left border rounded-xl p-3 hover:border-primary hover:shadow-md transition-all bg-card"
              >
                <div className="h-16 rounded-lg bg-muted flex items-center justify-center mb-2">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium truncate">{p.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold text-primary">${p.price.toFixed(2)}</span>
                  <span className={cn('text-xs', p.stock <= p.lowStockThreshold ? 'text-destructive' : 'text-muted-foreground')}>{p.stock} left</span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p>No products found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* RIGHT — Cart */}
      <div className="flex-[2] flex flex-col max-w-md">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2"><ShoppingCart className="h-4 w-4" />Current Order</h2>
          {pos.cart.length > 0 && (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => pos.holdOrder()}>
                <Pause className="h-3 w-3" />Hold
              </Button>
              <Button variant="ghost" size="sm" className="text-xs text-destructive gap-1" onClick={() => pos.clearCart()}>
                <Trash2 className="h-3 w-3" />Clear
              </Button>
            </div>
          )}
        </div>

        {/* Customer selector */}
        <div className="px-4 py-2 border-b">
          {pos.customerName ? (
            <div className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2">
              <span className="text-sm font-medium">{pos.customerName}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => pos.setCustomer(null, null)}><X className="h-3 w-3" /></Button>
            </div>
          ) : (
            <Select onValueChange={v => {
              const c = customers.find(c => c.id === v);
              if (c) pos.setCustomer(c.id, `${c.firstName} ${c.lastName}`);
            }}>
              <SelectTrigger className="text-sm"><SelectValue placeholder="Select customer (optional)" /></SelectTrigger>
              <SelectContent>
                {customers.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Cart items */}
        <ScrollArea className="flex-1">
          {pos.cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-muted-foreground">
              <ShoppingCart className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm">Cart is empty</p>
              <p className="text-xs">Click a product to add it</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {pos.cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-3 p-2 rounded-lg border bg-card">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">${item.product.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => pos.updateQuantity(item.product.id, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => pos.updateQuantity(item.product.id, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                  </div>
                  <span className="text-sm font-semibold w-16 text-right">${(item.product.price * item.quantity).toFixed(2)}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => pos.removeFromCart(item.product.id)}><X className="h-3 w-3" /></Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Discount + Note */}
        {pos.cart.length > 0 && (
          <div className="px-4 py-2 border-t space-y-2">
            <div className="flex gap-2">
              <Input type="number" min="0" placeholder="Discount" value={pos.discount || ''} onChange={e => pos.setDiscount(parseFloat(e.target.value) || 0, pos.discountType)} className="flex-1" />
              <Select value={pos.discountType} onValueChange={v => pos.setDiscount(pos.discount, v as 'fixed' | 'percent')}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">$</SelectItem>
                  <SelectItem value="percent">%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea placeholder="Order note..." rows={1} value={pos.note} onChange={e => pos.setNote(e.target.value)} className="resize-none" />
          </div>
        )}

        {/* Totals + Pay */}
        {pos.cart.length > 0 && (
          <div className="p-4 border-t bg-card space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>${pos.getSubtotal().toFixed(2)}</span></div>
            {pos.getDiscountAmount() > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Discount</span><span className="text-destructive">-${pos.getDiscountAmount().toFixed(2)}</span></div>}
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span>${pos.getTax().toFixed(2)}</span></div>
            <Separator />
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span>${pos.getTotal().toFixed(2)}</span></div>
            <div className="grid grid-cols-3 gap-2 pt-2">
              <Button variant="outline" className="gap-1.5" onClick={() => { setPayMethod('cash'); setShowPayment(true); }}><Banknote className="h-4 w-4" />Cash</Button>
              <Button variant="outline" className="gap-1.5" onClick={() => { setPayMethod('card'); setShowPayment(true); }}><CreditCard className="h-4 w-4" />Card</Button>
              <Button variant="outline" className="gap-1.5" onClick={() => { setPayMethod('mobile'); setShowPayment(true); }}><Smartphone className="h-4 w-4" />Mobile</Button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Complete Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold">${pos.getTotal().toFixed(2)}</p>
              <Badge className="mt-1 capitalize">{payMethod}</Badge>
            </div>
            {payMethod === 'cash' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Cash Tendered</label>
                <Input type="number" min="0" step="0.01" value={cashTendered} onChange={e => setCashTendered(e.target.value)} autoFocus />
                {parseFloat(cashTendered) >= pos.getTotal() && (
                  <p className="text-sm font-medium text-success">Change: ${(parseFloat(cashTendered) - pos.getTotal()).toFixed(2)}</p>
                )}
              </div>
            )}
            <Button className="w-full" size="lg" onClick={completeSale}>
              Charge ${pos.getTotal().toFixed(2)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Receipt</DialogTitle></DialogHeader>
          {lastSale && (
            <div className="space-y-3 text-sm">
              <div className="text-center border-b pb-3">
                <p className="font-bold text-lg">SwiftPOS Store</p>
                <p className="text-muted-foreground text-xs">{lastSale.receiptNumber}</p>
                <p className="text-muted-foreground text-xs">{new Date(lastSale.date).toLocaleString()}</p>
              </div>
              {lastSale.items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>{item.quantity}x {item.productName}</span>
                  <span>${item.total.toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between"><span>Subtotal</span><span>${lastSale.subtotal.toFixed(2)}</span></div>
              {lastSale.discount > 0 && <div className="flex justify-between"><span>Discount</span><span>-${lastSale.discount.toFixed(2)}</span></div>}
              <div className="flex justify-between"><span>Tax</span><span>${lastSale.tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>${lastSale.total.toFixed(2)}</span></div>
              {lastSale.paymentMethod === 'cash' && lastSale.cashTendered && (
                <>
                  <div className="flex justify-between"><span>Cash</span><span>${lastSale.cashTendered.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Change</span><span>${lastSale.change?.toFixed(2)}</span></div>
                </>
              )}
              <div className="text-center text-xs text-muted-foreground pt-2">
                <p>Cashier: {lastSale.cashier}</p>
                <p className="capitalize">Payment: {lastSale.paymentMethod}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 gap-1" onClick={() => toast({ title: 'Receipt sent to printer' })}><Printer className="h-4 w-4" />Print</Button>
                <Button variant="outline" className="flex-1 gap-1" onClick={() => toast({ title: 'Email sent (mock)' })}><Mail className="h-4 w-4" />Email</Button>
              </div>
              <Button className="w-full" onClick={() => setShowReceipt(false)}>New Sale</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Held Orders Dialog */}
      <Dialog open={showHeld} onOpenChange={setShowHeld}>
        <DialogContent>
          <DialogHeader><DialogTitle>Held Orders</DialogTitle></DialogHeader>
          {pos.heldOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No held orders</p>
          ) : (
            <div className="space-y-2">
              {pos.heldOrders.map(o => (
                <div key={o.id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{o.items.length} items · {o.customerName || 'Walk-in'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => { pos.recallOrder(o.id); setShowHeld(false); }}>Recall</Button>
                    <Button size="sm" variant="destructive" onClick={() => pos.removeHeldOrder(o.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

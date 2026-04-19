import { useState, useMemo } from 'react';
import { Plus, Eye, Edit, Trash2, Search, ShoppingBag, CheckCircle, Clock, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getData, setData } from '@/lib/mock-data';
import { PurchaseOrder, PurchaseOrderItem, Supplier, Product } from '@/lib/types';
import { formatCFA } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';

const statusColors: Record<string, string> = {
  draft: 'secondary',
  ordered: 'default',
  received: 'outline',
  cancelled: 'destructive',
};

const statusIcons: Record<string, React.ReactNode> = {
  draft: <FileText className="h-3.5 w-3.5" />,
  ordered: <Clock className="h-3.5 w-3.5" />,
  received: <CheckCircle className="h-3.5 w-3.5" />,
  cancelled: <X className="h-3.5 w-3.5" />,
};

export default function PurchaseOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState(() => getData<PurchaseOrder[]>('purchaseOrders'));
  const [suppliers] = useState(() => getData<Supplier[]>('suppliers'));
  const [products] = useState(() => getData<Product[]>('products'));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewOrder, setViewOrder] = useState<PurchaseOrder | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editOrder, setEditOrder] = useState<Partial<PurchaseOrder>>({});
  const [formItems, setFormItems] = useState<PurchaseOrderItem[]>([]);

  const filtered = useMemo(() => orders.filter(o => {
    const ms = o.poNumber.toLowerCase().includes(search.toLowerCase()) || o.supplierName.toLowerCase().includes(search.toLowerCase());
    const mst = statusFilter === 'all' || o.status === statusFilter;
    return ms && mst;
  }), [orders, search, statusFilter]);

  const openNew = () => {
    setEditOrder({ status: 'draft', date: new Date().toISOString(), expectedDate: new Date(Date.now() + 7 * 86400000).toISOString(), storeId: 'store-1', notes: '' });
    setFormItems([]);
    setShowForm(true);
  };

  const addFormItem = () => {
    setFormItems(prev => [...prev, { productId: '', productName: '', orderedQty: 1, receivedQty: 0, unitCost: 0, total: 0 }]);
  };

  const updateFormItem = (idx: number, field: keyof PurchaseOrderItem, value: string | number) => {
    setFormItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field === 'productId') {
        const p = products.find(p => p.id === value);
        updated.productName = p?.name || '';
        updated.unitCost = p?.cost || 0;
      }
      updated.total = (updated.orderedQty || 0) * (updated.unitCost || 0);
      return updated;
    }));
  };

  const removeFormItem = (idx: number) => {
    setFormItems(prev => prev.filter((_, i) => i !== idx));
  };

  const saveOrder = () => {
    if (!editOrder.supplierId || formItems.length === 0) {
      toast({ title: 'Select a supplier and add at least one item', variant: 'destructive' });
      return;
    }
    const supplier = suppliers.find(s => s.id === editOrder.supplierId);
    const isNew = !editOrder.id;
    const subtotal = formItems.reduce((sum, i) => sum + i.total, 0);
    const po: PurchaseOrder = {
      id: editOrder.id || `po-${Math.random().toString(36).slice(2)}`,
      poNumber: editOrder.poNumber || `PO-${String(orders.length + 1).padStart(5, '0')}`,
      supplierId: editOrder.supplierId!,
      supplierName: supplier?.name || '',
      status: editOrder.status as PurchaseOrder['status'] ?? 'draft',
      date: editOrder.date || new Date().toISOString(),
      expectedDate: editOrder.expectedDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      receivedDate: editOrder.receivedDate,
      items: formItems,
      subtotal,
      total: subtotal,
      notes: editOrder.notes || '',
      storeId: editOrder.storeId || 'store-1',
    };
    const updated = isNew ? [po, ...orders] : orders.map(o => o.id === po.id ? po : o);
    setOrders(updated);
    setData('purchaseOrders', updated);
    setShowForm(false);
    toast({ title: isNew ? 'Purchase order created' : 'Purchase order updated' });
  };

  const receiveOrder = (id: string) => {
    const allProducts = getData<Product[]>('products');
    const updated = orders.map(o => {
      if (o.id !== id) return o;
      o.items.forEach(item => {
        const idx = allProducts.findIndex(p => p.id === item.productId);
        if (idx !== -1) allProducts[idx].stock += item.orderedQty;
      });
      return { ...o, status: 'received' as const, receivedDate: new Date().toISOString(), items: o.items.map(i => ({ ...i, receivedQty: i.orderedQty })) };
    });
    setOrders(updated);
    setData('purchaseOrders', updated);
    setData('products', allProducts);
    toast({ title: 'Order marked as received — stock updated' });
  };

  const del = (id: string) => {
    const updated = orders.filter(o => o.id !== id);
    setOrders(updated);
    setData('purchaseOrders', updated);
    toast({ title: 'Purchase order deleted' });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground text-sm">Create and manage purchase orders from your suppliers</p>
        </div>
        <Button className="gap-2" onClick={openNew}><Plus className="h-4 w-4" />New Order</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['draft', 'ordered', 'received', 'cancelled'].map(s => {
          const count = orders.filter(o => o.status === s).length;
          const total = orders.filter(o => o.status === s).reduce((sum, o) => sum + o.total, 0);
          return (
            <Card key={s} className="cursor-pointer" onClick={() => setStatusFilter(s === statusFilter ? 'all' : s)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  {statusIcons[s]}
                  <span className="text-sm font-medium capitalize">{s}</span>
                </div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{formatCFA(total)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by PO number or supplier..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="ordered">Ordered</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">PO Number</th>
                <th className="text-left p-3 font-medium">Supplier</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Expected</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Total</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-mono font-medium">{o.poNumber}</td>
                    <td className="p-3">{o.supplierName}</td>
                    <td className="p-3 text-muted-foreground">{new Date(o.date).toLocaleDateString('fr-FR')}</td>
                    <td className="p-3 text-muted-foreground">{new Date(o.expectedDate).toLocaleDateString('fr-FR')}</td>
                    <td className="p-3">
                      <Badge variant={statusColors[o.status] as any} className="gap-1 capitalize">
                        {statusIcons[o.status]}{o.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-semibold">{formatCFA(o.total)}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewOrder(o)}><Eye className="h-4 w-4" /></Button>
                        {o.status === 'ordered' && (
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => receiveOrder(o.id)}>Receive</Button>
                        )}
                        {o.status === 'draft' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditOrder({ ...o }); setFormItems([...o.items]); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete {o.poNumber}?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => del(o.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground"><ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-40" /><p>No purchase orders found</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Purchase Order — {viewOrder?.poNumber}</DialogTitle></DialogHeader>
          {viewOrder && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-muted-foreground">Supplier</span><p className="font-medium">{viewOrder.supplierName}</p></div>
                <div><span className="text-muted-foreground">Status</span><p><Badge variant={statusColors[viewOrder.status] as any} className="capitalize">{viewOrder.status}</Badge></p></div>
                <div><span className="text-muted-foreground">Order Date</span><p>{new Date(viewOrder.date).toLocaleDateString('fr-FR')}</p></div>
                <div><span className="text-muted-foreground">Expected</span><p>{new Date(viewOrder.expectedDate).toLocaleDateString('fr-FR')}</p></div>
              </div>
              <Separator />
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left pb-2">Item</th><th className="text-right pb-2">Ordered</th><th className="text-right pb-2">Received</th><th className="text-right pb-2">Cost</th><th className="text-right pb-2">Total</th></tr></thead>
                <tbody>
                  {viewOrder.items.map((item, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2">{item.productName}</td>
                      <td className="py-2 text-right">{item.orderedQty}</td>
                      <td className="py-2 text-right">{item.receivedQty}</td>
                      <td className="py-2 text-right">{formatCFA(item.unitCost)}</td>
                      <td className="py-2 text-right font-medium">{formatCFA(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>{formatCFA(viewOrder.total)}</span></div>
              {viewOrder.notes && <p className="text-muted-foreground italic">{viewOrder.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editOrder.id ? 'Edit Purchase Order' : 'New Purchase Order'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Supplier *</Label>
                <Select value={editOrder.supplierId} onValueChange={v => setEditOrder({ ...editOrder, supplierId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>{suppliers.filter(s => s.active).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editOrder.status} onValueChange={v => setEditOrder({ ...editOrder, status: v as PurchaseOrder['status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="ordered">Ordered</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Order Date</Label>
                <Input type="date" value={editOrder.date?.slice(0, 10)} onChange={e => setEditOrder({ ...editOrder, date: new Date(e.target.value).toISOString() })} />
              </div>
              <div>
                <Label>Expected Delivery</Label>
                <Input type="date" value={editOrder.expectedDate?.slice(0, 10)} onChange={e => setEditOrder({ ...editOrder, expectedDate: new Date(e.target.value).toISOString() })} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Items</Label>
                <Button variant="outline" size="sm" className="gap-1" onClick={addFormItem}><Plus className="h-3 w-3" />Add Item</Button>
              </div>
              {formItems.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground text-sm">Add items to this order</div>
              ) : (
                <div className="space-y-2">
                  {formItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4">
                        <Label className="text-xs">Product</Label>
                        <Select value={item.productId} onValueChange={v => updateFormItem(idx, 'productId', v)}>
                          <SelectTrigger className="text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Qty</Label>
                        <Input type="number" min="1" value={item.orderedQty} onChange={e => updateFormItem(idx, 'orderedQty', parseInt(e.target.value) || 1)} />
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs">Unit Cost (FCFA)</Label>
                        <Input type="number" min="0" value={item.unitCost} onChange={e => updateFormItem(idx, 'unitCost', parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Total</Label>
                        <div className="h-10 flex items-center text-sm font-medium">{formatCFA(item.total)}</div>
                      </div>
                      <div className="col-span-1">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive" onClick={() => removeFormItem(idx)}><X className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end font-semibold text-sm border-t pt-2">
                    Total: {formatCFA(formItems.reduce((s, i) => s + i.total, 0))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea rows={2} value={editOrder.notes} onChange={e => setEditOrder({ ...editOrder, notes: e.target.value })} />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={saveOrder}>Save Order</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

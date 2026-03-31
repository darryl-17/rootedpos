import { useState, useMemo } from 'react';
import { Search, Receipt, RefreshCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getData, setData } from '@/lib/mock-data';
import { Sale } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function SalesHistoryPage() {
  const { toast } = useToast();
  const [sales, setSales] = useState(() => getData<Sale[]>('sales'));
  const [search, setSearch] = useState('');
  const [payFilter, setPayFilter] = useState('all');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [refundSale, setRefundSale] = useState<Sale | null>(null);

  const filtered = sales.filter(s => {
    const ms = s.receiptNumber.toLowerCase().includes(search.toLowerCase()) || s.cashier.toLowerCase().includes(search.toLowerCase());
    const mp = payFilter === 'all' || s.paymentMethod === payFilter;
    return ms && mp;
  });

  const processRefund = () => {
    if (!refundSale) return;
    const updated = sales.map(s => s.id === refundSale.id ? { ...s, refunded: true } : s);
    setSales(updated);
    setData('sales', updated);
    setRefundSale(null);
    setSelectedSale(null);
    toast({ title: 'Refund processed', description: `Receipt ${refundSale.receiptNumber} has been refunded.` });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Sales History</h1>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search receipts..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={payFilter} onValueChange={setPayFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Payment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="mobile">Mobile</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Receipt className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p>No sales found</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Receipt #</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Cashier</th>
                <th className="text-left p-3 font-medium">Customer</th>
                <th className="text-right p-3 font-medium">Items</th>
                <th className="text-right p-3 font-medium">Total</th>
                <th className="text-center p-3 font-medium">Payment</th>
                <th className="text-center p-3 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedSale(s)}>
                    <td className="p-3 font-mono text-xs">{s.receiptNumber}</td>
                    <td className="p-3 text-muted-foreground">{new Date(s.date).toLocaleString()}</td>
                    <td className="p-3">{s.cashier}</td>
                    <td className="p-3 text-muted-foreground">{s.customerName || '—'}</td>
                    <td className="p-3 text-right">{s.items.length}</td>
                    <td className="p-3 text-right font-medium">${s.total.toFixed(2)}</td>
                    <td className="p-3 text-center capitalize"><Badge variant="secondary">{s.paymentMethod}</Badge></td>
                    <td className="p-3 text-center">{s.refunded ? <Badge variant="destructive">Refunded</Badge> : <Badge variant="default">Completed</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Receipt Detail */}
      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-sm">
          {selectedSale && (
            <>
              <DialogHeader><DialogTitle>Receipt Detail</DialogTitle></DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="text-center border-b pb-3">
                  <p className="font-bold text-lg">SwiftPOS Store</p>
                  <p className="text-muted-foreground text-xs">{selectedSale.receiptNumber}</p>
                  <p className="text-muted-foreground text-xs">{new Date(selectedSale.date).toLocaleString()}</p>
                </div>
                {selectedSale.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.quantity}x {item.productName}</span>
                    <span>${item.total.toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between"><span>Subtotal</span><span>${selectedSale.subtotal.toFixed(2)}</span></div>
                {selectedSale.discount > 0 && <div className="flex justify-between"><span>Discount</span><span>-${selectedSale.discount.toFixed(2)}</span></div>}
                <div className="flex justify-between"><span>Tax</span><span>${selectedSale.tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-base"><span>Total</span><span>${selectedSale.total.toFixed(2)}</span></div>
                <div className="text-center text-xs text-muted-foreground pt-2">
                  <p>Cashier: {selectedSale.cashier}</p>
                  <p className="capitalize">Payment: {selectedSale.paymentMethod}</p>
                </div>
                {!selectedSale.refunded && (
                  <Button variant="destructive" className="w-full gap-2" onClick={() => setRefundSale(selectedSale)}>
                    <RefreshCcw className="h-4 w-4" />Refund
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Confirmation */}
      <AlertDialog open={!!refundSale} onOpenChange={() => setRefundSale(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process Refund?</AlertDialogTitle>
            <AlertDialogDescription>
              Refund receipt {refundSale?.receiptNumber} for ${refundSale?.total.toFixed(2)}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={processRefund}>Confirm Refund</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

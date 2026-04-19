import { useState } from 'react';
import { Plus, Edit, Trash2, Percent, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getData, setData } from '@/lib/mock-data';
import { Discount } from '@/lib/types';
import { formatCFA } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';

const empty: Partial<Discount> = { name: '', type: 'percent', value: 10, active: true };

export default function DiscountsPage() {
  const { toast } = useToast();
  const [discounts, setDiscounts] = useState(() => getData<Discount[]>('discounts'));
  const [showForm, setShowForm] = useState(false);
  const [editDiscount, setEditDiscount] = useState<Partial<Discount>>(empty);

  const save = () => {
    if (!editDiscount.name || !editDiscount.value) return;
    const isNew = !editDiscount.id;
    const discount: Discount = {
      id: editDiscount.id || `disc-${Math.random().toString(36).slice(2)}`,
      name: editDiscount.name!,
      type: editDiscount.type ?? 'percent',
      value: editDiscount.value!,
      active: editDiscount.active ?? true,
    };
    const updated = isNew ? [...discounts, discount] : discounts.map(d => d.id === discount.id ? discount : d);
    setDiscounts(updated);
    setData('discounts', updated);
    setShowForm(false);
    setEditDiscount(empty);
    toast({ title: isNew ? 'Discount created' : 'Discount updated' });
  };

  const toggleActive = (id: string) => {
    const updated = discounts.map(d => d.id === id ? { ...d, active: !d.active } : d);
    setDiscounts(updated);
    setData('discounts', updated);
  };

  const del = (id: string) => {
    const updated = discounts.filter(d => d.id !== id);
    setDiscounts(updated);
    setData('discounts', updated);
    toast({ title: 'Discount deleted' });
  };

  const formatValue = (d: Discount) =>
    d.type === 'percent' ? `${d.value}%` : formatCFA(d.value);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discounts</h1>
          <p className="text-muted-foreground text-sm">Create named discounts for quick application at POS</p>
        </div>
        <Button className="gap-2" onClick={() => { setEditDiscount(empty); setShowForm(true); }}>
          <Plus className="h-4 w-4" />Add Discount
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {discounts.map(d => (
          <Card key={d.id} className={!d.active ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <Percent className="h-5 w-5 text-orange-600" />
                </div>
                <Switch checked={d.active} onCheckedChange={() => toggleActive(d.id)} />
              </div>
              <p className="font-semibold">{d.name}</p>
              <p className="text-2xl font-bold text-primary mt-1">{formatValue(d)}</p>
              <p className="text-xs text-muted-foreground capitalize">{d.type === 'percent' ? 'Percentage discount' : 'Fixed amount discount'}</p>
              <div className="flex gap-1 mt-3">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditDiscount({ ...d }); setShowForm(true); }}>
                  <Edit className="h-3.5 w-3.5 mr-1" />Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete "{d.name}"?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => del(d.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}

        {discounts.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            <Tag className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No discounts configured</p>
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editDiscount.id ? 'Edit Discount' : 'New Discount'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Discount Name *</Label>
              <Input placeholder="e.g. Staff Discount, Happy Hour" value={editDiscount.name} onChange={e => setEditDiscount({ ...editDiscount, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={editDiscount.type} onValueChange={v => setEditDiscount({ ...editDiscount, type: v as 'fixed' | 'percent' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{editDiscount.type === 'percent' ? 'Percentage' : 'Amount (FCFA)'}</Label>
                <Input type="number" min="0" max={editDiscount.type === 'percent' ? 100 : undefined} step={editDiscount.type === 'percent' ? 1 : 100} value={editDiscount.value} onChange={e => setEditDiscount({ ...editDiscount, value: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editDiscount.active} onCheckedChange={v => setEditDiscount({ ...editDiscount, active: v })} />
              <Label>Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={save}>Save Discount</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

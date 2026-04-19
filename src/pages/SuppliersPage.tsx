import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Building2, Phone, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getData, setData } from '@/lib/mock-data';
import { Supplier } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const empty: Partial<Supplier> = { name: '', email: '', phone: '', address: '', contactPerson: '', notes: '', active: true };

export default function SuppliersPage() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState(() => getData<Supplier[]>('suppliers'));
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Partial<Supplier>>(empty);

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const save = () => {
    if (!editSupplier.name) return;
    const isNew = !editSupplier.id;
    const supplier: Supplier = {
      id: editSupplier.id || `sup-${Math.random().toString(36).slice(2)}`,
      name: editSupplier.name!,
      email: editSupplier.email || '',
      phone: editSupplier.phone || '',
      address: editSupplier.address || '',
      contactPerson: editSupplier.contactPerson || '',
      notes: editSupplier.notes || '',
      active: editSupplier.active ?? true,
    };
    const updated = isNew ? [...suppliers, supplier] : suppliers.map(s => s.id === supplier.id ? supplier : s);
    setSuppliers(updated);
    setData('suppliers', updated);
    setShowForm(false);
    setEditSupplier(empty);
    toast({ title: isNew ? 'Supplier created' : 'Supplier updated' });
  };

  const deleteSup = (id: string) => {
    const updated = suppliers.filter(s => s.id !== id);
    setSuppliers(updated);
    setData('suppliers', updated);
    toast({ title: 'Supplier deleted' });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground text-sm">Manage your supplier database for purchase orders</p>
        </div>
        <Button className="gap-2" onClick={() => { setEditSupplier(empty); setShowForm(true); }}>
          <Plus className="h-4 w-4" />Add Supplier
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => (
          <Card key={s.id} className={!s.active ? 'opacity-60' : ''}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <Badge variant={s.active ? 'default' : 'secondary'} className="text-xs">
                      {s.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditSupplier({ ...s }); setShowForm(true); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Delete "{s.name}"?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteSup(s.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="space-y-1.5 text-sm text-muted-foreground">
                {s.contactPerson && (
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    <span>{s.contactPerson}</span>
                  </div>
                )}
                {s.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{s.phone}</span>
                  </div>
                )}
                {s.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{s.email}</span>
                  </div>
                )}
                {s.notes && (
                  <p className="text-xs italic border-t pt-1.5 mt-1.5">{s.notes}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            <Building2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No suppliers found</p>
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editSupplier.id ? 'Edit Supplier' : 'New Supplier'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Company Name *</Label>
              <Input value={editSupplier.name} onChange={e => setEditSupplier({ ...editSupplier, name: e.target.value })} placeholder="Supplier company name" />
            </div>
            <div>
              <Label>Contact Person</Label>
              <Input value={editSupplier.contactPerson} onChange={e => setEditSupplier({ ...editSupplier, contactPerson: e.target.value })} placeholder="Name of primary contact" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input value={editSupplier.phone} onChange={e => setEditSupplier({ ...editSupplier, phone: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={editSupplier.email} onChange={e => setEditSupplier({ ...editSupplier, email: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input value={editSupplier.address} onChange={e => setEditSupplier({ ...editSupplier, address: e.target.value })} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea rows={2} value={editSupplier.notes} onChange={e => setEditSupplier({ ...editSupplier, notes: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editSupplier.active} onCheckedChange={v => setEditSupplier({ ...editSupplier, active: v })} />
              <Label>Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={save}>Save Supplier</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

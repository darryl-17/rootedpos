import { useState } from 'react';
import { Plus, Edit, Trash2, Store, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getData, setData } from '@/lib/mock-data';
import { Store as StoreType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const emptyStore: Partial<StoreType> = { name: '', address: '', phone: '', manager: '', active: true };

export default function StoresPage() {
  const { toast } = useToast();
  const [stores, setStores] = useState(() => getData<StoreType[]>('stores'));
  const [showForm, setShowForm] = useState(false);
  const [editStore, setEditStore] = useState<Partial<StoreType>>(emptyStore);

  const save = () => {
    if (!editStore.name) return;
    const isNew = !editStore.id;
    const store: StoreType = { ...(emptyStore as StoreType), ...editStore, id: editStore.id || `store-${Math.random().toString(36).slice(2)}` };
    const updated = isNew ? [...stores, store] : stores.map(s => s.id === store.id ? store : s);
    setStores(updated);
    setData('stores', updated);
    setShowForm(false);
    setEditStore(emptyStore);
    toast({ title: isNew ? 'Store added' : 'Store updated' });
  };

  const deleteStore = (id: string) => {
    const updated = stores.filter(s => s.id !== id);
    setStores(updated);
    setData('stores', updated);
    toast({ title: 'Store removed' });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stores</h1>
        <Button className="gap-2" onClick={() => { setEditStore(emptyStore); setShowForm(true); }}><Plus className="h-4 w-4" />Add Store</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map(s => (
          <Card key={s.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Store className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <Badge variant={s.active ? 'default' : 'secondary'} className="text-xs">{s.active ? 'Active' : 'Inactive'}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditStore(s); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteStore(s.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.address}</p>
                <p>📞 {s.phone}</p>
                <p>Manager: {s.manager}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editStore.id ? 'Edit Store' : 'Add Store'}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div><Label>Name *</Label><Input value={editStore.name} onChange={e => setEditStore({ ...editStore, name: e.target.value })} /></div>
            <div><Label>Address</Label><Input value={editStore.address} onChange={e => setEditStore({ ...editStore, address: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={editStore.phone} onChange={e => setEditStore({ ...editStore, phone: e.target.value })} /></div>
            <div><Label>Manager</Label><Input value={editStore.manager} onChange={e => setEditStore({ ...editStore, manager: e.target.value })} /></div>
            <div className="flex items-center gap-2"><Switch checked={editStore.active} onCheckedChange={v => setEditStore({ ...editStore, active: v })} /><Label>Active</Label></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

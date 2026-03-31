import { useState } from 'react';
import { Search, Plus, Edit, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getData, setData } from '@/lib/mock-data';
import { Customer, Sale } from '@/lib/types';
import { formatCFA } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';

const emptyCustomer: Partial<Customer> = { firstName: '', lastName: '', email: '', phone: '', address: '', birthday: '', notes: '', loyaltyPoints: 0, totalVisits: 0, totalSpent: 0, lastVisit: '' };

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState(() => getData<Customer[]>('customers'));
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Partial<Customer>>(emptyCustomer);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const sales = getData<Sale[]>('sales');

  const filtered = customers.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const save = () => {
    if (!editCustomer.firstName || !editCustomer.lastName) return;
    const isNew = !editCustomer.id;
    const customer: Customer = { ...(emptyCustomer as Customer), ...editCustomer, id: editCustomer.id || `cust-${Math.random().toString(36).slice(2)}` };
    const updated = isNew ? [...customers, customer] : customers.map(c => c.id === customer.id ? customer : c);
    setCustomers(updated);
    setData('customers', updated);
    setShowForm(false);
    setEditCustomer(emptyCustomer);
    toast({ title: isNew ? 'Customer added' : 'Customer updated' });
  };

  const customerSales = selectedCustomer ? sales.filter(s => s.customerId === selectedCustomer.id) : [];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button className="gap-2" onClick={() => { setEditCustomer(emptyCustomer); setShowForm(true); }}><Plus className="h-4 w-4" />Add Customer</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p>No customers found</p>
          <Button variant="outline" className="mt-2" onClick={() => { setEditCustomer(emptyCustomer); setShowForm(true); }}>Add your first customer</Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Phone</th>
                <th className="text-right p-3 font-medium">Visits</th>
                <th className="text-right p-3 font-medium">Total Spent</th>
                <th className="text-right p-3 font-medium">Loyalty Pts</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                    <td className="p-3 font-medium">{c.firstName} {c.lastName}</td>
                    <td className="p-3 text-muted-foreground">{c.email}</td>
                    <td className="p-3 text-muted-foreground">{c.phone}</td>
                    <td className="p-3 text-right">{c.totalVisits}</td>
                    <td className="p-3 text-right">{formatCFA(c.totalSpent)}</td>
                    <td className="p-3 text-right font-medium text-primary">{c.loyaltyPoints}</td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); setEditCustomer(c); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editCustomer.id ? 'Edit Customer' : 'Add Customer'}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>First Name *</Label><Input value={editCustomer.firstName} onChange={e => setEditCustomer({ ...editCustomer, firstName: e.target.value })} /></div>
              <div><Label>Last Name *</Label><Input value={editCustomer.lastName} onChange={e => setEditCustomer({ ...editCustomer, lastName: e.target.value })} /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={editCustomer.email} onChange={e => setEditCustomer({ ...editCustomer, email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={editCustomer.phone} onChange={e => setEditCustomer({ ...editCustomer, phone: e.target.value })} /></div>
            <div><Label>Address</Label><Input value={editCustomer.address} onChange={e => setEditCustomer({ ...editCustomer, address: e.target.value })} /></div>
            <div><Label>Birthday</Label><Input type="date" value={editCustomer.birthday} onChange={e => setEditCustomer({ ...editCustomer, birthday: e.target.value })} /></div>
            <div><Label>Notes</Label><Textarea value={editCustomer.notes} onChange={e => setEditCustomer({ ...editCustomer, notes: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-lg">
          {selectedCustomer && (
            <>
              <DialogHeader><DialogTitle>{selectedCustomer.firstName} {selectedCustomer.lastName}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Email:</span> {selectedCustomer.email}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {selectedCustomer.phone}</div>
                  <div><span className="text-muted-foreground">Loyalty Points:</span> <span className="font-bold text-primary">{selectedCustomer.loyaltyPoints}</span></div>
                  <div><span className="text-muted-foreground">Total Spent:</span> {formatCFA(selectedCustomer.totalSpent)}</div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Purchase History</h3>
                  {customerSales.length === 0 ? <p className="text-sm text-muted-foreground">No purchases yet</p> : (
                    <div className="space-y-2">
                      {customerSales.slice(0, 10).map(s => (
                        <div key={s.id} className="flex justify-between text-sm border rounded-lg p-2">
                          <div>
                            <span className="font-mono text-xs">{s.receiptNumber}</span>
                            <span className="text-muted-foreground ml-2">{new Date(s.date).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <span className="font-medium">{formatCFA(s.total)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button variant="outline" onClick={() => { setSelectedCustomer(null); setEditCustomer(selectedCustomer); setShowForm(true); }}>Edit Customer</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

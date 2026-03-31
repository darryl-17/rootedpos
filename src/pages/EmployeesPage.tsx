import { useState } from 'react';
import { Plus, Edit, Trash2, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getData, setData } from '@/lib/mock-data';
import { Employee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const permissions = {
  owner: ['Dashboard', 'POS', 'Inventory', 'Customers', 'Sales', 'Reports', 'Employees', 'Loyalty', 'Stores', 'Settings'],
  manager: ['Dashboard', 'POS', 'Inventory', 'Customers', 'Sales', 'Reports', 'Employees', 'Loyalty', 'Stores'],
  cashier: ['POS', 'Inventory (view only)'],
};

const emptyEmp: Partial<Employee> = { name: '', email: '', password: '', role: 'cashier', pin: '', active: true, lastLogin: '' };

export default function EmployeesPage() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState(() => getData<Employee[]>('employees'));
  const [showForm, setShowForm] = useState(false);
  const [editEmp, setEditEmp] = useState<Partial<Employee>>(emptyEmp);

  const save = () => {
    if (!editEmp.name || !editEmp.email) return;
    const isNew = !editEmp.id;
    const emp: Employee = { ...(emptyEmp as Employee), ...editEmp, id: editEmp.id || `emp-${Math.random().toString(36).slice(2)}` };
    const updated = isNew ? [...employees, emp] : employees.map(e => e.id === emp.id ? emp : e);
    setEmployees(updated);
    setData('employees', updated);
    setShowForm(false);
    setEditEmp(emptyEmp);
    toast({ title: isNew ? 'Employee added' : 'Employee updated' });
  };

  const deleteEmp = (id: string) => {
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated);
    setData('employees', updated);
    toast({ title: 'Employee removed' });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button className="gap-2" onClick={() => { setEditEmp(emptyEmp); setShowForm(true); }}><Plus className="h-4 w-4" />Add Employee</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-center p-3 font-medium">Role</th>
              <th className="text-center p-3 font-medium">PIN</th>
              <th className="text-center p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Last Login</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {employees.map(e => (
                <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 font-medium">{e.name}</td>
                  <td className="p-3 text-muted-foreground">{e.email}</td>
                  <td className="p-3 text-center capitalize"><Badge variant="secondary">{e.role}</Badge></td>
                  <td className="p-3 text-center font-mono">{e.pin}</td>
                  <td className="p-3 text-center"><Badge variant={e.active ? 'default' : 'secondary'}>{e.active ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="p-3 text-muted-foreground">{e.lastLogin ? new Date(e.lastLogin).toLocaleDateString() : '—'}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditEmp(e); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Remove {e.name}?</AlertDialogTitle><AlertDialogDescription>This will remove the employee.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteEmp(e.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Permissions Overview */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><UserCog className="h-4 w-4" />Role Permissions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(permissions).map(([role, perms]) => (
              <div key={role} className="border rounded-lg p-3">
                <p className="font-medium capitalize mb-2">{role}</p>
                <ul className="space-y-1">
                  {perms.map(p => <li key={p} className="text-xs text-muted-foreground flex items-center gap-1">✓ {p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Employee Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editEmp.id ? 'Edit Employee' : 'Add Employee'}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div><Label>Name *</Label><Input value={editEmp.name} onChange={e => setEditEmp({ ...editEmp, name: e.target.value })} /></div>
            <div><Label>Email *</Label><Input type="email" value={editEmp.email} onChange={e => setEditEmp({ ...editEmp, email: e.target.value })} /></div>
            <div><Label>Password</Label><Input type="password" value={editEmp.password} onChange={e => setEditEmp({ ...editEmp, password: e.target.value })} /></div>
            <div>
              <Label>Role</Label>
              <Select value={editEmp.role} onValueChange={v => setEditEmp({ ...editEmp, role: v as Employee['role'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>4-Digit PIN</Label><Input maxLength={4} value={editEmp.pin} onChange={e => setEditEmp({ ...editEmp, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })} /></div>
            <div className="flex items-center gap-2"><Switch checked={editEmp.active} onCheckedChange={v => setEditEmp({ ...editEmp, active: v })} /><Label>Active</Label></div>
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

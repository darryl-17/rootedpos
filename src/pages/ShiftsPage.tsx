import { useState } from 'react';
import { Clock, DollarSign, TrendingUp, ArrowDownCircle, ArrowUpCircle, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getData, setData } from '@/lib/mock-data';
import { Shift, CashMovement, Employee, Sale } from '@/lib/types';
import { formatCFA } from '@/lib/currency';
import { useAuthStore } from '@/stores/auth-store';
import { useToast } from '@/hooks/use-toast';

export default function ShiftsPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [shifts, setShifts] = useState(() => getData<Shift[]>('shifts'));
  const [movements, setMovements] = useState(() => getData<CashMovement[]>('cashMovements'));
  const [employees] = useState(() => getData<Employee[]>('employees'));

  const [showOpenShift, setShowOpenShift] = useState(false);
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [showCashMovement, setShowCashMovement] = useState(false);
  const [openingCash, setOpeningCash] = useState('');
  const [closingCash, setClosingCash] = useState('');
  const [shiftNote, setShiftNote] = useState('');
  const [movForm, setMovForm] = useState({ type: 'in' as 'in' | 'out', amount: '', reason: '' });
  const [viewShift, setViewShift] = useState<Shift | null>(null);

  const openShift = shifts.find(s => s.status === 'open');
  const closedShifts = shifts.filter(s => s.status === 'closed').sort((a, b) => new Date(b.openTime).getTime() - new Date(a.openTime).getTime());

  const startShift = () => {
    if (openShift) { toast({ title: 'A shift is already open', variant: 'destructive' }); return; }
    const shift: Shift = {
      id: `shift-${Math.random().toString(36).slice(2)}`,
      employeeId: user?.id || 'emp-1',
      employeeName: user?.name || 'Unknown',
      storeId: localStorage.getItem('swiftpos_currentStore') || 'store-1',
      openTime: new Date().toISOString(),
      openingCash: parseFloat(openingCash) || 0,
      cashSales: 0,
      cardSales: 0,
      mobileSales: 0,
      totalSales: 0,
      totalTransactions: 0,
      cashIn: 0,
      cashOut: 0,
      note: shiftNote,
      status: 'open',
    };
    const updated = [shift, ...shifts];
    setShifts(updated);
    setData('shifts', updated);
    setShowOpenShift(false);
    setOpeningCash('');
    setShiftNote('');
    toast({ title: 'Shift opened successfully' });
  };

  const endShift = () => {
    if (!openShift) return;
    const sales = getData<Sale[]>('sales');
    const shiftSales = sales.filter(s => s.shiftId === openShift.id || (new Date(s.date) >= new Date(openShift.openTime)));
    const cashSales = shiftSales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0);
    const cardSales = shiftSales.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.total, 0);
    const mobileSales = shiftSales.filter(s => s.paymentMethod === 'mobile').reduce((sum, s) => sum + s.total, 0);
    const shiftMovements = movements.filter(m => m.shiftId === openShift.id);
    const cashIn = shiftMovements.filter(m => m.type === 'in').reduce((sum, m) => sum + m.amount, 0);
    const cashOut = shiftMovements.filter(m => m.type === 'out').reduce((sum, m) => sum + m.amount, 0);
    const expectedCash = openShift.openingCash + cashSales + cashIn - cashOut;

    const updated = shifts.map(s => s.id === openShift.id ? {
      ...s,
      closeTime: new Date().toISOString(),
      closingCash: parseFloat(closingCash) || 0,
      expectedCash,
      cashSales,
      cardSales,
      mobileSales,
      totalSales: cashSales + cardSales + mobileSales,
      totalTransactions: shiftSales.length,
      cashIn,
      cashOut,
      note: shiftNote || s.note,
      status: 'closed' as const,
    } : s);
    setShifts(updated);
    setData('shifts', updated);
    setShowCloseShift(false);
    setClosingCash('');
    setShiftNote('');
    toast({ title: 'Shift closed successfully' });
  };

  const addCashMovement = () => {
    if (!openShift || !movForm.amount || !movForm.reason) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    const amount = parseFloat(movForm.amount);
    const movement: CashMovement = {
      id: `cm-${Math.random().toString(36).slice(2)}`,
      shiftId: openShift.id,
      date: new Date().toISOString(),
      type: movForm.type,
      amount,
      reason: movForm.reason,
      employee: user?.name || '',
    };
    const updated = [movement, ...movements];
    setMovements(updated);
    setData('cashMovements', updated);

    const shiftsUpdated = shifts.map(s => s.id === openShift.id ? {
      ...s,
      cashIn: s.cashIn + (movForm.type === 'in' ? amount : 0),
      cashOut: s.cashOut + (movForm.type === 'out' ? amount : 0),
    } : s);
    setShifts(shiftsUpdated);
    setData('shifts', shiftsUpdated);

    setShowCashMovement(false);
    setMovForm({ type: 'in', amount: '', reason: '' });
    toast({ title: `Cash ${movForm.type === 'in' ? 'in' : 'out'} recorded` });
  };

  const formatDuration = (openTime: string, closeTime?: string) => {
    const start = new Date(openTime).getTime();
    const end = closeTime ? new Date(closeTime).getTime() : Date.now();
    const hours = Math.floor((end - start) / 3600000);
    const mins = Math.floor(((end - start) % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shifts & Cash Management</h1>
          <p className="text-muted-foreground text-sm">Track cash drawer, sales per shift, and cash movements</p>
        </div>
        {!openShift ? (
          <Button className="gap-2" onClick={() => setShowOpenShift(true)}><Clock className="h-4 w-4" />Open Shift</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setShowCashMovement(true)}><DollarSign className="h-4 w-4" />Cash Movement</Button>
            <Button variant="destructive" className="gap-2" onClick={() => setShowCloseShift(true)}><CheckCircle className="h-4 w-4" />Close Shift</Button>
          </div>
        )}
      </div>

      {/* Current Open Shift */}
      {openShift && (
        <Card className="border-primary border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" />Current Shift</CardTitle>
              <Badge className="gap-1"><span className="h-2 w-2 rounded-full bg-green-400 animate-pulse inline-block" />Open</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Cashier</p>
                <p className="font-semibold">{openShift.employeeName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Started</p>
                <p className="font-semibold">{new Date(openShift.openTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{formatDuration(openShift.openTime)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Opening Cash</p>
                <p className="font-semibold">{formatCFA(openShift.openingCash)}</p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                <p className="text-xs text-muted-foreground">Cash In</p>
                <p className="font-bold text-green-600">+{formatCFA(openShift.cashIn)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
                <p className="text-xs text-muted-foreground">Cash Out</p>
                <p className="font-bold text-red-600">-{formatCFA(openShift.cashOut)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                <p className="text-xs text-muted-foreground">Expected Cash</p>
                <p className="font-bold text-blue-600">{formatCFA(openShift.openingCash + openShift.cashIn - openShift.cashOut)}</p>
              </div>
            </div>

            {/* Recent cash movements for open shift */}
            {movements.filter(m => m.shiftId === openShift.id).length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Cash Movements</p>
                <div className="space-y-1">
                  {movements.filter(m => m.shiftId === openShift.id).map(m => (
                    <div key={m.id} className="flex items-center justify-between text-sm p-2 rounded border">
                      <div className="flex items-center gap-2">
                        {m.type === 'in' ? <ArrowDownCircle className="h-4 w-4 text-green-500" /> : <ArrowUpCircle className="h-4 w-4 text-red-500" />}
                        <span>{m.reason}</span>
                      </div>
                      <span className={m.type === 'in' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {m.type === 'in' ? '+' : '-'}{formatCFA(m.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Closed Shifts History */}
      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Shift History</TabsTrigger>
          <TabsTrigger value="movements">All Cash Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-3">
          {closedShifts.map(s => {
            const diff = (s.closingCash || 0) - (s.expectedCash || 0);
            return (
              <Card key={s.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setViewShift(s)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{s.employeeName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.openTime).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })} — {s.closeTime && new Date(s.closeTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        {' '}({formatDuration(s.openTime, s.closeTime)})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCFA(s.totalSales)}</p>
                      <p className="text-xs text-muted-foreground">{s.totalTransactions} transactions</p>
                    </div>
                    <div className="text-right hidden md:block">
                      {diff !== 0 && (
                        <div className={`flex items-center gap-1 text-sm ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {diff > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                          {diff > 0 ? '+' : ''}{formatCFA(diff)} variance
                        </div>
                      )}
                      {diff === 0 && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" />Balanced</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {closedShifts.length === 0 && (
            <div className="py-10 text-center text-muted-foreground">No closed shifts yet</div>
          )}
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Reason</th>
                  <th className="text-right p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Employee</th>
                </tr></thead>
                <tbody>
                  {movements.map(m => (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="p-3 text-muted-foreground">{new Date(m.date).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td className="p-3">
                        <Badge variant={m.type === 'in' ? 'default' : 'secondary'} className="gap-1">
                          {m.type === 'in' ? <ArrowDownCircle className="h-3 w-3" /> : <ArrowUpCircle className="h-3 w-3" />}
                          {m.type === 'in' ? 'Cash In' : 'Cash Out'}
                        </Badge>
                      </td>
                      <td className="p-3">{m.reason}</td>
                      <td className={`p-3 text-right font-medium ${m.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                        {m.type === 'in' ? '+' : '-'}{formatCFA(m.amount)}
                      </td>
                      <td className="p-3 text-muted-foreground">{m.employee}</td>
                    </tr>
                  ))}
                  {movements.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No cash movements recorded</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Open Shift Dialog */}
      <Dialog open={showOpenShift} onOpenChange={setShowOpenShift}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Open New Shift</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Opening Cash (FCFA)</Label>
              <Input type="number" min="0" step="500" placeholder="Count the cash in drawer" value={openingCash} onChange={e => setOpeningCash(e.target.value)} autoFocus />
            </div>
            <div>
              <Label>Note (optional)</Label>
              <Textarea rows={2} value={shiftNote} onChange={e => setShiftNote(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowOpenShift(false)}>Cancel</Button>
              <Button onClick={startShift}>Open Shift</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Shift Dialog */}
      <Dialog open={showCloseShift} onOpenChange={setShowCloseShift}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Close Shift</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Closing Cash (FCFA)</Label>
              <Input type="number" min="0" step="500" placeholder="Count the cash in drawer" value={closingCash} onChange={e => setClosingCash(e.target.value)} autoFocus />
            </div>
            <div>
              <Label>Note (optional)</Label>
              <Textarea rows={2} value={shiftNote} onChange={e => setShiftNote(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCloseShift(false)}>Cancel</Button>
              <Button variant="destructive" onClick={endShift}>Close Shift</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cash Movement Dialog */}
      <Dialog open={showCashMovement} onOpenChange={setShowCashMovement}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Cash Movement</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select value={movForm.type} onValueChange={v => setMovForm({ ...movForm, type: v as 'in' | 'out' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Cash In (add money)</SelectItem>
                  <SelectItem value="out">Cash Out (remove money)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (FCFA)</Label>
              <Input type="number" min="0" step="500" value={movForm.amount} onChange={e => setMovForm({ ...movForm, amount: e.target.value })} />
            </div>
            <div>
              <Label>Reason *</Label>
              <Input placeholder="e.g. Petty cash, Float top-up" value={movForm.reason} onChange={e => setMovForm({ ...movForm, reason: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCashMovement(false)}>Cancel</Button>
              <Button onClick={addCashMovement}>Record</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shift Detail Dialog */}
      <Dialog open={!!viewShift} onOpenChange={() => setViewShift(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Shift Summary</DialogTitle></DialogHeader>
          {viewShift && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Cashier</span><p className="font-medium">{viewShift.employeeName}</p></div>
                <div><span className="text-muted-foreground">Duration</span><p className="font-medium">{formatDuration(viewShift.openTime, viewShift.closeTime)}</p></div>
                <div><span className="text-muted-foreground">Opened</span><p>{new Date(viewShift.openTime).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</p></div>
                <div><span className="text-muted-foreground">Closed</span><p>{viewShift.closeTime && new Date(viewShift.closeTime).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</p></div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Opening Cash</span><span>{formatCFA(viewShift.openingCash)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Cash Sales</span><span className="text-green-600">+{formatCFA(viewShift.cashSales)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Card Sales</span><span>{formatCFA(viewShift.cardSales)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Mobile Sales</span><span>{formatCFA(viewShift.mobileSales)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Cash In</span><span className="text-green-600">+{formatCFA(viewShift.cashIn)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Cash Out</span><span className="text-red-600">-{formatCFA(viewShift.cashOut)}</span></div>
                <Separator />
                <div className="flex justify-between font-medium"><span>Expected Cash</span><span>{formatCFA(viewShift.expectedCash || 0)}</span></div>
                <div className="flex justify-between font-medium"><span>Actual Cash</span><span>{formatCFA(viewShift.closingCash || 0)}</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total Sales</span>
                  <span>{formatCFA(viewShift.totalSales)}</span>
                </div>
              </div>
              {viewShift.note && <p className="text-muted-foreground italic text-xs">{viewShift.note}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

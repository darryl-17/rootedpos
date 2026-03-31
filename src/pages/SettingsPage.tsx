import { useState } from 'react';
import { Settings, Building2, CreditCard, Link2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getData, setData } from '@/lib/mock-data';
import { BusinessSettings, TaxRate } from '@/lib/types';
import { formatCFA } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(() => getData<BusinessSettings>('businessSettings'));
  const [taxRates, setTaxRates] = useState(() => getData<TaxRate[]>('taxRates'));
  const [newTax, setNewTax] = useState({ name: '', rate: 0 });

  const saveSettings = (updated: BusinessSettings) => {
    setSettings(updated);
    setData('businessSettings', updated);
    toast({ title: 'Settings saved' });
  };

  const addTax = () => {
    if (!newTax.name) return;
    const tax: TaxRate = { id: `tax-${Math.random().toString(36).slice(2)}`, ...newTax };
    const updated = [...taxRates, tax];
    setTaxRates(updated);
    setData('taxRates', updated);
    setNewTax({ name: '', rate: 0 });
    toast({ title: 'Tax rate added' });
  };

  const deleteTax = (id: string) => {
    const updated = taxRates.filter(t => t.id !== id);
    setTaxRates(updated);
    setData('taxRates', updated);
    toast({ title: 'Tax rate removed' });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="h-6 w-6" />Settings</h1>

      <Tabs defaultValue="business">
        <TabsList className="flex-wrap">
          <TabsTrigger value="business">Business Profile</TabsTrigger>
          <TabsTrigger value="tax">Tax Settings</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="pos">POS Preferences</TabsTrigger>
          <TabsTrigger value="receipt">Receipt</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" />Business Profile</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Business Name</Label><Input value={settings.name} onChange={e => saveSettings({ ...settings, name: e.target.value })} /></div>
                <div><Label>Email</Label><Input value={settings.email} onChange={e => saveSettings({ ...settings, email: e.target.value })} /></div>
              </div>
              <div><Label>Address</Label><Input value={settings.address} onChange={e => saveSettings({ ...settings, address: e.target.value })} /></div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div><Label>Phone</Label><Input value={settings.phone} onChange={e => saveSettings({ ...settings, phone: e.target.value })} /></div>
                <div>
                  <Label>Currency</Label>
                  <Input value={settings.currency} onChange={e => saveSettings({ ...settings, currency: e.target.value })} disabled />
                  <p className="text-xs text-muted-foreground mt-1">Franc CFA (XOF)</p>
                </div>
                <div><Label>Timezone</Label><Input value={settings.timezone} onChange={e => saveSettings({ ...settings, timezone: e.target.value })} /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax">
          <Card>
            <CardContent className="p-4 space-y-4">
              {taxRates.map(t => (
                <div key={t.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div><p className="font-medium">{t.name}</p><p className="text-sm text-muted-foreground">{t.rate}%</p></div>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteTax(t.id)}>Remove</Button>
                </div>
              ))}
              <Separator />
              <div className="flex gap-2 items-end">
                <div className="flex-1"><Label>Name</Label><Input value={newTax.name} onChange={e => setNewTax({ ...newTax, name: e.target.value })} /></div>
                <div className="w-24"><Label>Rate %</Label><Input type="number" value={newTax.rate} onChange={e => setNewTax({ ...newTax, rate: parseFloat(e.target.value) || 0 })} /></div>
                <Button onClick={addTax}>Add</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardContent className="p-4 space-y-4">
              {(['cash', 'card', 'mobile'] as const).map(m => (
                <div key={m} className="flex items-center justify-between">
                  <span className="capitalize font-medium">{m === 'mobile' ? 'Mobile Money' : m}</span>
                  <Switch checked={settings.paymentMethods[m]} onCheckedChange={v => saveSettings({ ...settings, paymentMethods: { ...settings.paymentMethods, [m]: v } })} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pos">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="font-medium">Show Product Images</p><p className="text-sm text-muted-foreground">Display product images in the POS grid</p></div>
                <Switch checked={settings.showProductImages} onCheckedChange={v => saveSettings({ ...settings, showProductImages: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="font-medium">Require Customer</p><p className="text-sm text-muted-foreground">Require customer selection before checkout</p></div>
                <Switch checked={settings.requireCustomer} onCheckedChange={v => saveSettings({ ...settings, requireCustomer: v })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipt">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Receipt Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Header Text</Label><Input value={settings.receiptHeader} onChange={e => saveSettings({ ...settings, receiptHeader: e.target.value })} /></div>
                <div><Label>Footer Text</Label><Input value={settings.receiptFooter} onChange={e => saveSettings({ ...settings, receiptFooter: e.target.value })} /></div>
                <div><Label>Tax Number</Label><Input value={settings.taxNumber} onChange={e => saveSettings({ ...settings, taxNumber: e.target.value })} /></div>
                <div>
                  <Label>Receipt Width</Label>
                  <Select value={settings.receiptWidth} onValueChange={v => saveSettings({ ...settings, receiptWidth: v as '58mm' | '80mm' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="58mm">58mm</SelectItem>
                      <SelectItem value="80mm">80mm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><Label>Show Tax Number</Label><Switch checked={settings.showTaxNumber} onCheckedChange={v => saveSettings({ ...settings, showTaxNumber: v })} /></div>
                  <div className="flex items-center justify-between"><Label>Show Cashier Name</Label><Switch checked={settings.showCashierName} onCheckedChange={v => saveSettings({ ...settings, showCashierName: v })} /></div>
                  <div className="flex items-center justify-between"><Label>Show Customer Name</Label><Switch checked={settings.showCustomerName} onCheckedChange={v => saveSettings({ ...settings, showCustomerName: v })} /></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Receipt Preview</CardTitle></CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-card font-mono text-xs space-y-2 max-w-[280px] mx-auto">
                  <p className="text-center font-bold text-sm">{settings.receiptHeader}</p>
                  {settings.showTaxNumber && <p className="text-center text-muted-foreground">{settings.taxNumber}</p>}
                  <Separator />
                  <p>1x Espresso Coffee    {formatCFA(1500)}</p>
                  <p>2x Croissant          {formatCFA(2400)}</p>
                  <Separator />
                  <p>Subtotal:             {formatCFA(3900)}</p>
                  <p>Tax:                  {formatCFA(750)}</p>
                  <p className="font-bold">Total:               {formatCFA(4650)}</p>
                  <Separator />
                  <p>Payment: Cash</p>
                  {settings.showCashierName && <p>Cashier: Alice Johnson</p>}
                  {settings.showCustomerName && <p>Customer: Emma Wilson</p>}
                  <p className="text-center mt-2">{settings.receiptFooter}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { name: 'Stripe', desc: 'Card payment processing', connected: false },
              { name: 'M-Pesa', desc: 'Mobile money payments', connected: false },
              { name: 'Moov Africa', desc: 'Mobile payments', connected: false },
            ].map(i => (
              <Card key={i.name}>
                <CardContent className="p-4 text-center space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto"><Link2 className="h-6 w-6 text-muted-foreground" /></div>
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">{i.desc}</p>
                  <Badge variant={i.connected ? 'default' : 'secondary'}>{i.connected ? 'Connected' : 'Disconnected'}</Badge>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => toast({ title: `${i.name} integration coming soon` })}>Connect</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="font-medium">Export Sales Data</p><p className="text-sm text-muted-foreground">Download all sales as CSV</p></div>
                <Button variant="outline" className="gap-2" onClick={() => toast({ title: 'Sales CSV exported (mock)' })}><Download className="h-4 w-4" />Export</Button>
              </div>
              <div className="flex items-center justify-between">
                <div><p className="font-medium">Export Products</p><p className="text-sm text-muted-foreground">Download product catalog as CSV</p></div>
                <Button variant="outline" className="gap-2" onClick={() => toast({ title: 'Products CSV exported (mock)' })}><Download className="h-4 w-4" />Export</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

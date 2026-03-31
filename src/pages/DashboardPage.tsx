import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Package, Users, AlertTriangle, Receipt, TrendingUp, ShoppingCart, Plus, BarChart3, Boxes } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getData } from '@/lib/mock-data';
import { Sale, Product, Customer } from '@/lib/types';
import { useAuthStore } from '@/stores/auth-store';
import { formatCFA } from '@/lib/currency';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const sales = useMemo(() => getData<Sale[]>('sales'), []);
  const products = useMemo(() => getData<Product[]>('products'), []);
  const customers = useMemo(() => getData<Customer[]>('customers'), []);

  const today = new Date().toDateString();
  const todaySales = sales.filter(s => new Date(s.date).toDateString() === today);
  const todayRevenue = todaySales.reduce((s, sale) => s + sale.total, 0);

  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const monthRevenue = sales.filter(s => new Date(s.date) >= monthStart).reduce((s, sale) => s + sale.total, 0);

  const lowStock = products.filter(p => p.trackInventory && p.stock <= p.lowStockThreshold);

  const chartData = useMemo(() => {
    const days: { date: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toDateString();
      const dayTotal = sales.filter(s => new Date(s.date).toDateString() === key).reduce((sum, s) => sum + s.total, 0);
      days.push({ date: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }), total: Math.round(dayTotal) });
    }
    return days;
  }, [sales]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    sales.forEach(s => s.items.forEach(i => {
      const cur = map.get(i.productId) || { name: i.productName, qty: 0, revenue: 0 };
      cur.qty += i.quantity;
      cur.revenue += i.total;
      map.set(i.productId, cur);
    }));
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [sales]);

  const kpis = [
    { label: 'Sales Today', value: formatCFA(todayRevenue), icon: DollarSign, color: 'text-primary' },
    { label: 'Monthly Revenue', value: formatCFA(monthRevenue), icon: TrendingUp, color: 'text-success' },
    { label: 'Active Products', value: products.filter(p => p.active).length, icon: Package, color: 'text-chart-4' },
    { label: 'Low Stock Alerts', value: lowStock.length, icon: AlertTriangle, color: 'text-warning' },
    { label: 'Customers', value: customers.length, icon: Users, color: 'text-chart-1' },
    { label: 'Open Receipts', value: todaySales.length, icon: Receipt, color: 'text-muted-foreground' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground text-sm">Here's what's happening with your business today.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map(k => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">{k.label}</span>
                <k.icon className={`h-4 w-4 ${k.color}`} />
              </div>
              <p className="text-lg font-bold">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => navigate('/pos')} className="gap-2"><ShoppingCart className="h-4 w-4" />New Sale</Button>
        <Button variant="secondary" onClick={() => navigate('/inventory')} className="gap-2"><Plus className="h-4 w-4" />Add Product</Button>
        <Button variant="secondary" onClick={() => navigate('/reports')} className="gap-2"><BarChart3 className="h-4 w-4" />View Reports</Button>
        <Button variant="secondary" onClick={() => navigate('/inventory')} className="gap-2"><Boxes className="h-4 w-4" />Manage Inventory</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Sales — Last 7 Days</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} formatter={(value: number) => [formatCFA(value), 'Total']} />
                <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top Selling Products</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.qty} sold</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">{formatCFA(p.revenue)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">Receipt #</th>
                  <th className="text-left py-2 font-medium">Cashier</th>
                  <th className="text-left py-2 font-medium">Items</th>
                  <th className="text-right py-2 font-medium">Total</th>
                  <th className="text-left py-2 font-medium">Payment</th>
                  <th className="text-right py-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 10).map(s => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs">{s.receiptNumber}</td>
                    <td className="py-2">{s.cashier}</td>
                    <td className="py-2">{s.items.length}</td>
                    <td className="py-2 text-right font-medium">{formatCFA(s.total)}</td>
                    <td className="py-2 capitalize">{s.paymentMethod}</td>
                    <td className="py-2 text-right text-muted-foreground">{new Date(s.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

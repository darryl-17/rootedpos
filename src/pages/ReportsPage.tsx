import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getData } from '@/lib/mock-data';
import { Sale, Product, Category, Employee } from '@/lib/types';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['hsl(173, 77%, 26%)', 'hsl(152, 69%, 31%)', 'hsl(38, 92%, 50%)', 'hsl(262, 52%, 47%)', 'hsl(0, 72%, 51%)'];

export default function ReportsPage() {
  const sales = useMemo(() => getData<Sale[]>('sales'), []);
  const products = useMemo(() => getData<Product[]>('products'), []);
  const categories = useMemo(() => getData<Category[]>('categories'), []);
  const employees = useMemo(() => getData<Employee[]>('employees'), []);

  const totalSales = sales.reduce((s, sale) => s + sale.total, 0);
  const refundedSales = sales.filter(s => s.refunded);
  const totalRefunds = refundedSales.reduce((s, sale) => s + sale.total, 0);
  const netSales = totalSales - totalRefunds;
  const avgTransaction = sales.length ? totalSales / sales.length : 0;

  // Daily sales for bar chart
  const dailySales = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      map.set(key, 0);
    }
    sales.forEach(s => {
      const key = new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (map.has(key)) map.set(key, (map.get(key) || 0) + s.total);
    });
    return [...map.entries()].map(([date, total]) => ({ date, total: Math.round(total * 100) / 100 }));
  }, [sales]);

  // Sales by item
  const itemSales = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    sales.forEach(s => s.items.forEach(i => {
      const cur = map.get(i.productId) || { name: i.productName, qty: 0, revenue: 0 };
      cur.qty += i.quantity; cur.revenue += i.total;
      map.set(i.productId, cur);
    }));
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }, [sales]);

  // Sales by category
  const categorySales = useMemo(() => {
    const map = new Map<string, number>();
    sales.forEach(s => s.items.forEach(i => {
      const p = products.find(pr => pr.id === i.productId);
      const catId = p?.category || 'unknown';
      map.set(catId, (map.get(catId) || 0) + i.total);
    }));
    return [...map.entries()].map(([catId, value]) => ({
      name: categories.find(c => c.id === catId)?.name || 'Other',
      value: Math.round(value * 100) / 100,
    }));
  }, [sales, products, categories]);

  // Sales by employee
  const employeeSales = useMemo(() => {
    const map = new Map<string, { name: string; count: number; total: number }>();
    sales.forEach(s => {
      const cur = map.get(s.cashierId) || { name: s.cashier, count: 0, total: 0 };
      cur.count++; cur.total += s.total;
      map.set(s.cashierId, cur);
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [sales]);

  // Payment methods
  const paymentData = useMemo(() => {
    const map = new Map<string, number>();
    sales.forEach(s => map.set(s.paymentMethod, (map.get(s.paymentMethod) || 0) + s.total));
    return [...map.entries()].map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: Math.round(value * 100) / 100 }));
  }, [sales]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Reports & Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Sales</p><p className="text-xl font-bold">${totalSales.toFixed(2)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Refunds</p><p className="text-xl font-bold text-destructive">${totalRefunds.toFixed(2)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Net Sales</p><p className="text-xl font-bold text-primary">${netSales.toFixed(2)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Avg Transaction</p><p className="text-xl font-bold">${avgTransaction.toFixed(2)}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="flex-wrap">
          <TabsTrigger value="summary">Sales Summary</TabsTrigger>
          <TabsTrigger value="items">By Item</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="employees">By Employee</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card>
            <CardHeader><CardTitle className="text-base">Sales Over Time</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-right p-3 font-medium">Qty Sold</th>
                  <th className="text-right p-3 font-medium">Revenue</th>
                  <th className="text-right p-3 font-medium">Avg Price</th>
                </tr></thead>
                <tbody>
                  {itemSales.map((item, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3 text-right">{item.qty}</td>
                      <td className="p-3 text-right">${item.revenue.toFixed(2)}</td>
                      <td className="p-3 text-right text-muted-foreground">${(item.revenue / item.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Category Breakdown</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={categorySales} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {categorySales.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-right p-3 font-medium">Revenue</th>
                  </tr></thead>
                  <tbody>
                    {categorySales.map((c, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="p-3 font-medium">{c.name}</td>
                        <td className="p-3 text-right">${c.value.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Cashier</th>
                  <th className="text-right p-3 font-medium">Transactions</th>
                  <th className="text-right p-3 font-medium">Total Sales</th>
                </tr></thead>
                <tbody>
                  {employeeSales.map((e, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="p-3 font-medium">{e.name}</td>
                      <td className="p-3 text-right">{e.count}</td>
                      <td className="p-3 text-right">${e.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader><CardTitle className="text-base">Payment Method Breakdown</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={paymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

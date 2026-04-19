import { useState, useEffect } from 'react';
import { ChefHat, CheckCircle, Clock, Bell, Utensils, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getData, setData } from '@/lib/mock-data';
import { KDSTicket } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const statusConfig = {
  pending: { label: 'Pending', color: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10', badge: 'secondary' as const, headerBg: 'bg-yellow-100 dark:bg-yellow-900/20' },
  preparing: { label: 'Preparing', color: 'border-blue-400 bg-blue-50 dark:bg-blue-900/10', badge: 'default' as const, headerBg: 'bg-blue-100 dark:bg-blue-900/20' },
  ready: { label: 'Ready', color: 'border-green-400 bg-green-50 dark:bg-green-900/10', badge: 'outline' as const, headerBg: 'bg-green-100 dark:bg-green-900/20' },
  served: { label: 'Served', color: 'border-muted bg-muted/20', badge: 'secondary' as const, headerBg: 'bg-muted/50' },
};

export default function KitchenDisplayPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState(() => getData<KDSTicket[]>('kdsTickets'));
  const [filter, setFilter] = useState<'active' | 'all'>('active');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const refresh = () => {
    setTickets(getData<KDSTicket[]>('kdsTickets'));
    setNow(Date.now());
  };

  const updateStatus = (id: string, status: KDSTicket['status']) => {
    const updated = tickets.map(t => t.id === id ? {
      ...t,
      status,
      startedAt: status === 'preparing' && !t.startedAt ? new Date().toISOString() : t.startedAt,
      completedAt: status === 'ready' ? new Date().toISOString() : t.completedAt,
    } : t);
    setTickets(updated);
    setData('kdsTickets', updated);
    toast({ title: `Ticket ${status === 'preparing' ? 'started' : status === 'ready' ? 'ready!' : 'served'}` });
  };

  const toggleItem = (ticketId: string, itemIdx: number) => {
    const updated = tickets.map(t => {
      if (t.id !== ticketId) return t;
      const items = t.items.map((item, i) =>
        i === itemIdx ? { ...item, status: item.status === 'done' ? 'pending' as const : 'done' as const } : item
      );
      return { ...t, items };
    });
    setTickets(updated);
    setData('kdsTickets', updated);
  };

  const getElapsed = (iso: string) => {
    const diff = now - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60}m`;
  };

  const getElapsedMin = (iso: string) => Math.floor((now - new Date(iso).getTime()) / 60000);

  const visible = filter === 'active'
    ? tickets.filter(t => t.status !== 'served')
    : tickets;

  const statusOrder = ['pending', 'preparing', 'ready', 'served'];
  const sorted = [...visible].sort((a, b) => {
    const sa = statusOrder.indexOf(a.status);
    const sb = statusOrder.indexOf(b.status);
    if (sa !== sb) return sa - sb;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const pendingCount = tickets.filter(t => t.status === 'pending').length;
  const preparingCount = tickets.filter(t => t.status === 'preparing').length;
  const readyCount = tickets.filter(t => t.status === 'ready').length;

  return (
    <div className="p-4 space-y-4 animate-fade-in min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <ChefHat className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Kitchen Display</h1>
            <p className="text-xs text-muted-foreground">{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-2 text-sm">
            <Badge variant="secondary" className="gap-1"><Clock className="h-3.5 w-3.5" />{pendingCount} pending</Badge>
            <Badge variant="default" className="gap-1"><Utensils className="h-3.5 w-3.5" />{preparingCount} preparing</Badge>
            {readyCount > 0 && <Badge variant="outline" className="gap-1 border-green-500 text-green-600"><Bell className="h-3.5 w-3.5" />{readyCount} ready</Badge>}
          </div>
          <Select value={filter} onValueChange={v => setFilter(v as 'active' | 'all')}>
            <SelectTrigger className="w-36 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active Orders</SelectItem>
              <SelectItem value="all">All Orders</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Ticket Grid */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <ChefHat className="h-16 w-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">Kitchen is clear!</p>
          <p className="text-sm">No active tickets</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map(ticket => {
            const cfg = statusConfig[ticket.status];
            const elapsed = getElapsedMin(ticket.createdAt);
            const isUrgent = elapsed > 15 && ticket.status !== 'ready' && ticket.status !== 'served';

            return (
              <Card key={ticket.id} className={cn('border-2 transition-all', cfg.color, isUrgent && 'ring-2 ring-red-500')}>
                <CardHeader className={cn('p-3 rounded-t-xl', cfg.headerBg)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{ticket.ticketNumber}</span>
                      {ticket.tableName && (
                        <Badge variant="outline" className="text-xs">{ticket.tableName}</Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">{ticket.orderType}</Badge>
                    </div>
                    <div className="text-right">
                      <div className={cn('text-sm font-bold', isUrgent ? 'text-red-600 animate-pulse' : 'text-muted-foreground')}>
                        {getElapsed(ticket.createdAt)}
                      </div>
                      <Badge variant={cfg.badge} className="text-xs capitalize">{ticket.status}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} — {ticket.cashier}
                  </p>
                  {ticket.note && <p className="text-xs font-medium text-orange-600 mt-1">⚠ {ticket.note}</p>}
                </CardHeader>

                <CardContent className="p-3 space-y-2">
                  {ticket.items.map((item, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors',
                        item.status === 'done'
                          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 opacity-60'
                          : 'bg-background border-border hover:bg-muted/50'
                      )}
                      onClick={() => toggleItem(ticket.id, i)}
                    >
                      <div className={cn('h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5', item.status === 'done' ? 'bg-green-500 border-green-500' : 'border-muted-foreground')}>
                        {item.status === 'done' && <CheckCircle className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-semibold', item.status === 'done' && 'line-through text-muted-foreground')}>
                          {item.quantity}× {item.productName}
                        </p>
                        {item.modifiers.length > 0 && (
                          <p className="text-xs text-muted-foreground">{item.modifiers.join(' · ')}</p>
                        )}
                        {item.note && <p className="text-xs text-orange-500 font-medium">{item.note}</p>}
                      </div>
                    </div>
                  ))}

                  <div className="pt-1 flex gap-1.5">
                    {ticket.status === 'pending' && (
                      <Button size="sm" className="flex-1 text-xs" onClick={() => updateStatus(ticket.id, 'preparing')}>
                        <Utensils className="h-3.5 w-3.5 mr-1" />Start
                      </Button>
                    )}
                    {ticket.status === 'preparing' && (
                      <Button size="sm" className="flex-1 text-xs bg-green-600 hover:bg-green-700" onClick={() => updateStatus(ticket.id, 'ready')}>
                        <Bell className="h-3.5 w-3.5 mr-1" />Ready
                      </Button>
                    )}
                    {ticket.status === 'ready' && (
                      <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => updateStatus(ticket.id, 'served')}>
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />Served
                      </Button>
                    )}
                    {ticket.status === 'served' && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 py-1"><CheckCircle className="h-3.5 w-3.5 text-green-500" />Served {ticket.completedAt ? getElapsed(ticket.completedAt) + ' ago' : ''}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

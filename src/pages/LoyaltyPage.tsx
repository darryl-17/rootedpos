import { useState, useMemo } from 'react';
import { Heart, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getData, setData } from '@/lib/mock-data';
import { Customer, LoyaltyConfig, LoyaltyLog } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function LoyaltyPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState(() => getData<LoyaltyConfig>('loyaltyConfig'));
  const [logs] = useState(() => getData<LoyaltyLog[]>('loyaltyLogs'));
  const customers = useMemo(() => getData<Customer[]>('customers').sort((a, b) => b.loyaltyPoints - a.loyaltyPoints).slice(0, 10), []);

  const saveConfig = (updated: LoyaltyConfig) => {
    setConfig(updated);
    setData('loyaltyConfig', updated);
    toast({ title: 'Loyalty settings saved' });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Heart className="h-6 w-6 text-primary" />Loyalty Program</h1>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Loyalty Program</p>
              <p className="text-sm text-muted-foreground">Reward customers with points for purchases</p>
            </div>
            <Switch checked={config.enabled} onCheckedChange={v => saveConfig({ ...config, enabled: v })} />
          </div>
          {config.enabled && (
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div>
                <Label>Points earned per $1 spent</Label>
                <Input type="number" min="0" step="0.1" value={config.pointsPerDollar} onChange={e => saveConfig({ ...config, pointsPerDollar: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Point redemption value ($)</Label>
                <Input type="number" min="0" step="0.001" value={config.pointRedemptionValue} onChange={e => saveConfig({ ...config, pointRedemptionValue: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4 text-warning" />Loyalty Leaderboard</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {customers.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground w-6">#{i + 1}</span>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {c.firstName.charAt(0)}{c.lastName.charAt(0)}
                  </div>
                  <span className="text-sm font-medium">{c.firstName} {c.lastName}</span>
                </div>
                <Badge variant="secondary">{c.loyaltyPoints} pts</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Loyalty History */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No loyalty activity yet</p>
            ) : (
              <div className="space-y-2">
                {logs.map(l => (
                  <div key={l.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{l.customerName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(l.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      {l.pointsEarned > 0 && <span className="text-success text-xs">+{l.pointsEarned} earned</span>}
                      {l.pointsRedeemed > 0 && <span className="text-destructive text-xs ml-2">-{l.pointsRedeemed} redeemed</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

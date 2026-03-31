import { useEffect, useState } from 'react';
import { Bell, ChevronDown, Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './ThemeToggle';
import { useAuthStore } from '@/stores/auth-store';
import { getData, setData } from '@/lib/mock-data';
import { Store as StoreType } from '@/lib/types';

export function AppHeader() {
  const user = useAuthStore(s => s.user);
  const [time, setTime] = useState(new Date());
  const [stores, setStores] = useState<StoreType[]>([]);
  const [currentStoreId, setCurrentStoreId] = useState('');

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    setStores(getData<StoreType[]>('stores'));
    setCurrentStoreId(localStorage.getItem('swiftpos_currentStore') || 'store-1');
    return () => clearInterval(t);
  }, []);

  const currentStore = stores.find(s => s.id === currentStoreId);

  const switchStore = (id: string) => {
    setCurrentStoreId(id);
    setData('currentStore', id);
  };

  return (
    <header className="h-14 border-b flex items-center justify-between px-4 bg-card">
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 font-medium">
              <Store className="h-4 w-4 text-primary" />
              {currentStore?.name || 'Select Store'}
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {stores.map(s => (
              <DropdownMenuItem key={s.id} onClick={() => switchStore(s.id)}>
                {s.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="text-sm text-muted-foreground hidden md:block">
          {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          {' · '}
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">3</span>
        </Button>
        {user && (
          <Badge variant="secondary" className="ml-1 capitalize">{user.role}</Badge>
        )}
      </div>
    </header>
  );
}

import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Users, Receipt, BarChart3,
  UserCog, Heart, Store, Settings, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'POS', icon: ShoppingCart, path: '/pos' },
  { label: 'Inventory', icon: Package, path: '/inventory' },
  { label: 'Customers', icon: Users, path: '/customers' },
  { label: 'Sales History', icon: Receipt, path: '/sales' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
  { label: 'Employees', icon: UserCog, path: '/employees' },
  { label: 'Loyalty', icon: Heart, path: '/loyalty' },
  { label: 'Stores', icon: Store, path: '/stores' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-60 border-r bg-sidebar flex flex-col h-screen shrink-0">
      <div className="h-14 flex items-center px-5 border-b gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <ShoppingCart className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg text-foreground tracking-tight">SwiftPOS</span>
      </div>

      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map(item => {
          const active = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { logout(); navigate('/'); }}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

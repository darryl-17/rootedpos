import { create } from 'zustand';
import { Employee } from '@/lib/types';
import { getData } from '@/lib/mock-data';

interface AuthState {
  user: Employee | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  loadSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (email, password) => {
    const employees = getData<Employee[]>('employees');
    const found = employees.find(e => e.email === email && e.password === password && e.active);
    if (found) {
      const updated = { ...found, lastLogin: new Date().toISOString() };
      const all = employees.map(e => e.id === found.id ? updated : e);
      localStorage.setItem('swiftpos_employees', JSON.stringify(all));
      localStorage.setItem('swiftpos_session', JSON.stringify(updated));
      set({ user: updated, isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => {
    localStorage.removeItem('swiftpos_session');
    set({ user: null, isAuthenticated: false });
  },
  loadSession: () => {
    const raw = localStorage.getItem('swiftpos_session');
    if (raw) {
      set({ user: JSON.parse(raw), isAuthenticated: true });
    }
  },
}));

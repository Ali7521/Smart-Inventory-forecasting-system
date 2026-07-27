import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  Bell,
  LogOut,
  MessageCircle,
  Moon,
  Search,
  ShieldAlert,
  Sun
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { alertsCount, setIsHowItWorksOpen, theme, toggleTheme } = useApp();
  const displayName = user?.name?.split(' ')[0] || 'there';
  const initials = user?.name
    ?.split(' ')
    .map((name) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SI';

  return (
    <header className="topbar h-[72px] px-5 sm:px-7 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <div className="user-avatar shrink-0">{initials}</div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 leading-tight truncate">Welcome! {displayName}</p>
          <p className="text-[11px] text-slate-500 truncate">Here’s your inventory pulse today.</p>
        </div>
      </div>

      <div className="hidden lg:flex inventory-search items-center gap-2 mx-8 max-w-md flex-1">
        <Search className="w-4 h-4" />
        <input aria-label="Search inventory" placeholder="Search products, SKUs, or reports" />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {alertsCount.lowStock > 0 && (
          <div className="hidden xl:flex alert-pill items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{alertsCount.lowStock} low stock</span>
          </div>
        )}

        <button
          type="button"
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          aria-pressed={theme === 'dark'}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          <span className="hidden sm:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>

        <button
          onClick={() => setIsHowItWorksOpen(true)}
          className="icon-button hidden sm:grid"
          title="How forecasting works"
          aria-label="How forecasting works"
        >
          <MessageCircle className="w-4 h-4" />
        </button>

        <button className="icon-button relative" title="Inventory alerts" aria-label="Inventory alerts">
          <Bell className="w-4 h-4" />
          {alertsCount.lowStock > 0 && <span className="notification-dot" />}
        </button>

        <button
          onClick={logout}
          className="icon-button hidden sm:grid"
          title="Log out"
          aria-label="Log out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

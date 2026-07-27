import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  FileBarChart, 
  Settings 
} from 'lucide-react';

export default function Sidebar() {
  const { alertsCount } = useApp();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Products & Stock', path: '/products', icon: Package },
    { label: 'Sales Transactions', path: '/sales', icon: ShoppingCart },
    { 
      label: 'Forecast & Reorder', 
      path: '/forecasts', 
      icon: TrendingUp,
      badge: alertsCount.lowStock + alertsCount.reorderSoon > 0 ? (alertsCount.lowStock + alertsCount.reorderSoon) : null,
      badgeColor: alertsCount.lowStock > 0 ? 'bg-rose-500' : 'bg-amber-500'
    },
    { label: 'Reports & Export', path: '/reports', icon: FileBarChart },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-2">Main Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] text-white font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
          <span>Stat Model: WMA/LR</span>
        </div>
        <p className="text-[11px] text-slate-500">Auto Safety Stock Buffer active</p>
      </div>
    </aside>
  );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  BarChart3,
  CircleHelp,
  FileBarChart,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Sparkles,
  TrendingUp
} from 'lucide-react';

const navigationGroups = [
  {
    label: 'General',
    items: [
      { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Products', path: '/products', icon: Package },
      { label: 'Sales', path: '/sales', icon: ShoppingCart }
    ]
  },
  {
    label: 'Reports',
    items: [
      { label: 'Forecasts', path: '/forecasts', icon: TrendingUp },
      { label: 'Alerts', path: '/alerts', icon: AlertTriangle },
      { label: 'Reports', path: '/reports', icon: FileBarChart }
    ]
  },
  {
    label: 'Settings',
    items: [
      { label: 'Preferences', path: '/settings', icon: Settings }
    ]
  }
];

export default function Sidebar() {
  const { alertsCount, setIsHowItWorksOpen } = useApp();
  const totalAlerts = alertsCount.lowStock + alertsCount.reorderSoon;

  return (
    <aside className="sidebar w-64 p-4 hidden md:flex flex-col shrink-0">
      <div>
        <div className="sidebar-brand px-1 pb-8 pt-1 flex items-center gap-2">
          <div className="brand-mark"><Sparkles className="w-4 h-4" /></div>
          <span>Inventory<span>Guard</span></span>
        </div>

        <nav className="space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <p className="sidebar-section-label">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isForecast = item.path === '/forecasts';
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </span>
                      {isForecast && totalAlerts > 0 && <span className="sidebar-badge">{totalAlerts}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-auto space-y-3">
        <div className="upgrade-card">
          <div className="upgrade-icon"><BarChart3 className="w-4 h-4" /></div>
          <p className="font-semibold">Forecasting is active</p>
          <span>Trend analysis checks stock levels every day.</span>
        </div>
        <button onClick={() => setIsHowItWorksOpen(true)} className="sidebar-help">
          <CircleHelp className="w-4 h-4" />
          <span>Help & support</span>
        </button>
      </div>
    </aside>
  );
}

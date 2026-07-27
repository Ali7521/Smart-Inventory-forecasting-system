import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { HelpCircle, RefreshCw, LogOut, User as UserIcon, ShieldAlert, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, logout, loginDemo } = useAuth();
  const { alertsCount, seedDatabase, setIsHowItWorksOpen } = useApp();
  const [seeding, setSeeding] = React.useState(false);

  const handleResetData = async () => {
    if (window.confirm('Reset database with 90 days of sample data? Existing data will be refreshed.')) {
      setSeeding(true);
      try {
        await seedDatabase();
        window.location.reload();
      } catch (err) {
        alert('Error resetting data: ' + err.message);
      } finally {
        setSeeding(false);
      }
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight gradient-text">SmartInventory</h1>
          <p className="text-xs text-slate-400">Demand Forecasting & Reorder System</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Low stock badge shortcut */}
        {alertsCount.lowStock > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{alertsCount.lowStock} Low Stock</span>
          </div>
        )}

        {/* How Forecasting Works button */}
        <button
          onClick={() => setIsHowItWorksOpen(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          title="Learn how our forecasting algorithms work"
        >
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <span className="hidden sm:inline">How Forecasting Works</span>
        </button>

        {/* Reset/Seed Sample Data */}
        <button
          onClick={handleResetData}
          disabled={seeding}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 disabled:opacity-50"
          title="Reset sample products & sales history"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${seeding ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">Seed Sample Data</span>
        </button>

        {/* User Info & Role */}
        {user && (
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-slate-200 leading-none">{user.name}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                user.role === 'Admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-700 text-slate-300'
              }`}>
                {user.role}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

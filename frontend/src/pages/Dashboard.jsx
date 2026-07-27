import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import StatCard from '../components/StatCard';
import { useApp } from '../context/AppContext';
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  CheckCircle2, 
  Sparkles, 
  Info,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export default function Dashboard() {
  const { fetchAlertSummary, setIsHowItWorksOpen } = useApp();
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [forecastComparison, setForecastComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderingId, setOrderingId] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch report summary
      const [invRes, alertsRes, salesRes, forecastsRes] = await Promise.all([
        api.get('/reports/inventory'),
        api.get('/alerts'),
        api.get('/sales'),
        api.get('/forecast')
      ]);

      setStats(invRes.data.summary);
      setAlerts(alertsRes.data.alerts || []);

      // Aggregate sales trend data by date
      const salesMap = {};
      salesRes.data.forEach(s => {
        const dStr = new Date(s.date).toISOString().split('T')[0];
        salesMap[dStr] = (salesMap[dStr] || 0) + s.quantity;
      });

      // Sort dates
      const trendData = Object.keys(salesMap)
        .sort()
        .slice(-21) // last 21 days
        .map(dStr => ({
          date: dStr.substring(5),
          sales: salesMap[dStr]
        }));
      setSalesTrend(trendData);

      // Build Forecast vs Actual comparison data for top products
      const compData = forecastsRes.data.slice(0, 6).map(f => ({
        name: f.productName.length > 15 ? f.productName.substring(0, 15) + '...' : f.productName,
        currentStock: f.currentStock,
        predictedDemand: f.predictedDemand,
        suggestedReorderQty: f.suggestedReorderQty
      }));
      setForecastComparison(compData);

    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkOrdered = async (productId) => {
    setOrderingId(productId);
    try {
      await api.post(`/alerts/mark-ordered/${productId}`, { quantity: 20 });
      await loadDashboardData();
      await fetchAlertSummary();
    } catch (err) {
      alert('Error marking order: ' + err.message);
    } finally {
      setOrderingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2 text-sky-400 font-medium">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading Smart Dashboard...</span>
        </div>
      </div>
    );
  }

  const lowStockCount = alerts.filter(a => a.status === 'Low Stock').length;
  const reorderSoonCount = alerts.filter(a => a.status === 'Reorder Soon').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Onboarding Checklist */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-sky-950/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Smart Inventory System Overview</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Demand Forecasting & Reorder Center</h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Statistical moving averages and linear trend models actively monitor your sales history to recommend optimal reorder timing.
            </p>
          </div>

          <button
            onClick={() => setIsHowItWorksOpen(true)}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 text-xs font-semibold transition-all flex items-center gap-2"
          >
            <Info className="w-4 h-4" />
            <span>How Forecasting Works</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={stats?.totalProductsCount || 0}
          subtitle={`${stats?.totalItemsInStock || 0} units total in stock`}
          icon={Package}
          color="sky"
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockCount}
          subtitle={`${reorderSoonCount} items need reordering soon`}
          icon={AlertTriangle}
          color={lowStockCount > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Inventory Value"
          value={`$${(stats?.totalInventoryValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Total wholesale asset valuation"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Forecast Horizon"
          value="14 Days"
          subtitle="Weighted Moving Average (WMA)"
          icon={TrendingUp}
          color="indigo"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Overall Sales Volume Trend</h3>
              <p className="text-[11px] text-slate-400">Daily units sold over past 3 weeks</p>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-medium">
              Daily Aggregate
            </div>
          </div>

          <div className="h-64 w-full">
            {salesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">No sales history logged yet</div>
            )}
          </div>
        </div>

        {/* Forecast vs Current Stock Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Forecasted Demand vs Current Stock</h3>
              <p className="text-[11px] text-slate-400">Comparing current inventory against 14-day predictions</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {forecastComparison.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="currentStock" name="Current Stock" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="predictedDemand" name="14-Day Demand" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">No product forecasts available</div>
            )}
          </div>
        </div>
      </div>

      {/* Reorder Alerts Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Reorder Recommendations & Status
            </h3>
            <p className="text-[11px] text-slate-400">Products requiring attention based on forecasted sales velocity</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Product / SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-center">In-Stock</th>
                <th className="py-3 px-3 text-center">14-Day Forecast</th>
                <th className="py-3 px-3 text-center">Suggested Reorder</th>
                <th className="py-3 px-3 text-center">Confidence</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {alerts.slice(0, 7).map((item) => (
                <tr key={item.productId} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-100">{item.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.sku}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{item.category}</td>
                  <td className="py-3 px-3 text-center font-bold text-slate-100">{item.currentStock}</td>
                  <td className="py-3 px-3 text-center font-semibold text-indigo-400">{item.predictedDemand} units</td>
                  <td className="py-3 px-3 text-center font-bold text-sky-400">
                    {item.suggestedReorderQty > 0 ? `+${item.suggestedReorderQty}` : '0'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      item.confidenceLabel === 'High' ? 'bg-emerald-500/20 text-emerald-300' :
                      item.confidenceLabel === 'Medium' ? 'bg-sky-500/20 text-sky-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {item.confidenceScore}% ({item.confidenceLabel})
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                      item.status === 'Low Stock' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      item.status === 'Reorder Soon' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {item.status !== 'Healthy' ? (
                      <button
                        onClick={() => handleMarkOrdered(item.productId)}
                        disabled={orderingId === item.productId}
                        className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-medium text-[11px] shadow-sm transition-all"
                      >
                        {orderingId === item.productId ? 'Restocking...' : 'Mark as Ordered'}
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500">Adequate</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

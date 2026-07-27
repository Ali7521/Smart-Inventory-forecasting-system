import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useApp } from '../context/AppContext';
import { ShieldAlert, AlertTriangle, CheckCircle, Package, RefreshCw } from 'lucide-react';

export default function AlertsPage() {
  const { fetchAlertSummary } = useApp();
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({ lowStock: 0, reorderSoon: 0, healthy: 0 });
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data.alerts || []);
      setSummary(res.data.summary || { lowStock: 0, reorderSoon: 0, healthy: 0 });
    } catch (err) {
      console.error('Error loading alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkOrdered = async (productId, suggestedQty) => {
    setActionId(productId);
    try {
      await api.post(`/alerts/mark-ordered/${productId}`, { quantity: suggestedQty || 20 });
      await loadAlerts();
      await fetchAlertSummary();
    } catch (err) {
      alert('Error marking order: ' + err.message);
    } finally {
      setActionId(null);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'Low Stock') return a.status === 'Low Stock';
    if (filter === 'Reorder Soon') return a.status === 'Reorder Soon';
    if (filter === 'Healthy') return a.status === 'Healthy';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-rose-400" />
          Reorder Alert Center
        </h1>
        <p className="text-xs text-slate-400">Automated inventory health monitor based on current stock vs forecasted demand</p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setFilter('Low Stock')}
          className={`glass-panel p-5 rounded-2xl border text-left transition-all ${
            filter === 'Low Stock' ? 'border-rose-500 bg-rose-500/10' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400 uppercase">Critical Low Stock</span>
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 mt-3">{summary.lowStock}</div>
          <p className="text-xs text-slate-400 mt-1">Stock ≤ Reorder Threshold</p>
        </button>

        <button
          onClick={() => setFilter('Reorder Soon')}
          className={`glass-panel p-5 rounded-2xl border text-left transition-all ${
            filter === 'Reorder Soon' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase">Reorder Soon</span>
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 mt-3">{summary.reorderSoon}</div>
          <p className="text-xs text-slate-400 mt-1">Stock ≤ Forecast + Safety Buffer</p>
        </button>

        <button
          onClick={() => setFilter('Healthy')}
          className={`glass-panel p-5 rounded-2xl border text-left transition-all ${
            filter === 'Healthy' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase">Healthy Inventory</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 mt-3">{summary.healthy}</div>
          <p className="text-xs text-slate-400 mt-1">Stock satisfies forecast horizon</p>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['All', 'Low Stock', 'Reorder Soon', 'Healthy'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === tab
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Alerts Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Evaluating stock health...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No items match the selected status filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center">In-Stock</th>
                  <th className="py-3.5 px-4 text-center">14-Day Demand</th>
                  <th className="py-3.5 px-4 text-center">Safety Stock</th>
                  <th className="py-3.5 px-4 text-center">Suggested Reorder Qty</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredAlerts.map((item) => (
                  <tr key={item.productId} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100">{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.sku}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{item.category}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-100">{item.currentStock}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-indigo-400">{item.predictedDemand} units</td>
                    <td className="py-3.5 px-4 text-center text-slate-400">{item.safetyStock}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-sky-400">
                      {item.suggestedReorderQty > 0 ? `+${item.suggestedReorderQty}` : '0'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                        item.status === 'Low Stock' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        item.status === 'Reorder Soon' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {item.status !== 'Healthy' ? (
                        <button
                          onClick={() => handleMarkOrdered(item.productId, item.suggestedReorderQty)}
                          disabled={actionId === item.productId}
                          className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-medium text-[11px] shadow-sm transition-all"
                        >
                          {actionId === item.productId ? 'Processing...' : 'Mark as Ordered'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500">No Action Needed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

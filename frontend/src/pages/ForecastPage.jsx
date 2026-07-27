import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useApp } from '../context/AppContext';
import { TrendingUp, HelpCircle, Sparkles, BarChart2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function ForecastPage() {
  const { setIsHowItWorksOpen } = useApp();
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('WMA');
  const [periodDays, setPeriodDays] = useState(14);
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    fetchForecasts();
  }, [selectedMethod, periodDays]);

  const fetchForecasts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/forecast', {
        params: { method: selectedMethod, periodDays }
      });
      setForecasts(res.data);
      if (res.data.length > 0 && !selectedProductId) {
        setSelectedProductId(res.data[0].productId);
      }
    } catch (err) {
      console.error('Error fetching forecasts:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeForecast = forecasts.find(f => f.productId === selectedProductId) || forecasts[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-sky-400" />
            Demand Forecasting Engine
          </h1>
          <p className="text-xs text-slate-400">Statistical time-series modeling for precise inventory planning</p>
        </div>

        <button
          onClick={() => setIsHowItWorksOpen(true)}
          className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sky-400 hover:bg-slate-700 text-xs font-semibold flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <HelpCircle className="w-4 h-4" />
          <span>How Algorithms Work</span>
        </button>
      </div>

      {/* Model & Horizon Configuration Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap gap-6 items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">Statistical Model:</span>
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
            {[
              { id: 'WMA', label: 'Weighted Moving Avg (WMA)' },
              { id: 'SMA', label: 'Simple Moving Avg (SMA)' },
              { id: 'LinearRegression', label: 'Linear Regression' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedMethod === m.id
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">Forecast Horizon:</span>
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
            {[7, 14, 30].map(days => (
              <button
                key={days}
                onClick={() => setPeriodDays(days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  periodDays === days
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Selected Product Deep Dive */}
      {activeForecast && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-sky-400 font-mono uppercase tracking-wider">{activeForecast.sku}</span>
              <h2 className="text-xl font-bold text-slate-100">{activeForecast.productName}</h2>
              <p className="text-xs text-slate-400">Category: {activeForecast.category}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Confidence Score</span>
                <span className={`text-sm font-bold ${
                  activeForecast.confidenceScore >= 75 ? 'text-emerald-400' :
                  activeForecast.confidenceScore >= 50 ? 'text-sky-400' : 'text-amber-400'
                }`}>
                  {activeForecast.confidenceScore}% ({activeForecast.confidenceLabel})
                </span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Current Stock</span>
              <span className="text-xl font-bold text-slate-100">{activeForecast.currentStock} units</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Daily Demand Velocity</span>
              <span className="text-xl font-bold text-sky-400">{activeForecast.dailyDemandRate} units/day</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">{periodDays}-Day Forecasted Demand</span>
              <span className="text-xl font-bold text-indigo-400">{activeForecast.predictedDemand} units</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Suggested Reorder Qty</span>
              <span className="text-xl font-bold text-emerald-400">
                {activeForecast.suggestedReorderQty > 0 ? `+${activeForecast.suggestedReorderQty} units` : '0 units'}
              </span>
            </div>
          </div>

          {/* Daily Sales Time Series Sparkline Chart */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">60-Day Historical Daily Sales & Trend Projection</h3>
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeForecast.dailySeries || []}>
                  <defs>
                    <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="quantity" name="Daily Sales" stroke="#38bdf8" strokeWidth={2} fill="url(#histGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* All Products Forecast Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-slate-100 text-sm">All Products Forecast Matrix ({periodDays}-Day Horizon)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3 text-center">In-Stock</th>
                <th className="py-3 px-3 text-center">Daily Demand Rate</th>
                <th className="py-3 px-3 text-center">{periodDays}-Day Forecast</th>
                <th className="py-3 px-3 text-center">Safety Stock</th>
                <th className="py-3 px-3 text-center">Suggested Reorder</th>
                <th className="py-3 px-3 text-center">Confidence</th>
                <th className="py-3 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {forecasts.map(f => (
                <tr key={f.productId} className={`hover:bg-slate-900/50 transition-colors ${selectedProductId === f.productId ? 'bg-sky-500/10' : ''}`}>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-100">{f.productName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{f.sku}</div>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-100">{f.currentStock}</td>
                  <td className="py-3 px-3 text-center text-sky-400 font-mono">{f.dailyDemandRate} /day</td>
                  <td className="py-3 px-3 text-center font-semibold text-indigo-300">{f.predictedDemand} units</td>
                  <td className="py-3 px-3 text-center text-slate-400">{f.safetyStock}</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-400">
                    {f.suggestedReorderQty > 0 ? `+${f.suggestedReorderQty}` : '0'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] font-medium text-slate-300">
                      {f.confidenceScore}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedProductId(f.productId)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-[11px]"
                    >
                      View Chart
                    </button>
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

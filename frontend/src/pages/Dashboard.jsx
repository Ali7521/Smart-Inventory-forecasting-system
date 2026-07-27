import React, { useEffect, useMemo, useState } from 'react';
import api from '../utils/api';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  Archive,
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  MoreVertical,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const palette = ['#a855f7', '#2563eb', '#e93b84', '#06a6d4'];

export default function Dashboard() {
  const { fetchAlertSummary, theme } = useApp();
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderingId, setOrderingId] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [invRes, alertsRes, salesRes] = await Promise.all([
        api.get('/reports/inventory'),
        api.get('/alerts'),
        api.get('/sales')
      ]);

      setStats(invRes.data.summary);
      setAlerts(alertsRes.data.alerts || []);

      const salesMap = {};
      salesRes.data.forEach((sale) => {
        const date = new Date(sale.date).toISOString().split('T')[0];
        salesMap[date] = (salesMap[date] || 0) + sale.quantity;
      });

      setSalesTrend(
        Object.keys(salesMap)
          .sort()
          .slice(-21)
          .map((date) => ({ date: date.substring(5), sales: salesMap[date] }))
      );
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
      alert(`Error marking order: ${err.message}`);
    } finally {
      setOrderingId(null);
    }
  };

  const lowStockCount = alerts.filter((alert) => alert.status === 'Low Stock').length;
  const reorderSoonCount = alerts.filter((alert) => alert.status === 'Reorder Soon').length;
  const totalProducts = stats?.totalProductsCount || 0;
  const totalUnits = stats?.totalItemsInStock || 0;
  const inventoryValue = stats?.totalInventoryValue || 0;
  const healthScore = Math.max(0, Math.min(100, 100 - lowStockCount * 12 - reorderSoonCount * 5));
  const riskLevel = healthScore >= 80 ? 'Healthy' : healthScore >= 55 ? 'Watch' : 'High risk';
  const isDark = theme === 'dark';

  const categoryMix = useMemo(() => {
    const categories = alerts.reduce((result, alert) => {
      const name = alert.category || 'Uncategorised';
      result[name] = (result[name] || 0) + 1;
      return result;
    }, {});
    const entries = Object.entries(categories).slice(0, 4);
    return entries.length ? entries : [['Inventory', 1]];
  }, [alerts]);

  const mixTotal = categoryMix.reduce((sum, [, value]) => sum + value, 0);
  let runningTotal = 0;
  const mixGradient = categoryMix
    .map(([, count], index) => {
      const start = (runningTotal / mixTotal) * 100;
      runningTotal += count;
      const end = (runningTotal / mixTotal) * 100;
      return `${palette[index % palette.length]} ${start}% ${end}%`;
    })
    .join(', ');

  const metrics = [
    { label: 'Low Stock', value: lowStockCount, detail: 'Needs attention', icon: AlertTriangle, tone: 'rose' },
    { label: 'Products', value: totalProducts, detail: 'Tracked items', icon: Package, tone: 'purple' },
    { label: 'Stock Units', value: totalUnits.toLocaleString(), detail: 'Available now', icon: Archive, tone: 'blue' },
    { label: 'Reorder Soon', value: reorderSoonCount, detail: 'Forecasted risk', icon: ShoppingCart, tone: 'cyan' },
    { label: 'Stock Value', value: `$${inventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, detail: 'Wholesale value', icon: CircleDollarSign, tone: 'amber' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-sm text-violet-500">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading your inventory overview...
      </div>
    );
  }

  return (
    <div className="reference-dashboard pb-10">
      <div className="dashboard-grid-top">
        <section className="reference-panel current-risk-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Inventory overview</p>
              <h1>Current Stock Risk</h1>
            </div>
            <button className="period-button">Daily <span>⌄</span></button>
          </div>

          <div className="risk-metric-grid">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <article className="risk-metric-card" key={metric.label}>
                  <div className="metric-card-top">
                    <span className={`metric-icon ${metric.tone}`}><Icon className="w-4 h-4" /></span>
                    <MoreVertical className="w-4 h-4 metric-more" />
                  </div>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                  <small>{metric.detail}</small>
                </article>
              );
            })}
          </div>
        </section>

        <section className="reference-panel score-panel">
          <div className="panel-heading compact">
            <h2>Inventory Health</h2>
            <MoreVertical className="w-4 h-4 metric-more" />
          </div>
          <div className="score-ring" style={{ '--score': `${healthScore * 3.6}deg` }}>
            <div className="score-ring-inner">
              <span>Score</span>
              <strong>{healthScore}</strong>
              <em>{riskLevel}</em>
            </div>
          </div>
          <div className="score-range"><span>0</span><span>100</span></div>
        </section>
      </div>

      <div className="dashboard-grid-main">
        <div className="dashboard-main-column">
          <section className="reference-panel chart-panel">
            <div className="panel-heading">
              <div>
                <h2>Sales Summary</h2>
                <p>Daily units sold across your recent history</p>
              </div>
              <button className="period-button">3 Weeks <span>⌄</span></button>
            </div>
            <div className="sales-chart">
              {salesTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrend} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="inventorySalesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.36} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke={isDark ? '#29344b' : '#e7e8f0'} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fill: isDark ? '#9ba7ba' : '#8b90a0', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: isDark ? '#9ba7ba' : '#8b90a0', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ stroke: '#a855f7', strokeDasharray: '3 3' }}
                      contentStyle={{ background: isDark ? '#182033' : '#ffffff', border: `1px solid ${isDark ? '#29344b' : '#e7e8f0'}`, borderRadius: 12, color: isDark ? '#f4f4f7' : '#252532', fontSize: 12 }}
                    />
                    <Area type="monotone" dataKey="sales" name="Units sold" stroke="#a855f7" strokeWidth={2.5} fill="url(#inventorySalesGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">No sales history logged yet</div>
              )}
            </div>
          </section>

          <section className="reference-panel details-panel">
            <div className="panel-heading">
              <div>
                <h2>Reorder Details</h2>
                <p>Recommendations generated from sales velocity</p>
              </div>
              <button className="period-button">Priority <span>⌄</span></button>
            </div>
            <div className="overflow-x-auto">
              <table className="reference-table">
                <thead>
                  <tr>
                    <th>Product</th><th>Category</th><th>In stock</th><th>Forecast</th><th>Status</th><th aria-label="Action" />
                  </tr>
                </thead>
                <tbody>
                  {alerts.slice(0, 6).map((item) => (
                    <tr key={item.productId}>
                      <td><strong>{item.name}</strong><small>{item.sku}</small></td>
                      <td>{item.category}</td>
                      <td>{item.currentStock}</td>
                      <td className="forecast-value">{item.predictedDemand} units</td>
                      <td><span className={`status-chip ${item.status === 'Low Stock' ? 'danger' : item.status === 'Reorder Soon' ? 'warning' : 'safe'}`}>{item.status}</span></td>
                      <td>
                        {item.status !== 'Healthy' ? (
                          <button onClick={() => handleMarkOrdered(item.productId)} disabled={orderingId === item.productId} className="table-action">
                            {orderingId === item.productId ? 'Ordering...' : 'Order'} <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        ) : <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
                      </td>
                    </tr>
                  ))}
                  {alerts.length === 0 && <tr><td colSpan="6" className="empty-row">Everything looks healthy — no reorders needed.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="dashboard-rail">
          <section className="reference-panel mix-panel">
            <div className="panel-heading compact"><h2>Stock by category</h2><MoreVertical className="w-4 h-4 metric-more" /></div>
            <div className="mix-content">
              <div className="mix-ring" style={{ background: `conic-gradient(${mixGradient})` }}><div><strong>{mixTotal}</strong><span>groups</span></div></div>
              <div className="mix-legend">
                {categoryMix.map(([category, count], index) => <div key={category}><i style={{ backgroundColor: palette[index % palette.length] }} /><span>{category}</span><strong>{count}</strong></div>)}
              </div>
            </div>
          </section>

          <section className="reference-panel action-panel">
            <div className="panel-heading compact"><h2>Restock activity</h2><MoreVertical className="w-4 h-4 metric-more" /></div>
            <div className="activity-list">
              <div><span className="activity-icon rose"><AlertTriangle className="w-4 h-4" /></span><p><strong>{lowStockCount} low-stock items</strong><small>Require immediate attention</small></p><b>{lowStockCount}</b></div>
              <div><span className="activity-icon purple"><TrendingUp className="w-4 h-4" /></span><p><strong>{reorderSoonCount} reorder signals</strong><small>Based on predicted demand</small></p><b>{reorderSoonCount}</b></div>
              <div><span className="activity-icon blue"><Package className="w-4 h-4" /></span><p><strong>{totalUnits.toLocaleString()} units available</strong><small>Across your current catalogue</small></p><b>↗</b></div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

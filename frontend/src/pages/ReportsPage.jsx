import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { exportToCSV, printReport } from '../utils/exportHelpers';
import { FileBarChart, Download, Printer, Calendar, DollarSign, Package, ShoppingCart } from 'lucide-react';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [invReport, setInvReport] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [invRes, salesRes] = await Promise.all([
        api.get('/reports/inventory'),
        api.get('/reports/sales', { params: { startDate, endDate } })
      ]);
      setInvReport(invRes.data);
      setSalesReport(salesRes.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (activeTab === 'inventory' && invReport?.products) {
      const rows = invReport.products.map(p => ({
        SKU: p.sku,
        Name: p.name,
        Category: p.category,
        CurrentStock: p.currentStock,
        UnitCost: p.unitCost,
        SellingPrice: p.sellingPrice,
        TotalValue: (p.currentStock * p.unitCost).toFixed(2),
        ReorderThreshold: p.reorderThreshold
      }));
      exportToCSV(`inventory_report_${new Date().toISOString().split('T')[0]}.csv`, rows);
    } else if (activeTab === 'sales' && salesReport?.transactions) {
      const rows = salesReport.transactions.map(s => ({
        Date: new Date(s.date).toISOString(),
        Product: s.productId ? s.productId.name : 'N/A',
        SKU: s.productId ? s.productId.sku : 'N/A',
        Quantity: s.quantity,
        UnitPrice: s.unitPrice,
        TotalAmount: s.totalAmount,
        Staff: s.staffName || 'System'
      }));
      exportToCSV(`sales_report_${new Date().toISOString().split('T')[0]}.csv`, rows);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-sky-400" />
            Inventory & Sales Reports
          </h1>
          <p className="text-xs text-slate-400">Export financial valuation summaries and historical sales performance</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={printReport}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>Print / PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* Report Switcher & Date Range Filters */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'inventory' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inventory Valuation Report
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'sales' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sales Performance Report
          </button>
        </div>

        {activeTab === 'sales' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      {activeTab === 'inventory' && invReport && (
        <div className="space-y-6">
          {/* Inventory Valuation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Inventory Value</span>
              <div className="text-2xl font-bold text-emerald-400 mt-2">
                ${invReport.summary.totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Units in Stock</span>
              <div className="text-2xl font-bold text-sky-400 mt-2">{invReport.summary.totalItemsInStock}</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase">Low Stock Products</span>
              <div className="text-2xl font-bold text-rose-400 mt-2">{invReport.summary.lowStockCount}</div>
            </div>
          </div>

          {/* Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-bold text-slate-100 text-sm">Detailed Inventory Breakdown</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">In-Stock</th>
                    <th className="py-3 px-4 text-right">Unit Cost</th>
                    <th className="py-3 px-4 text-right">Total Asset Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {invReport.products.map(p => (
                    <tr key={p._id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-4 font-mono text-slate-400">{p.sku}</td>
                      <td className="py-3 px-4 font-semibold text-slate-100">{p.name}</td>
                      <td className="py-3 px-4 text-slate-300">{p.category}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-100">{p.currentStock}</td>
                      <td className="py-3 px-4 text-right text-slate-400">${p.unitCost.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">${(p.currentStock * p.unitCost).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sales' && salesReport && (
        <div className="space-y-6">
          {/* Sales KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Sales Revenue</span>
              <div className="text-2xl font-bold text-emerald-400 mt-2">
                ${salesReport.summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Units Sold</span>
              <div className="text-2xl font-bold text-sky-400 mt-2">{salesReport.summary.totalUnitsSold}</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Transactions</span>
              <div className="text-2xl font-bold text-indigo-400 mt-2">{salesReport.summary.totalTransactions}</div>
            </div>
          </div>

          {/* Top Selling Products Summary */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-bold text-slate-100 text-sm">Top Selling Products</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4 text-center">Units Sold</th>
                    <th className="py-3 px-4 text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {salesReport.topSellingProducts.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="py-3 px-4 font-semibold text-slate-100">{t.productName}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{t.sku}</td>
                      <td className="py-3 px-4 text-center font-bold text-sky-400">{t.unitsSold}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">${t.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

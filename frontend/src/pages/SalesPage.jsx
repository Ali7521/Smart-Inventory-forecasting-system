import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ShoppingCart, Plus, Calendar, Search, Filter, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedProduct, setSelectedProduct] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // New Sale modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saleForm, setSaleForm] = useState({
    productId: '',
    quantity: 1,
    unitPrice: 0,
    date: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, [selectedProduct, startDate, endDate]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sales', {
        params: {
          productId: selectedProduct || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined
        }
      });
      setSales(res.data);
    } catch (err) {
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (e) => {
    const pId = e.target.value;
    const prod = products.find(p => p._id === pId);
    setSaleForm({
      ...saleForm,
      productId: pId,
      unitPrice: prod ? prod.sellingPrice : 0
    });
  };

  const handleLogSale = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/sales', saleForm);
      setIsModalOpen(false);
      fetchSales();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Error logging sale transaction');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Sales Transactions Log</h1>
          <p className="text-xs text-slate-400">Record customer sales. Current stock automatically decrements upon submission.</p>
        </div>

        <button
          onClick={() => {
            if (products.length > 0) {
              setSaleForm({
                productId: products[0]._id,
                quantity: 1,
                unitPrice: products[0].sellingPrice,
                date: new Date().toISOString().split('T')[0]
              });
            }
            setIsModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Sale</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Filter Product</span>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="">All Products</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Start Date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">End Date</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {(selectedProduct || startDate || endDate) && (
          <button
            onClick={() => {
              setSelectedProduct('');
              setStartDate('');
              setEndDate('');
            }}
            className="text-xs text-sky-400 hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Sales History Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading sales history...</div>
        ) : sales.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingCart className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No sales transactions logged yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Record a sale or seed mock history so our forecasting algorithms can analyze demand.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4 text-center">Quantity Sold</th>
                  <th className="py-3.5 px-4 text-right">Unit Price</th>
                  <th className="py-3.5 px-4 text-right">Total Revenue</th>
                  <th className="py-3.5 px-4 text-right">Staff / Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {sales.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {new Date(s.date).toLocaleDateString()} {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-100">
                      {s.productId ? s.productId.name : 'Product Removed'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {s.productId ? s.productId.sku : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-sky-400">{s.quantity}</td>
                    <td className="py-3.5 px-4 text-right text-slate-300">${s.unitPrice.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400">${s.totalAmount.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right text-slate-400">{s.staffName || 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700 p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-100 text-base border-b border-slate-800 pb-3">
              Record New Sale Transaction
            </h3>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleLogSale} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Select Product</label>
                <select
                  required
                  value={saleForm.productId}
                  onChange={handleProductSelect}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} — In Stock: {p.currentStock} (${p.sellingPrice.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={saleForm.quantity}
                    onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={saleForm.unitPrice}
                    onChange={(e) => setSaleForm({ ...saleForm, unitPrice: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Sale Date</label>
                <input
                  type="date"
                  required
                  value={saleForm.date}
                  onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex justify-between">
                <span>Total Amount:</span>
                <strong className="text-emerald-400">
                  ${(Number(saleForm.quantity || 0) * Number(saleForm.unitPrice || 0)).toFixed(2)}
                </strong>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-lg shadow-sky-500/20"
                >
                  Submit & Decrement Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import CSVImportModal from '../components/CSVImportModal';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Plus, 
  Search, 
  Upload, 
  Edit, 
  Trash2, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Layers 
} from 'lucide-react';

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  // Modals state
  const [isCSVOpen, setIsCSVOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Form state
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    currentStock: 0,
    unitCost: 0,
    sellingPrice: 0,
    reorderThreshold: 10,
    safetyStock: 5
  });

  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState(10);
  const [adjustReason, setAdjustReason] = useState('Restock / Purchase');

  useEffect(() => {
    fetchProducts();
  }, [category, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: { category, search }
      });
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'Electronics',
      currentStock: 15,
      unitCost: 20.00,
      sellingPrice: 45.00,
      reorderThreshold: 10,
      safetyStock: 5
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      category: p.category,
      currentStock: p.currentStock,
      unitCost: p.unitCost,
      sellingPrice: p.sellingPrice || p.unitCost * 1.5,
      reorderThreshold: p.reorderThreshold,
      safetyStock: p.safetyStock
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setIsProductModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert('Error saving product: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert('Error deleting product: ' + err.message);
      }
    }
  };

  const handleOpenAdjust = (p) => {
    setAdjustingProduct(p);
    setAdjustAmount(10);
    setAdjustReason('Restock / Purchase');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjust = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/products/${adjustingProduct._id}/adjust-stock`, {
        changeAmount: Number(adjustAmount),
        reason: adjustReason
      });
      setIsAdjustModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert('Error adjusting stock: ' + (err.response?.data?.message || err.message));
    }
  };

  const categories = ['All', 'Electronics', 'Apparel', 'Groceries', 'Accessories', 'General'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Product & Stock Management</h1>
          <p className="text-xs text-slate-400">View, add, edit inventory items and log manual stock adjustments</p>
        </div>

        {user?.role === 'Admin' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCSVOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Import CSV</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 font-medium">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                category === cat
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <Package className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No products found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your first product to get started with inventory tracking and demand forecasting.
            </p>
            {user?.role === 'Admin' && (
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-medium inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Product</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">In-Stock</th>
                  <th className="py-3.5 px-4 text-right">Unit Cost</th>
                  <th className="py-3.5 px-4 text-right">Selling Price</th>
                  <th className="py-3.5 px-4 text-center">Reorder Threshold</th>
                  <th className="py-3.5 px-4 text-center">Safety Stock</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {products.map((p) => {
                  let status = 'Healthy';
                  let statusBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                  if (p.currentStock <= p.reorderThreshold) {
                    status = 'Low Stock';
                    statusBg = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                  }

                  return (
                    <tr key={p._id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-100">{p.name}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{p.sku}</td>
                      <td className="py-3.5 px-4 text-slate-300">{p.category}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-100">{p.currentStock}</td>
                      <td className="py-3.5 px-4 text-right text-slate-400">${p.unitCost.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right text-slate-200 font-semibold">${p.sellingPrice.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-center text-slate-400">{p.reorderThreshold}</td>
                      <td className="py-3.5 px-4 text-center text-slate-400">{p.safetyStock}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${statusBg}`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenAdjust(p)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-[11px] font-medium"
                            title="Adjust Stock Log"
                          >
                            Adjust Stock
                          </button>
                          {user?.role === 'Admin' && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(p._id)}
                                className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isCSVOpen}
        onClose={() => setIsCSVOpen(false)}
        onSuccess={fetchProducts}
      />

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-700 p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-100 text-base border-b border-slate-800 pb-3">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Accessories">Accessories</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Current Stock</label>
                  <input
                    type="number"
                    required
                    disabled={!!editingProduct}
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Reorder Threshold</label>
                  <input
                    type="number"
                    required
                    value={formData.reorderThreshold}
                    onChange={(e) => setFormData({ ...formData, reorderThreshold: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Safety Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.safetyStock}
                    onChange={(e) => setFormData({ ...formData, safetyStock: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-lg shadow-sky-500/20"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Log Modal */}
      {isAdjustModalOpen && adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700 p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-100 text-base border-b border-slate-800 pb-3">
              Stock Adjustment — {adjustingProduct.name}
            </h3>

            <form onSubmit={handleSaveAdjust} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                Current In-Stock: <strong className="text-sky-400">{adjustingProduct.currentStock} units</strong>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Stock Change (+ or -)</label>
                <input
                  type="number"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. +20 for restock, -5 for damage"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Reason for Adjustment</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="Restock / Purchase">Restock / Purchase</option>
                  <option value="Damaged / Lost">Damaged / Lost</option>
                  <option value="Audit Correction">Audit Correction</option>
                  <option value="Order Marked">Order Marked</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold"
                >
                  Log Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

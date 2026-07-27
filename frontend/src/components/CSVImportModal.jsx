import React, { useState } from 'react';
import api from '../utils/api';
import { X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function CSVImportModal({ isOpen, onClose, onSuccess }) {
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const sampleCSV = `name,sku,category,currentStock,unitCost,sellingPrice,reorderThreshold,safetyStock
Wireless Mouse,ELEC-WM-01,Electronics,25,12.50,29.99,10,5
USB-C Fast Cable,ELEC-CABLE-02,Electronics,50,3.20,9.99,15,8
Notebook Paper 500p,OFFICE-NP-03,Stationery,12,4.00,11.50,20,10`;

  const handleParseAndUpload = async () => {
    if (!csvText.trim()) return;
    setLoading(true);
    setMessage(null);

    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must contain a header row and at least 1 data row.');
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const products = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx];
        });
        products.push(row);
      }

      const res = await api.post('/products/import-csv', { products });
      setMessage({ type: 'success', text: res.data.message });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvText(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-slate-700 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-slate-100">Bulk Import Products via CSV</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs text-slate-400 block font-medium">Option 1: Upload .csv file</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-sky-400 hover:file:bg-slate-700 cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs text-slate-400 font-medium">Option 2: Paste CSV raw text</label>
            <button
              onClick={() => setCsvText(sampleCSV)}
              className="text-[11px] text-sky-400 hover:underline"
            >
              Load Sample CSV Template
            </button>
          </div>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={7}
            placeholder="name,sku,category,currentStock,unitCost,sellingPrice,reorderThreshold,safetyStock..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
          ></textarea>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleParseAndUpload}
            disabled={loading || !csvText.trim()}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-xs font-medium text-white shadow-lg shadow-sky-500/20"
          >
            {loading ? 'Importing...' : 'Upload & Import'}
          </button>
        </div>
      </div>
    </div>
  );
}

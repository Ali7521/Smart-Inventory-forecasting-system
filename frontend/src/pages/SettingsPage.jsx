import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useApp } from '../context/AppContext';
import { Settings as SettingsIcon, Save, CheckCircle2, Bell, Shield, Sliders } from 'lucide-react';

export default function SettingsPage() {
  const { fetchSettings } = useApp();
  const [formData, setFormData] = useState({
    defaultSafetyStockPct: 20,
    defaultForecastMethod: 'WMA',
    forecastPeriodDays: 14,
    emailNotificationsEnabled: true,
    alertEmail: 'admin@inventory.com'
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.data) {
        setFormData({
          defaultSafetyStockPct: res.data.defaultSafetyStockPct || 20,
          defaultForecastMethod: res.data.defaultForecastMethod || 'WMA',
          forecastPeriodDays: res.data.forecastPeriodDays || 14,
          emailNotificationsEnabled: res.data.emailNotificationsEnabled ?? true,
          alertEmail: res.data.alertEmail || 'admin@inventory.com'
        });
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings', formData);
      setSaved(true);
      await fetchSettings();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Error updating settings: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-sky-400" />
          System Settings & Preferences
        </h1>
        <p className="text-xs text-slate-400">Configure global safety buffers, forecasting defaults, and notification triggers</p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
        {/* Forecasting Engine Preferences */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            Forecasting Engine Defaults
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Default Forecasting Algorithm</label>
              <select
                value={formData.defaultForecastMethod}
                onChange={(e) => setFormData({ ...formData, defaultForecastMethod: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="WMA">Weighted Moving Average (WMA) — Recommended</option>
                <option value="SMA">Simple Moving Average (SMA)</option>
                <option value="LinearRegression">Linear Regression Trend Line</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Default Forecast Horizon (Days)</label>
              <select
                value={formData.forecastPeriodDays}
                onChange={(e) => setFormData({ ...formData, forecastPeriodDays: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value={7}>7 Days (1 Week)</option>
                <option value={14}>14 Days (2 Weeks)</option>
                <option value={30}>30 Days (1 Month)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium flex justify-between">
              <span>Default Safety Stock Buffer (%)</span>
              <span className="text-sky-400 font-bold">{formData.defaultSafetyStockPct}%</span>
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={formData.defaultSafetyStockPct}
              onChange={(e) => setFormData({ ...formData, defaultSafetyStockPct: Number(e.target.value) })}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <p className="text-[11px] text-slate-500">
              Percentage buffer added above predicted demand to guard against unpredictable sales spikes or supply chain delays.
            </p>
          </div>
        </div>

        {/* Notifications & Email Alerts */}
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            Alerts & Notification Preferences
          </h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Low Stock Alert Notifications</span>
              <span className="text-[11px] text-slate-500">Send email trigger when a product drops below its reorder threshold</span>
            </div>
            <input
              type="checkbox"
              checked={formData.emailNotificationsEnabled}
              onChange={(e) => setFormData({ ...formData, emailNotificationsEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-sky-500 bg-slate-800 border-slate-700 accent-sky-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Alert Destination Email</label>
            <input
              type="email"
              value={formData.alertEmail}
              onChange={(e) => setFormData({ ...formData, alertEmail: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}

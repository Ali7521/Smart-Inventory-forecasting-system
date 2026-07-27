import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Sparkles, TrendingUp, BarChart2, ShieldCheck, HelpCircle } from 'lucide-react';

export default function HowForecastingWorksModal() {
  const { isHowItWorksOpen, setIsHowItWorksOpen } = useApp();

  if (!isHowItWorksOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-700 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">How Demand Forecasting Works</h2>
              <p className="text-xs text-slate-400">Plain language guide to our statistical models</p>
            </div>
          </div>
          <button
            onClick={() => setIsHowItWorksOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-slate-300">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="font-semibold text-sky-400 flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" /> 1. Statistical Algorithms
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our system continuously analyzes your product sales history over the last 60–90 days using three statistical techniques:
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              <li><strong className="text-slate-200">Weighted Moving Average (Default):</strong> Prioritizes recent sales days so sudden trends or seasonal boosts influence predictions faster.</li>
              <li><strong className="text-slate-200">Simple Moving Average:</strong> Calculates average daily demand evenly across historical windows.</li>
              <li><strong className="text-slate-200">Linear Regression Trend:</strong> Fits a growth line ($y = mx + b$) to project expanding or declining demand trajectories.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="font-semibold text-emerald-400 flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4" /> 2. Safety Stock & Reorder Formula
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              To prevent stockouts during supply delays or weekend surges, reorder recommendations follow this formula:
            </p>
            <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center text-xs font-mono text-emerald-300">
              Suggested Reorder Qty = Forecasted Demand + Safety Stock Buffer − Current In-Stock
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="font-semibold text-purple-400 flex items-center gap-2 mb-1">
              <BarChart2 className="w-4 h-4" /> 3. Confidence Indicator
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">High Confidence (&gt;75%):</strong> Product sales are steady and consistent.<br />
              <strong className="text-slate-200">Medium Confidence (50-74%):</strong> Sales fluctuate mildly.<br />
              <strong className="text-slate-200">Low / Insufficient Data (&lt;50%):</strong> Sales are erratic or fewer than 7 days of history exist.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setIsHowItWorksOpen(false)}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs transition-colors shadow-lg shadow-sky-500/20"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  TrendingUp, 
  ShieldAlert, 
  Package, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Layers 
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { loginDemo } = useAuth();
  const [loadingDemo, setLoadingDemo] = React.useState(false);

  const handleDemoClick = async () => {
    setLoadingDemo(true);
    try {
      await loginDemo();
      navigate('/dashboard');
    } catch (err) {
      alert('Error launching demo mode: ' + err.message);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <nav className="h-20 border-b border-slate-800/80 max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl gradient-text">SmartInventory</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleDemoClick}
            disabled={loadingDemo}
            className="hidden sm:flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>{loadingDemo ? 'Loading Demo...' : 'Explore Demo Mode'}</span>
          </button>
          <Link
            to="/login"
            className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/25 transition-all"
          >
            Sign In / Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Demand Forecasting & Stock Optimization</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          Know what to reorder, <br className="hidden sm:inline" />
          <span className="gradient-text">before you run out.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-400 text-base sm:text-lg leading-relaxed">
          Stop struggling with manual stock tracking and costly stockouts. Our smart inventory system analyzes historical sales patterns and predicts future demand using weighted moving averages and trend models.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={handleDemoClick}
            disabled={loadingDemo}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Try with Sample Data (Instant Demo)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm transition-all"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-slate-900/50 border-y border-slate-800/60 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold">How It Works in 4 Simple Steps</h2>
            <p className="text-slate-400 text-sm">Automated intelligence built into your daily operations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Add Products & Log Sales',
                desc: 'Add items manually or import via CSV. Every sale automatically updates current stock levels.',
                icon: Package
              },
              {
                step: '02',
                title: 'Analyze Sales History',
                desc: 'The engine processes daily sales patterns over weeks and months to detect growth trends.',
                icon: BarChart3
              },
              {
                step: '03',
                title: 'Forecast Demand',
                desc: 'Simple & Weighted Moving Averages calculate predicted demand for the next 14–30 days.',
                icon: TrendingUp
              },
              {
                step: '04',
                title: 'Smart Reorder Alerts',
                desc: 'Get flagged before stock runs low with exact suggested reorder quantities including safety buffers.',
                icon: ShieldAlert
              }
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-800 relative space-y-4">
                  <div className="text-xs font-bold font-mono text-sky-400">{s.step}</div>
                  <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 w-fit">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-100">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold">Key Capabilities</h2>
          <p className="text-slate-400 text-sm">Everything you need to eliminate stockouts and overstocking</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100">Multi-Model Forecasting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Switch between Weighted Moving Average, Simple Moving Average, and Linear Regression to match your inventory dynamics.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100">Dynamic Reorder Thresholds</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates safety stock buffers and suggests exact reorder quantities based on real sales velocity.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 w-fit">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100">Exportable CSV & PDF Reports</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate comprehensive inventory valuation summaries and sales transaction logs for bookkeeping.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>Smart Inventory Forecasting System &copy; {new Date().getFullYear()} — Built with MERN Stack</p>
      </footer>
    </div>
  );
}

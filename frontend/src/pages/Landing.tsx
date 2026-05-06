import { TrendingUp, Brain, Target, BarChart3, Shield, Zap, CheckCircle2, ArrowRight, Star, RefreshCw, BookOpen, Calculator, NotebookPen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: RefreshCw,  title: 'MT5 Auto-Sync',       desc: 'Automatically import trades from MetaTrader 5. Connect 100+ brokers instantly.' },
  { icon: Brain,      title: 'AI Pattern Detection', desc: 'Our AI analyzes your trades to surface your most profitable patterns and psychology.' },
  { icon: BarChart3,  title: 'Deep Analytics',       desc: '20+ performance metrics including P&L, win rate, drawdown, and R-multiples.' },
  { icon: Target,     title: 'Prop Firm Mode',        desc: 'Track FTMO-style challenges with profit targets and drawdown monitoring.' },
  { icon: BookOpen,   title: 'Trade Journal',         desc: 'Log every trade with screenshots, emotions, tags, and detailed notes.' },
  { icon: Calculator, title: 'Risk Calculator',       desc: 'Instantly calculate optimal lot sizes for any instrument and account size.' },
  { icon: NotebookPen,title: 'Trading Notebook',      desc: 'Your personal knowledge base for rules, setups, lessons, and checklists.' },
  { icon: Shield,     title: 'Bank-Level Security',   desc: '256-bit encryption with SOC 2 compliance. Your data is always safe.' },
];

const stats = [
  { value: '500+', label: 'Active Traders' },
  { value: '3,000+', label: 'Trades Analyzed' },
  { value: '67%', label: 'Avg Win Rate' },
  { value: '4.2x', label: 'Avg Profit Factor' },
];

const testimonials = [
  { name: 'Alex R.', role: 'Prop Firm Trader', text: 'ProJournX helped me pass my FTMO challenge by keeping my drawdown in check. The analytics are exceptional.', rating: 5, pnl: '+$8,200' },
  { name: 'Sarah M.', role: 'Forex Trader', text: 'The AI insights revealed I was trading at the wrong time of day. Win rate jumped 15% in one month.', rating: 5, pnl: '+$5,400' },
  { name: 'James K.', role: 'Gold Trader', text: 'Best trading journal I\'ve used. The XAUUSD playbook feature alone is worth the subscription.', rating: 5, pnl: '+$12,100' },
];

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-400">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-400/80 backdrop-blur-sm border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">ProJournX</span>
            <span className="text-xs text-brand-400 hidden sm:block">Trader's Performance Lab</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="btn-secondary text-sm hidden sm:flex">
              Sign In
            </button>
            <button onClick={() => navigate('/')} className="btn-primary text-sm">
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-6">
            <Zap className="w-3 h-3" />
            Now with AI Pattern Detection
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Your Trades, Journaled.<br />
            <span className="text-gradient">Your Edge, Revealed.</span>
          </h1>

          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            The AI-powered trading journal that auto-syncs your MT5 trades, tracks every metric,
            and helps you build real consistency in Forex, Gold, Indices & more.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <button
              onClick={() => navigate('/')}
              className="btn-primary text-base px-6 py-3 shadow-glow"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary text-base px-6 py-3">
              View Demo Dashboard
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="card p-4 shadow-glow-sm border border-brand-500/20">
            <div className="flex items-center gap-1.5 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
              <span className="ml-2 text-xs text-slate-500">app.projournx.com/dashboard</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Monthly P&L', value: '+$23,453', color: 'text-brand-400' },
                { label: 'Win Rate', value: '67.2%', color: 'text-white' },
                { label: 'Profit Factor', value: '3.8x', color: 'text-blue-400' },
                { label: 'Trades Today', value: '12 synced', color: 'text-amber-400' },
              ].map(m => (
                <div key={m.label} className="bg-dark-300 rounded-xl p-4 border border-surface-border">
                  <div className="text-xs text-slate-500 mb-1">{m.label}</div>
                  <div className={`text-lg font-bold ${m.color}`}>{m.value}</div>
                </div>
              ))}
            </div>
            <div className="h-24 bg-dark-300 rounded-xl border border-surface-border flex items-end px-4 pb-3 gap-1.5 overflow-hidden">
              {Array.from({ length: 21 }, (_, i) => {
                const height = Math.abs(Math.sin(i * 0.7) * 60 + 20);
                const positive = Math.sin(i * 0.7 + 1) > -0.2;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-sm opacity-75"
                    style={{ height: `${height}%`, background: positive ? '#10b981' : '#ef4444' }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">Everything You Need to <span className="text-gradient">Trade Smarter</span></h2>
            <p className="text-slate-400 max-w-xl mx-auto">7 powerful modules working together to help you analyze, track, and improve your performance.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(f => (
              <div key={f.title} className="card-hover p-5">
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-brand-400" />
                </div>
                <h3 className="font-semibold text-white mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-surface/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-2">Trusted by 500+ Traders</h2>
            <p className="text-slate-400">Real results from real traders</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {testimonials.map(t => (
              <div key={t.name} className="card p-5">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                  <div className="text-brand-400 font-bold text-sm">{t.pnl}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-2">Simple, Transparent Pricing</h2>
            <p className="text-slate-400">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {[
              {
                name: 'Free', price: '$0', period: 'forever', highlight: false,
                features: ['50 trades/month', 'Basic journal', 'Manual entry', '7-day history', 'Email support'],
                cta: 'Get Started Free',
              },
              {
                name: 'Pro', price: '$19', period: '/month', highlight: true,
                features: ['Unlimited trades', 'MT5 Auto-sync', 'AI Pattern Detection', 'Advanced analytics', 'Notebook + Playbooks', 'Prop firm mode', 'Priority support'],
                cta: 'Start 3-Day Free Trial',
              },
            ].map(p => (
              <div key={p.name} className={`card p-6 ${p.highlight ? 'border-brand-500/40 bg-gradient-to-b from-brand-500/5 to-transparent shadow-glow-sm' : ''}`}>
                {p.highlight && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-semibold mb-3">
                    <Zap className="w-3 h-3" /> Most Popular
                  </div>
                )}
                <div className="mb-4">
                  <div className="text-slate-400 text-sm">{p.name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{p.price}</span>
                    <span className="text-slate-400">{p.period}</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-5">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/')}
                  className={p.highlight ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}
                >
                  {p.cta} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Trade Like a Pro?</h2>
          <p className="text-slate-400 mb-8">Join 500+ traders who transformed their trading with data-driven insights.</p>
          <button onClick={() => navigate('/')} className="btn-primary text-lg px-8 py-4 shadow-glow-lg mx-auto">
            Start Free Trial Today <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-slate-600 mt-4">No credit card required · Cancel anytime · 3-day free trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-gradient-brand flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-white" />
            </div>
            <span className="text-slate-400 font-medium">ProJournX</span>
            <span>© 2026 Trader's Performance Lab</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-white cursor-pointer transition-colors">Support</span>
            <span className="hover:text-white cursor-pointer transition-colors">Blog</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

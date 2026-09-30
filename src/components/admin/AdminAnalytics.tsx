import React from 'react';
import { motion } from 'motion/react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, Eye, TrendingDown,
  Globe, RefreshCw, Loader2, AlertTriangle,
  BarChart2, ArrowUpRight,
} from 'lucide-react';
import { fetchAnalytics, AnalyticsData } from '../../services/adminAnalyticsService';

// ─── Palettes ────────────────────────────────────────────────────────────────
const COLORS = ['#1a56db', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString('fr-FR');

/** Convertit "20240924" → "24 Sep" */
const fmtDate = (d: string) => {
  if (d.length !== 8) return d;
  const year = d.slice(0, 4);
  const month = d.slice(4, 6);
  const day = d.slice(6, 8);
  return new Date(`${year}-${month}-${day}`).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

// ─── KPI Card ────────────────────────────────────────────────────────────────
const KPICard = ({
  title, value, icon: Icon, color, trendLabel,
}: {
  title: string; value: string; icon: any;
  color: string; trendLabel?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-black text-gray-900">{value}</h3>
      {trendLabel && <p className="text-[10px] text-gray-400 mt-0.5">{trendLabel}</p>}
    </div>
  </motion.div>
);

// ─── Period Selector ─────────────────────────────────────────────────────────
const PERIODS: { label: string; value: string }[] = [
  { label: '7 jours', value: '7daysAgo' },
  { label: '30 jours', value: '30daysAgo' },
  { label: '3 mois', value: '90daysAgo' },
];

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl px-4 py-3 text-sm">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name} : <span className="font-black">{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const AdminAnalytics = () => {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [period, setPeriod] = React.useState('30daysAgo');
  const [refreshing, setRefreshing] = React.useState(false);

  const load = React.useCallback(async (startDate: string, showSpinner = true) => {
    if (showSpinner) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const result = await fetchAnalytics(startDate);
      setData(result);
    } catch (e: any) {
      setError(e.message || 'Erreur lors du chargement des données analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { load(period); }, [period, load]);

  const handleRefresh = () => load(period, false);

  // ─── Loading state ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Chargement des données Google Analytics…</p>
      </div>
    );
  }

  // ─── Error state ──────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <div className="text-center max-w-md">
          <h3 className="font-black text-lg text-gray-800 mb-2">Données non disponibles</h3>
          <p className="text-sm text-gray-500 mb-1">{error}</p>
          <p className="text-xs text-gray-400 mb-6">
            Vérifiez que le backend Symfony est configuré avec le fichier de clé JSON
            et que l'endpoint <code className="bg-gray-100 px-1 rounded">/admin/analytics</code> est actif.
          </p>
          <button
            onClick={handleRefresh}
            className="h-10 px-6 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" /> Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // ─── Prepare chart data ───────────────────────────────────────────────────
  const dailyChartData = data.daily.map(d => ({
    date: fmtDate(d.date),
    Visiteurs: d.visiteurs,
    'Pages vues': d.pagesVues,
  }));

  const sourcesChartData = data.sources.map(s => ({
    name: s.source,
    value: s.visiteurs,
  }));

  const topPagesData = data.topPages.slice(0, 8).map(p => ({
    page: p.page.length > 28 ? p.page.slice(0, 28) + '…' : p.page,
    Visiteurs: p.visiteurs,
  }));

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Analytiques du Site</h2>
          <p className="text-sm text-gray-400 font-medium mt-0.5">
            Données en temps réel via Google Analytics 4 — donaldgrosonline.com
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  period === p.value
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-9 w-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Visiteurs uniques"
          value={fmt(data.overview.totalVisiteurs)}
          icon={Users}
          color="bg-blue-600"
          trendLabel={`Sur les ${PERIODS.find(p => p.value === period)?.label}`}
        />
        <KPICard
          title="Pages vues"
          value={fmt(data.overview.totalPagesVues)}
          icon={Eye}
          color="bg-green-600"
        />
        <KPICard
          title="Pages / session"
          value={data.overview.moyennePagesParSession.toFixed(1)}
          icon={BarChart2}
          color="bg-amber-500"
        />
        <KPICard
          title="Taux de rebond"
          value={`${data.overview.tauxRebond.toFixed(1)}%`}
          icon={TrendingDown}
          color="bg-violet-600"
          trendLabel="Plus bas = mieux"
        />
      </div>

      {/* ── Area Chart : Trafic quotidien ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-black text-gray-900">Trafic quotidien</h3>
            <p className="text-xs text-gray-400 mt-0.5">Visiteurs et pages vues jour par jour</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />Visiteurs
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />Pages vues
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={dailyChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="gradVisiteurs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1a56db" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1a56db" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPages" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Visiteurs" stroke="#1a56db" strokeWidth={2.5} fill="url(#gradVisiteurs)" dot={false} />
            <Area type="monotone" dataKey="Pages vues" stroke="#16a34a" strokeWidth={2.5} fill="url(#gradPages)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── Bottom Row : Sources + Top Pages ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Sources de trafic */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-black text-gray-900">Sources de trafic</h3>
              <p className="text-xs text-gray-400 mt-0.5">D'où viennent vos visiteurs</p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={sourcesChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sourcesChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [fmt(v), 'Visiteurs']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2 w-full">
              {sourcesChartData.map((s, i) => {
                const total = sourcesChartData.reduce((a, x) => a + x.value, 0);
                const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="flex-1 text-gray-600 font-medium truncate capitalize">{s.name || 'Direct'}</span>
                    <span className="font-black text-gray-900 text-xs">{fmt(s.value)}</span>
                    <span className="text-gray-400 text-xs w-10 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Top Pages */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <ArrowUpRight className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="font-black text-gray-900">Pages les plus visitées</h3>
              <p className="text-xs text-gray-400 mt-0.5">Classement par nombre de visiteurs</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topPagesData} layout="vertical" margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="page"
                width={120}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Visiteurs" fill="#1a56db" radius={[0, 6, 6, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

      </div>

      {/* ── Footer note ──────────────────────────────────────────────────── */}
      <p className="text-center text-xs text-gray-400 pb-2">
        Données fournies par <strong>Google Analytics 4</strong> · Propriété <code>G-J244J03SRF</code> · donaldgrosonline.com
      </p>
    </div>
  );
};

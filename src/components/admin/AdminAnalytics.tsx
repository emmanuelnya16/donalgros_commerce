/**
 * AdminAnalytics.tsx - Donald Gros E-commerce
 *
 * Page "Analytiques" du dashboard admin.
 * Affiche les statistiques de visites depuis notre tracker maison (backend Symfony).
 *
 * Sections :
 *   - KPI Cards    : total visites, visiteurs uniques, aujourd hui, semaine, mois
 *   - Area Chart   : visites par jour (7j / 30j)
 *   - Bar Chart    : top pages visitees
 *   - Donut Chart  : sources de trafic (referrers)
 *   - Bar Chart    : heures de pointe (0-23h)
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Eye, Users, TrendingUp, Calendar,
  Globe, Clock, BarChart2, RefreshCw, AlertCircle,
} from 'lucide-react';
import {
  getStatsOverview, getVisitsPerDay, getTopPages, getReferrers, getPeakHours,
  type StatsOverview, type DailyVisit, type TopPage, type Referrer, type PeakHour,
} from '../../services/adminAnalyticsService';

// Palette couleurs
const COLORS = ['#1a56db', '#16a34a', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

// Periodes disponibles pour le graphique trafic
const PERIODS = [
  { label: '7 derniers jours', value: 7 },
  { label: '30 derniers jours', value: 30 },
  { label: '90 derniers jours', value: 90 },
];

// Formate un nombre avec separateur milliers
const fmt = (n: number) => n.toLocaleString('fr-FR');

// Formate une date "2026-10-01" -> "01/10"
const fmtDay = (d: string) => {
  const parts = d.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : d;
};

// Formate une heure en "18h"
const fmtHour = (h: number) => `${h}h`;

// ── KPI Card ────────────────────────────────────────────────────────────────
interface KPICardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  sub?: string;
}
const KPICard = ({ title, value, icon: Icon, color, sub }: KPICardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
  >
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider truncate">{title}</p>
      <p className="text-2xl font-black text-gray-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </motion.div>
);

// ── Tooltip personnalise ────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-xl px-4 py-3 text-sm">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? p.fill }} className="font-semibold">
          {p.name} : {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

// ── Loading skeleton ────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
);

// ── Composant principal ─────────────────────────────────────────────────────
export const AdminAnalytics = () => {
  const [period, setPeriod] = React.useState(30);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [overview, setOverview] = React.useState<StatsOverview | null>(null);
  const [daily, setDaily] = React.useState<DailyVisit[]>([]);
  const [topPages, setTopPages] = React.useState<TopPage[]>([]);
  const [referrers, setReferrers] = React.useState<Referrer[]>([]);
  const [peakHours, setPeakHours] = React.useState<PeakHour[]>([]);

  const loadAll = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, dv, tp, rf, ph] = await Promise.all([
        getStatsOverview(),
        getVisitsPerDay(period),
        getTopPages(10),
        getReferrers(8),
        getPeakHours(),
      ]);
      setOverview(ov);
      setDaily(dv);
      setTopPages(tp);
      setReferrers(rf);
      setPeakHours(ph);
    } catch (e: any) {
      setError('Impossible de charger les statistiques. Verifez la connexion au backend.');
      console.error('[AdminAnalytics]', e);
    } finally {
      setLoading(false);
    }
  }, [period]);

  React.useEffect(() => { loadAll(); }, [loadAll]);

  // Donnees transformees pour les graphiques
  const dailyChartData = daily.map(d => ({
    date: fmtDay(d.day),
    Visites: d.visits,
  }));

  const topPagesData = topPages.map(p => ({
    page: p.page.length > 22 ? p.page.slice(0, 22) + '...' : p.page,
    Visites: p.visits,
  }));

  const referrersChartData = referrers.map(r => ({
    name: r.source === '' ? 'Direct' : r.source.replace('https://', '').replace('http://', '').split('/')[0],
    value: r.visits,
  }));

  const peakHoursData = peakHours.map(h => ({
    heure: fmtHour(h.hour),
    Visites: h.visits,
  }));

  // ── Etat d erreur ──────────────────────────────────────────────────────────
  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-gray-600 font-semibold text-center max-w-sm">{error}</p>
        <button
          onClick={loadAll}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Reessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900">Analytiques du site</h2>
          <p className="text-xs text-gray-400 mt-0.5">Statistiques de visites - donaldgrosonline.com</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Selecteur de periode */}
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-2 text-xs font-bold transition-colors ${
                  period === p.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {p.value}j
              </button>
            ))}
          </div>
          {/* Bouton rafraichir */}
          <button
            onClick={loadAll}
            disabled={loading}
            className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i}><Skeleton className="h-24" /></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard title="Total visites" value={fmt(overview?.totalVisits ?? 0)} icon={Eye} color="bg-blue-600" />
          <KPICard title="Visiteurs uniques" value={fmt(overview?.uniqueVisitors ?? 0)} icon={Users} color="bg-violet-600" />
          <KPICard title="Aujourd hui" value={fmt(overview?.visitsToday ?? 0)} icon={Calendar} color="bg-green-600" sub="visites" />
          <KPICard title="Cette semaine" value={fmt(overview?.visitsThisWeek ?? 0)} icon={TrendingUp} color="bg-amber-500" sub="visites" />
          <KPICard title="Ce mois" value={fmt(overview?.visitsThisMonth ?? 0)} icon={BarChart2} color="bg-rose-500" sub="visites" />
        </div>
      )}

      {/* ── Graphique trafic quotidien (Area Chart) ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-black text-gray-900">Trafic quotidien</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {PERIODS.find(p => p.value === period)?.label}
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Visites
          </span>
        </div>
        {loading ? (
          <Skeleton className="h-[260px]" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dailyChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="gradVisites" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a56db" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1a56db" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Visites" stroke="#1a56db" strokeWidth={2.5} fill="url(#gradVisites)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* ── Ligne 2 : Sources + Top Pages ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Sources de trafic (Donut + tableau) */}
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
              <p className="text-xs text-gray-400 mt-0.5">D ou viennent vos visiteurs</p>
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-[200px]" />
          ) : referrersChartData.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">Aucune donnee disponible</p>
          ) : (
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={referrersChartData} cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={3} dataKey="value">
                    {referrersChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => [fmt(v), 'Visites']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 w-full">
                {referrersChartData.map((s, i) => {
                  const total = referrersChartData.reduce((a, x) => a + x.value, 0);
                  const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                  return (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="flex-1 text-gray-600 font-medium truncate">{s.name || 'Direct'}</span>
                      <span className="font-black text-gray-900 text-xs">{fmt(s.value)}</span>
                      <span className="text-gray-400 text-xs w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Top Pages (Bar Chart horizontal) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="font-black text-gray-900">Pages les plus visitees</h3>
              <p className="text-xs text-gray-400 mt-0.5">Classement par nombre de visites</p>
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-[240px]" />
          ) : topPagesData.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">Aucune donnee disponible</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topPagesData} layout="vertical" margin={{ left: 0, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="page" width={130} tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Visites" fill="#1a56db" radius={[0, 6, 6, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* ── Heures de pointe (Bar Chart) ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="font-black text-gray-900">Heures de pointe</h3>
            <p className="text-xs text-gray-400 mt-0.5">Visites par heure de la journee (0h - 23h)</p>
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-[200px]" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={peakHoursData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="heure" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Visites" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Footer note */}
      <p className="text-center text-xs text-gray-400 pb-2">
        Donnees collectees par le <strong>tracker maison Donald Gros</strong> - donaldgrosonline.com
      </p>

    </div>
  );
};


import React from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  AlertTriangle,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ChevronRight,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Loader2,
  Smartphone,
  PackageX,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { fetchDashboard, DashboardData } from '../../services/adminDashboardService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('fr-FR');

const pctChange = (today: number, yesterday: number): { pct: number; positive: boolean } => {
  if (yesterday === 0) return { pct: 0, positive: true };
  const pct = Math.round(((today - yesterday) / yesterday) * 100);
  return { pct: Math.abs(pct), positive: pct >= 0 };
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const KPICard = ({
  title, value, subtitle, change, isPositive, accentColor, icon: Icon,
}: {
  title: string; value: string; subtitle?: string;
  change?: number; isPositive?: boolean;
  accentColor: string; icon: any;
}) => (
  <div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-4 hover:shadow-md transition-all ${accentColor}`}>
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-xl bg-gray-50`}>
        <Icon className="w-5 h-5 text-gray-500" />
      </div>
      {change !== undefined && (
        <span className={`text-[10px] font-black flex items-center gap-0.5 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}%
        </span>
      )}
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-2xl font-black text-gray-900 mb-0.5">{value}</h3>
    {subtitle && <p className="text-[10px] text-gray-400 font-medium">{subtitle}</p>}
  </div>
);

// ─── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { bg: string; text: string; icon: any }> = {
  pending_payment: { bg: 'bg-amber-50',  text: 'text-amber-700',  icon: Clock },
  confirmed:       { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: CheckCircle2 },
  processing:      { bg: 'bg-orange-50', text: 'text-orange-700', icon: Package },
  shipped:         { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: Truck },
  delivered:       { bg: 'bg-green-50',  text: 'text-green-700',  icon: CheckCircle2 },
  cancelled:       { bg: 'bg-gray-100',  text: 'text-gray-600',   icon: XCircle },
  pending_cod:     { bg: 'bg-purple-50', text: 'text-purple-700', icon: Clock },
  payment_failed:  { bg: 'bg-red-50',    text: 'text-red-700',    icon: AlertTriangle },
};

const StatusPill = ({ status, label }: { status: string; label: string }) => {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.cancelled;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${s.bg} ${s.text}`}>
      <Icon className="w-2.5 h-2.5" />{label}
    </span>
  );
};

// ─── Composant principal ───────────────────────────────────────────────────────

export const AdminDashboard = () => {
  const [data, setData]       = React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await fetchDashboard();
      setData(d);
    } catch {
      setError('Impossible de charger les données du tableau de bord.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  // ── Loading ──
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-400">
      <Loader2 className="w-8 h-8 animate-spin" />
      <p className="text-sm font-medium">Chargement du tableau de bord...</p>
    </div>
  );

  // ── Erreur ──
  if (error || !data) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-400">
      <AlertTriangle className="w-8 h-8 text-red-400" />
      <p className="text-sm font-medium text-red-500">{error}</p>
      <button onClick={load} className="text-xs font-bold text-[#1E3A8A] hover:underline flex items-center gap-1">
        <RefreshCw className="w-3.5 h-3.5" /> Réessayer
      </button>
    </div>
  );

  const { kpis, ordersByStatus, revenueChart, latestOrders, topProducts } = data;
  const revChange = pctChange(kpis.revenueToday, kpis.revenueYesterday);

  // Données pour le BarChart des statuts
  const statusBarData = [
    { name: 'Confirmées', value: ordersByStatus.confirmed,  fill: '#3B82F6' },
    { name: 'Préparation', value: ordersByStatus.processing, fill: '#F59E0B' },
    { name: 'Expédiées',   value: ordersByStatus.shipped,    fill: '#6366F1' },
    { name: 'Livrées',    value: ordersByStatus.delivered,   fill: '#10B981' },
    { name: 'Annulées',   value: ordersByStatus.cancelled,   fill: '#6B7280' },
    { name: 'COD',        value: ordersByStatus.pending_cod, fill: '#8B5CF6' },
  ];

  return (
    <div className="space-y-6 pb-12">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-black text-xl text-gray-900 tracking-tight">Tableau de Bord</h1>
          <p className="text-[11px] text-gray-400 font-medium">Données en temps réel · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <button onClick={load} className="h-9 px-4 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-50 transition-all flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Actualiser
        </button>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: "CA du Jour",
            value: `${fmt(kpis.revenueToday)} F`,
            subtitle: `Hier : ${fmt(kpis.revenueYesterday)} F`,
            change: revChange.pct,
            isPositive: revChange.positive,
            accentColor: 'border-l-green-500',
            icon: DollarSign,
          },
          {
            title: "Commandes Aujourd'hui",
            value: String(kpis.ordersToday),
            subtitle: `${ordersByStatus.processing} en préparation · ${ordersByStatus.shipped} expédiées`,
            accentColor: 'border-l-blue-500',
            icon: ShoppingBag,
          },
          {
            title: "Nouveaux Clients ce Mois",
            value: `+${fmt(kpis.newClientsThisMonth)}`,
            subtitle: "Inscrits sur la plateforme",
            accentColor: 'border-l-purple-500',
            icon: Users,
          },
          {
            title: "Ruptures de Stock",
            value: String(kpis.outOfStock),
            subtitle: `${kpis.lowStock} variante${kpis.lowStock > 1 ? 's' : ''} en stock critique (≤3)`,
            accentColor: kpis.outOfStock > 0 ? 'border-l-red-500' : 'border-l-green-500',
            icon: kpis.outOfStock > 0 ? PackageX : Package,
          },
          {
            title: "Panier Moyen",
            value: kpis.avgOrderValue > 0 ? `${fmt(kpis.avgOrderValue)} F` : '—',
            subtitle: "Commandes confirmées ce mois",
            accentColor: 'border-l-orange-500',
            icon: CreditCard,
          },
          {
            title: "Paiement Mobile",
            value: `${kpis.mobilePaymentRate}%`,
            subtitle: "MTN MoMo & Orange Money ce mois",
            accentColor: 'border-l-sky-500',
            icon: Smartphone,
          },
        ].map((kpi, idx) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <KPICard {...kpi} />
          </motion.div>
        ))}
      </div>

      {/* ── Graphiques ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Courbe CA 7 jours */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[340px]">
          <div className="mb-4">
            <h3 className="font-black text-base text-gray-900">Chiffre d'Affaires — 7 derniers jours</h3>
            <p className="text-[11px] text-gray-400">Uniquement les commandes payées</p>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1E3A8A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: 12 }}
                  formatter={(val: number) => [`${fmt(val)} F`, 'CA']}
                />
                <Area type="monotone" dataKey="amount" stroke="#1E3A8A" strokeWidth={2.5} fillOpacity={1} fill="url(#gradRevenue)" dot={{ fill: '#1E3A8A', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Barres — répartition par statut */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[340px]">
          <div className="mb-4">
            <h3 className="font-black text-base text-gray-900">Répartition par Statut</h3>
            <p className="text-[11px] text-gray-400">Toutes les commandes actives</p>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBarData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} width={80} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: 12 }}
                  formatter={(val: number) => [val, 'commandes']}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
                  {statusBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Dernières commandes + Top produits ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Tableau dernières commandes */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-black text-base text-gray-900">Dernières Commandes</h3>
            <button
              onClick={() => { window.location.hash = 'admin/orders'; }}
              className="text-[10px] font-black text-[#1E3A8A] flex items-center gap-1 hover:underline uppercase tracking-wider"
            >
              VOIR TOUT <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-5 py-3">Commande</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {latestOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400 italic">
                      Aucune commande pour le moment
                    </td>
                  </tr>
                ) : latestOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#1E3A8A]/5 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-black text-[#1E3A8A]">{order.orderNumber}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-bold text-gray-800">{order.client?.fullName ?? '—'}</p>
                      <p className="text-[10px] text-gray-400">{order.client?.phone}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-black text-gray-800">{fmt(order.totalAmount)} F</td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={order.status} label={order.statusLabel} />
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => { window.location.hash = 'admin/orders'; }}
                        className="p-1 text-gray-400 hover:text-[#1E3A8A] transition-colors"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top produits */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-black text-base text-gray-900">Top Ventes</h3>
            <span className="text-[10px] font-black text-white bg-amber-500 px-2 py-0.5 rounded-full">ALL TIME</span>
          </div>
          <div className="p-4 space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-6">Aucune vente enregistrée</p>
            ) : topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden border border-gray-100">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-sm
                    ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-gray-300'}`}>
                    {i + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {p.category ? p.category.toUpperCase() : '—'} · {p.salesCount} ventes
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-[#1E3A8A]">{fmt(p.salesCount * p.basePrice)} F</p>
                </div>
              </div>
            ))}
          </div>
          {topProducts.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
              <button
                onClick={() => { window.location.hash = 'admin/products'; }}
                className="text-[10px] font-black text-gray-400 hover:text-gray-700 uppercase tracking-widest transition-colors"
              >
                Voir tous les produits
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart,
  Search,
  ChevronRight,
  ChevronLeft,
  Truck,
  Package,
  XCircle,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  CreditCard,
  MapPin,
  Phone,
  RefreshCw,
  FileText,
  StickyNote,
  ChevronDown,
  Loader2,
  Filter,
  ArrowRight,
  Ban,
  PackageCheck,
} from 'lucide-react';
import {
  fetchOrders,
  fetchOrderDetail,
  updateOrderStatus,
  updateOrderNotes,
  OrderListItem,
  OrderDetail,
  OrderStatus,
  OrderFilters,
  OrderStats,
} from '../../services/adminOrderService';

// ─── Config visuelle par statut ───────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; border: string; icon: any }> = {
  pending_payment: { label: 'En attente paiement', color: 'text-amber-700', bg: 'bg-amber-50',    border: 'border-amber-200', icon: Clock },
  payment_failed:  { label: 'Paiement échoué',     color: 'text-red-700',   bg: 'bg-red-50',      border: 'border-red-200',   icon: AlertTriangle },
  confirmed:       { label: 'Confirmée',            color: 'text-blue-700',  bg: 'bg-blue-50',     border: 'border-blue-200',  icon: CheckCircle2 },
  processing:      { label: 'En préparation',       color: 'text-orange-700',bg: 'bg-orange-50',   border: 'border-orange-200',icon: Package },
  shipped:         { label: 'Expédiée',             color: 'text-indigo-700',bg: 'bg-indigo-50',   border: 'border-indigo-200',icon: Truck },
  delivered:       { label: 'Livrée',               color: 'text-green-700', bg: 'bg-green-50',    border: 'border-green-200', icon: PackageCheck },
  cancelled:       { label: 'Annulée',              color: 'text-gray-600',  bg: 'bg-gray-100',    border: 'border-gray-200',  icon: XCircle },
  pending_cod:     { label: 'Paiement à la livraison', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: FileText },
};

const TRANSITION_STYLE: Record<string, { bg: string; hover: string; text: string; icon: any }> = {
  processing: { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', text: 'text-white', icon: Package },
  shipped:    { bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600', text: 'text-white', icon: Truck },
  delivered:  { bg: 'bg-green-500',  hover: 'hover:bg-green-600',  text: 'text-white', icon: PackageCheck },
  confirmed:  { bg: 'bg-blue-500',   hover: 'hover:bg-blue-600',   text: 'text-white', icon: CheckCircle2 },
  cancelled:  { bg: 'bg-gray-100',   hover: 'hover:bg-gray-200',   text: 'text-gray-700', icon: Ban },
};

// ─── Badge statut ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.cancelled;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, count, color, onClick, active }: {
  label: string; count: number; color: string; onClick: () => void; active: boolean;
}) => (
  <button
    onClick={onClick}
    className={`flex-1 min-w-[100px] p-3 rounded-xl border transition-all text-left
      ${active ? 'border-[#1E3A8A] bg-[#1E3A8A]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}
  >
    <p className={`text-xl font-black ${active ? 'text-[#1E3A8A]' : 'text-gray-800'}`}>{count}</p>
    <p className={`text-[10px] font-bold uppercase tracking-wider ${color}`}>{label}</p>
  </button>
);

// ─── Composant principal ──────────────────────────────────────────────────────

export const AdminOrders = () => {
  // Liste
  const [orders, setOrders]         = React.useState<OrderListItem[]>([]);
  const [stats, setStats]           = React.useState<OrderStats | null>(null);
  const [total, setTotal]           = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [page, setPage]             = React.useState(1);
  const [loading, setLoading]       = React.useState(true);
  const [error, setError]           = React.useState<string | null>(null);

  // Filtres
  const [search, setSearch]               = React.useState('');
  const [filterStatus, setFilterStatus]   = React.useState<string>('');
  const [filterPayment, setFilterPayment] = React.useState<string>('');

  // Détail
  const [selectedId, setSelectedId]         = React.useState<number | null>(null);
  const [detail, setDetail]                 = React.useState<OrderDetail | null>(null);
  const [loadingDetail, setLoadingDetail]   = React.useState(false);

  // Actions
  const [actionLoading, setActionLoading]   = React.useState<string | null>(null); // id de transition en cours
  const [actionNote, setActionNote]         = React.useState('');
  const [showNoteInput, setShowNoteInput]   = React.useState(false);
  const [pendingTransition, setPendingTransition] = React.useState<string | null>(null);

  // Notes
  const [notesText, setNotesText]   = React.useState('');
  const [savingNotes, setSavingNotes] = React.useState(false);
  const [notesSaved, setNotesSaved]   = React.useState(false);

  const searchTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Chargement de la liste ──────────────────────────────────────────────────

  const loadOrders = React.useCallback(async (filters: OrderFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchOrders(filters);
      setOrders(result.orders);
      setStats(result.stats);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setPage(result.page);
    } catch {
      setError('Impossible de charger les commandes. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadOrders({ status: filterStatus, paymentMethod: filterPayment, page, limit: 20 });
  }, [filterStatus, filterPayment, page]);

  // Recherche avec debounce 400ms
  const handleSearchChange = (v: string) => {
    setSearch(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      loadOrders({ search: v, status: filterStatus, paymentMethod: filterPayment, page: 1, limit: 20 });
    }, 400);
  };

  // ── Chargement du détail ──────────────────────────────────────────────────

  const handleSelectOrder = async (id: number) => {
    if (selectedId === id) { setSelectedId(null); setDetail(null); return; }
    setSelectedId(id);
    setDetail(null);
    setLoadingDetail(true);
    setActionNote('');
    setShowNoteInput(false);
    setPendingTransition(null);
    try {
      const d = await fetchOrderDetail(id);
      setDetail(d);
      setNotesText(d.adminNotes ?? '');
    } catch {
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ── Action sur le statut ──────────────────────────────────────────────────

  const handleTransitionClick = (status: string) => {
    setPendingTransition(status);
    setShowNoteInput(true);
    setActionNote('');
  };

  const handleConfirmTransition = async () => {
    if (!detail || !pendingTransition) return;
    setActionLoading(pendingTransition);
    try {
      await updateOrderStatus(detail.id, pendingTransition as OrderStatus, actionNote || undefined);
      // Recharge le détail avec les nouvelles transitions
      const updated = await fetchOrderDetail(detail.id);
      setDetail(updated);
      // Met à jour la ligne dans la liste
      setOrders(prev => prev.map(o =>
        o.id === detail.id ? { ...o, status: updated.status, statusLabel: updated.statusLabel } : o
      ));
      setShowNoteInput(false);
      setPendingTransition(null);
      setActionNote('');
      // Recharge les stats
      loadOrders({ status: filterStatus, paymentMethod: filterPayment, search, page, limit: 20 });
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Erreur lors de la mise à jour.');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Sauvegarde des notes ──────────────────────────────────────────────────

  const handleSaveNotes = async () => {
    if (!detail) return;
    setSavingNotes(true);
    try {
      await updateOrderNotes(detail.id, notesText);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch {
      alert('Erreur lors de la sauvegarde des notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 h-full">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#1E3A8A]/10 text-[#1E3A8A] rounded-xl">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-xl text-gray-900 tracking-tight">Gestion des Commandes</h1>
            <p className="text-[11px] text-gray-500 font-medium">
              {total} commande{total > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>
        <button
          onClick={() => loadOrders({ status: filterStatus, paymentMethod: filterPayment, search, page, limit: 20 })}
          className="h-10 px-4 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2 self-start"
        >
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* ── Stats rapides ── */}
      {stats && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <StatCard label="Confirmées"    count={stats.confirmed}  color="text-blue-600"   onClick={() => { setFilterStatus(filterStatus === 'confirmed' ? '' : 'confirmed'); setPage(1); }}   active={filterStatus === 'confirmed'} />
          <StatCard label="Préparation"   count={stats.processing} color="text-orange-600" onClick={() => { setFilterStatus(filterStatus === 'processing' ? '' : 'processing'); setPage(1); }} active={filterStatus === 'processing'} />
          <StatCard label="Expédiées"     count={stats.shipped}    color="text-indigo-600" onClick={() => { setFilterStatus(filterStatus === 'shipped' ? '' : 'shipped'); setPage(1); }}       active={filterStatus === 'shipped'} />
          <StatCard label="Livrées"       count={stats.delivered}  color="text-green-600"  onClick={() => { setFilterStatus(filterStatus === 'delivered' ? '' : 'delivered'); setPage(1); }}   active={filterStatus === 'delivered'} />
          <StatCard label="Livraison COD" count={stats.pending_cod}color="text-purple-600" onClick={() => { setFilterStatus(filterStatus === 'pending_cod' ? '' : 'pending_cod'); setPage(1); }}active={filterStatus === 'pending_cod'} />
          <StatCard label="Annulées"      count={stats.cancelled}  color="text-gray-500"   onClick={() => { setFilterStatus(filterStatus === 'cancelled' ? '' : 'cancelled'); setPage(1); }}   active={filterStatus === 'cancelled'} />
        </div>
      )}

      {/* ── Filtres ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Rechercher #commande, téléphone, nom..."
            className="w-full h-10 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-[#1E3A8A] transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={filterPayment}
            onChange={e => { setFilterPayment(e.target.value); setPage(1); }}
            className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#1E3A8A] transition-all"
          >
            <option value="">Tous les paiements</option>
            <option value="mtn_momo">MTN MoMo</option>
            <option value="orange_money">Orange Money</option>
            <option value="cash_on_delivery">Paiement livraison</option>
          </select>
          {(filterStatus || filterPayment || search) && (
            <button
              onClick={() => { setFilterStatus(''); setFilterPayment(''); setSearch(''); setPage(1); loadOrders({ page: 1, limit: 20 }); }}
              className="h-10 px-3 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* ── Zone principale (liste + détail) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">

        {/* ── Liste des commandes ── */}
        <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${detail || loadingDetail ? 'xl:col-span-5' : 'xl:col-span-12'}`}>

          {/* Erreur */}
          {error && (
            <div className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <button onClick={() => loadOrders({ page, limit: 20 })} className="mt-3 text-xs font-bold text-[#1E3A8A] hover:underline">
                Réessayer
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && !error && (
            <div className="p-12 flex flex-col items-center gap-3 text-gray-400">
              <Loader2 className="w-7 h-7 animate-spin" />
              <p className="text-sm font-medium">Chargement des commandes...</p>
            </div>
          )}

          {/* Liste */}
          {!loading && !error && (
            <>
              <div className="divide-y divide-gray-100 overflow-y-auto max-h-[65vh] no-scrollbar">
                {orders.length === 0 ? (
                  <div className="p-12 text-center text-sm text-gray-400 italic font-medium">
                    Aucune commande trouvée pour ces filtres.
                  </div>
                ) : orders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status];
                  const Icon = cfg?.icon ?? Clock;
                  const isSelected = selectedId === order.id;
                  return (
                    <motion.div
                      key={order.id}
                      layoutId={`order-${order.id}`}
                      onClick={() => handleSelectOrder(order.id)}
                      className={`p-4 cursor-pointer transition-all hover:bg-gray-50 relative border-l-4
                        ${isSelected ? 'border-l-[#1E3A8A] bg-[#1E3A8A]/5' : 'border-l-transparent'}
                      `}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-sm font-black text-[#1E3A8A]">{order.orderNumber}</span>
                        <span className="text-[10px] font-medium text-gray-400">{order.createdAt}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">
                            {order.client?.fullName ?? 'Client inconnu'}
                          </p>
                          <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5">
                            {order.client?.phone && <><Phone className="w-2.5 h-2.5" /> {order.client.phone}</>}
                            {order.client?.city && <><span>•</span> {order.client.city}</>}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${cfg?.bg} ${cfg?.color} ${cfg?.border}`}>
                            <Icon className="w-2.5 h-2.5" />
                            {cfg?.label ?? order.statusLabel}
                          </span>
                          <span className="text-xs font-black text-gray-800">
                            {order.totalAmount.toLocaleString()} F
                          </span>
                        </div>
                      </div>
                      {order.itemsCount > 0 && (
                        <p className="text-[10px] text-gray-400 mt-1">{order.itemsCount} article{order.itemsCount > 1 ? 's' : ''}</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-gray-500">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Panneau détail ── */}
        <AnimatePresence mode="wait">
          {(detail || loadingDetail) && (
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
              className="xl:col-span-7 space-y-4"
            >
              {/* Loading détail */}
              {loadingDetail && !detail && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center gap-3 text-gray-400">
                  <Loader2 className="w-7 h-7 animate-spin" />
                  <p className="text-sm font-medium">Chargement du détail...</p>
                </div>
              )}

              {detail && (
                <>
                  {/* ── Card principale ── */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Header commande */}
                    <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-lg font-black text-gray-900">{detail.orderNumber}</h2>
                          <StatusBadge status={detail.status} />
                        </div>
                        <p className="text-xs text-gray-400 font-medium">Passée le {detail.createdAt}</p>
                      </div>
                      <button
                        onClick={() => { setSelectedId(null); setDetail(null); }}
                        className="self-start sm:self-auto text-xs text-gray-400 hover:text-gray-600 font-bold hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Fermer ✕
                      </button>
                    </div>

                    {/* Infos client / adresse / paiement */}
                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5 border-b border-gray-100">

                      {/* Client */}
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                          <Users className="w-3 h-3" /> Client
                        </p>
                        {detail.deliveryAddress ? (
                          <div className="space-y-1.5">
                            <p className="text-sm font-bold text-gray-800">{detail.deliveryAddress.fullName}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Phone className="w-3 h-3" />
                              <a href={`tel:${detail.deliveryAddress.phone}`} className="font-medium hover:text-[#1E3A8A] transition-colors">
                                {detail.deliveryAddress.phone}
                              </a>
                            </div>
                            {detail.user && (
                              <p className="text-[10px] text-gray-400">Compte #{detail.user.id}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">Adresse non disponible</p>
                        )}
                      </div>

                      {/* Adresse */}
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                          <MapPin className="w-3 h-3" /> Livraison
                        </p>
                        {detail.deliveryAddress ? (
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-gray-800">{detail.deliveryAddress.city}</p>
                            <p className="text-xs text-gray-500">{detail.deliveryAddress.district}</p>
                            {detail.deliveryAddress.street && (
                              <p className="text-xs text-gray-500">{detail.deliveryAddress.street}</p>
                            )}
                            {detail.deliveryAddress.instructions && (
                              <p className="text-[10px] text-amber-600 font-medium mt-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                ℹ️ {detail.deliveryAddress.instructions}
                              </p>
                            )}
                          </div>
                        ) : <p className="text-sm text-gray-400 italic">—</p>}
                      </div>

                      {/* Paiement */}
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                          <CreditCard className="w-3 h-3" /> Paiement
                        </p>
                        {detail.payment ? (
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-gray-800">{detail.payment.providerLabel}</p>
                            <p className={`text-[10px] font-black uppercase ${detail.payment.status === 'confirmed' ? 'text-green-600' : 'text-amber-600'}`}>
                              {detail.payment.status === 'confirmed' ? '✓ Confirmé' : detail.payment.status}
                            </p>
                            {detail.payment.confirmedAt && (
                              <p className="text-[10px] text-gray-400">le {detail.payment.confirmedAt}</p>
                            )}
                            {detail.payment.failureMessage && (
                              <p className="text-[10px] text-red-500 mt-1">{detail.payment.failureMessage}</p>
                            )}
                          </div>
                        ) : <p className="text-sm text-gray-400 italic">—</p>}
                      </div>
                    </div>

                    {/* Articles */}
                    <div className="p-5 border-b border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                        Articles ({detail.items.length})
                      </p>
                      <div className="space-y-2">
                        {detail.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Package className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 truncate">{item.productName}</p>
                              {item.variantLabel && (
                                <p className="text-[11px] text-gray-500">{item.variantLabel}</p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs text-gray-400 font-bold">×{item.quantity}</p>
                              <p className="text-sm font-black text-gray-800">{item.subtotal.toLocaleString()} F</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totaux */}
                    <div className="p-5 bg-gray-50">
                      <div className="space-y-2 max-w-xs ml-auto">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Sous-total articles</span>
                          <span className="font-bold">{detail.itemsTotal.toLocaleString()} F</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Frais de livraison</span>
                          <span className="font-bold">+{detail.deliveryFee.toLocaleString()} F</span>
                        </div>
                        {detail.paymentFee > 0 && (
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Frais de paiement mobile</span>
                            <span className="font-bold">+{detail.paymentFee.toLocaleString()} F</span>
                          </div>
                        )}
                        {detail.discountAmount > 0 && (
                          <div className="flex justify-between text-xs text-green-600">
                            <span>Réduction {detail.promoCodeUsed ? `(${detail.promoCodeUsed})` : ''}</span>
                            <span className="font-bold">-{detail.discountAmount.toLocaleString()} F</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-200">
                          <span>TOTAL</span>
                          <span className="text-[#1E3A8A] text-base">{detail.totalAmount.toLocaleString()} F</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Actions livraison ── */}
                  {detail.availableTransitions.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5" /> Actions de livraison
                      </p>

                      {/* Boutons de transition */}
                      {!showNoteInput && (
                        <div className="flex flex-wrap gap-2">
                          {detail.availableTransitions.map((t) => {
                            const style = TRANSITION_STYLE[t.status] ?? TRANSITION_STYLE.cancelled;
                            const Icon = style.icon;
                            return (
                              <button
                                key={t.status}
                                onClick={() => handleTransitionClick(t.status)}
                                disabled={!!actionLoading}
                                className={`flex items-center gap-2 px-4 h-10 rounded-xl font-bold text-xs transition-all ${style.bg} ${style.hover} ${style.text} disabled:opacity-50`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                                {t.label}
                                <ArrowRight className="w-3 h-3 opacity-60" />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Confirmation avec note optionnelle */}
                      {showNoteInput && pendingTransition && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3"
                        >
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <ArrowRight className="w-4 h-4 text-[#1E3A8A]" />
                            Transition vers : <StatusBadge status={pendingTransition as OrderStatus} />
                          </div>
                          <textarea
                            value={actionNote}
                            onChange={e => setActionNote(e.target.value)}
                            placeholder="Note optionnelle (ex: Remis à Yaounde Express, suivi: XYZ123)"
                            className="w-full h-20 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium resize-none outline-none focus:border-[#1E3A8A] focus:bg-white transition-all"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleConfirmTransition}
                              disabled={!!actionLoading}
                              className="flex-1 h-10 bg-[#1E3A8A] text-white rounded-xl font-bold text-xs hover:bg-[#1E3A8A]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              Confirmer & envoyer SMS
                            </button>
                            <button
                              onClick={() => { setShowNoteInput(false); setPendingTransition(null); setActionNote(''); }}
                              className="h-10 px-4 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-200 transition-all"
                            >
                              Annuler
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Statuts finaux */}
                  {detail.availableTransitions.length === 0 && (
                    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
                      {detail.status === 'delivered' ? (
                        <><PackageCheck className="w-5 h-5 text-green-500 shrink-0" /><p className="text-sm text-gray-600 font-medium">Commande livrée — aucune action disponible.</p></>
                      ) : detail.status === 'cancelled' ? (
                        <><Ban className="w-5 h-5 text-gray-400 shrink-0" /><p className="text-sm text-gray-600 font-medium">Commande annulée — aucune action disponible.</p></>
                      ) : null}
                    </div>
                  )}

                  {/* ── Notes internes ── */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <StickyNote className="w-3.5 h-3.5" /> Notes internes
                      <span className="text-[9px] font-medium text-gray-300 ml-auto">Visibles uniquement par l'équipe</span>
                    </p>
                    <textarea
                      value={notesText}
                      onChange={e => setNotesText(e.target.value)}
                      placeholder="Instructions pour l'équipe, informations sur le client..."
                      className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#1E3A8A] focus:bg-white transition-all text-sm font-medium resize-none shadow-inner"
                    />
                    <div className="mt-3 flex items-center justify-end gap-3">
                      {notesSaved && (
                        <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Sauvegardé
                        </span>
                      )}
                      <button
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                        className="h-9 px-4 bg-gray-800 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:brightness-125 transition-all flex items-center gap-2 disabled:opacity-60"
                      >
                        {savingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                        Enregistrer
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

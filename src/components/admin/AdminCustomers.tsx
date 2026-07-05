/**
 * AdminCustomers.tsx — Donald Gros E-commerce
 *
 * Liste complète des clients avec :
 *  - Filtres (recherche, statut, ville)
 *  - Pagination
 *  - Actions : voir fiche, bloquer / débloquer
 *  - Modal fiche client avec historique de commandes
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Search, Loader2, AlertTriangle, RefreshCw,
  ShieldX, UserCheck, ChevronRight, X, ShoppingBag,
  Phone, MapPin, Calendar, TrendingUp, ChevronLeft,
} from 'lucide-react';
import {
  fetchClients,
  fetchClientDetail,
  blockClient,
  unblockClient,
  ClientListItem,
  ClientDetail,
  ClientFilters,
} from '../../services/adminClientService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('fr-FR');

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

const initials = (name: string) =>
  name.split(' ').map((n) => n[0] ?? '').slice(0, 2).join('').toUpperCase();

// ─── Badge statut ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: 'active' | 'blocked' }) =>
  status === 'active' ? (
    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-green-50 text-green-600 border-green-100">
      ACTIF
    </span>
  ) : (
    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-red-50 text-red-600 border-red-100">
      BLOQUÉ
    </span>
  );

// ─── Modal fiche client ───────────────────────────────────────────────────────

const ClientModal = ({
  clientId,
  onClose,
  onStatusChange,
}: {
  clientId: number;
  onClose: () => void;
  onStatusChange: (id: number, status: 'active' | 'blocked') => void;
}) => {
  const [detail, setDetail] = React.useState<ClientDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState<string | null>(null);
  const [toggling, setToggling] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    fetchClientDetail(clientId)
      .then(setDetail)
      .catch(() => setError('Impossible de charger la fiche client.'))
      .finally(() => setLoading(false));
  }, [clientId]);

  const handleToggle = async () => {
    if (!detail) return;
    setToggling(true);
    try {
      const fn = detail.status === 'active' ? blockClient : unblockClient;
      const res = await fn(detail.id);
      setDetail((prev) => prev ? { ...prev, status: res.status } : prev);
      onStatusChange(detail.id, res.status);
    } catch {
      // ignore — utilisateur peut réessayer
    } finally {
      setToggling(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-gray/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-gray">
          <h2 className="font-black text-base text-dark-gray">Fiche Client</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-light-gray transition-colors text-medium-gray"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading && (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-medium-gray">
              <Loader2 className="w-7 h-7 animate-spin" />
              <p className="text-sm font-medium">Chargement…</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-medium-gray">
              <AlertTriangle className="w-7 h-7 text-red-400" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}
          {detail && (
            <div className="space-y-6">
              {/* Identité */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary-blue/10 flex items-center justify-center font-black text-primary-blue text-lg">
                  {initials(detail.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-dark-gray text-base">{detail.fullName}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <StatusBadge status={detail.status} />
                    <span className="text-[10px] text-medium-gray">
                      Inscrit le {formatDate(detail.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Infos */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-light-gray/30 rounded-xl p-3 flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-primary-blue shrink-0" />
                  <span className="text-xs font-bold text-dark-gray">{detail.phone}</span>
                </div>
                <div className="bg-light-gray/30 rounded-xl p-3 flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-primary-blue shrink-0" />
                  <span className="text-xs font-bold text-dark-gray">{detail.city ?? '—'}</span>
                </div>
                <div className="bg-light-gray/30 rounded-xl p-3 flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-primary-blue shrink-0" />
                  <span className="text-xs font-bold text-dark-gray">{detail.ordersCount} commande{detail.ordersCount > 1 ? 's' : ''}</span>
                </div>
                <div className="bg-light-gray/30 rounded-xl p-3 flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-primary-blue shrink-0" />
                  <span className="text-xs font-bold text-dark-gray">{fmt(detail.totalSpent)} F</span>
                </div>
              </div>

              {/* Historique commandes */}
              {detail.orders.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-medium-gray uppercase tracking-widest mb-2">
                    Historique des commandes
                  </p>
                  <div className="space-y-2">
                    {detail.orders.map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between px-3 py-2.5 bg-light-gray/20 rounded-xl border border-light-gray"
                      >
                        <div>
                          <p className="text-xs font-black text-primary-blue">{o.orderNumber}</p>
                          <p className="text-[10px] text-medium-gray mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(o.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-dark-gray">{fmt(o.totalAmount)} F</p>
                          <p className="text-[9px] font-bold text-medium-gray mt-0.5 uppercase">{o.statusLabel}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer action */}
        {detail && (
          <div className="px-6 py-4 border-t border-light-gray flex justify-end">
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`h-10 px-6 rounded-xl font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-60
                ${detail.status === 'active'
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                  : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-100'
                }`}
            >
              {toggling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : detail.status === 'active' ? (
                <><ShieldX className="w-4 h-4" /> Bloquer ce compte</>
              ) : (
                <><UserCheck className="w-4 h-4" /> Débloquer ce compte</>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ─── Composant principal ───────────────────────────────────────────────────────

export const AdminCustomers = () => {
  // ── State ──
  const [clients, setClients]   = React.useState<ClientListItem[]>([]);
  const [total, setTotal]       = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading]   = React.useState(true);
  const [error, setError]       = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [toggling, setToggling] = React.useState<number | null>(null);

  // Filtres
  const [search, setSearch]     = React.useState('');
  const [status, setStatus]     = React.useState<'active' | 'blocked' | ''>('');
  const [city, setCity]         = React.useState('');
  const [page, setPage]         = React.useState(1);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // ── Fetch ──
  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const filters: ClientFilters = {
      page,
      limit: 15,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(status          && { status }),
      ...(city            && { city }),
    };
    try {
      const res = await fetchClients(filters);
      setClients(res.clients);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setError('Impossible de charger la liste des clients.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, city]);

  React.useEffect(() => { load(); }, [load]);

  // Reset page when filters change
  React.useEffect(() => { setPage(1); }, [debouncedSearch, status, city]);

  // ── Bloc / débloc en ligne ──
  const handleToggle = async (client: ClientListItem) => {
    setToggling(client.id);
    try {
      const fn = client.status === 'active' ? blockClient : unblockClient;
      const res = await fn(client.id);
      setClients((prev) =>
        prev.map((c) => (c.id === res.id ? { ...c, status: res.status } : c))
      );
    } finally {
      setToggling(null);
    }
  };

  // Mise à jour depuis la modal fiche
  const handleStatusChange = (id: number, newStatus: 'active' | 'blocked') => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  // ── Render ──
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-blue/10 text-primary-blue rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-dark-gray uppercase tracking-tighter">
              Gestion des Clients
            </h1>
            {!loading && (
              <p className="text-xs text-medium-gray font-medium">
                {total} client{total > 1 ? 's' : ''} dans la base de données
              </p>
            )}
          </div>
        </div>
        <button
          onClick={load}
          className="h-11 px-5 bg-white border border-light-gray text-medium-gray rounded-xl font-bold text-xs hover:bg-light-gray/30 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-light-gray flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-medium-gray" />
          <input
            id="client-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou téléphone…"
            className="w-full h-11 pl-12 pr-4 bg-light-gray/20 border border-transparent focus:border-primary-blue focus:bg-white rounded-xl outline-none text-sm transition-all"
          />
        </div>
        <select
          id="client-status-filter"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="h-11 px-4 bg-light-gray/20 border border-transparent focus:border-primary-blue focus:bg-white rounded-xl outline-none text-sm font-bold transition-all"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Compte Actif</option>
          <option value="blocked">Compte Bloqué</option>
        </select>
        <input
          id="client-city-filter"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Filtrer par ville…"
          className="h-11 px-4 bg-light-gray/20 border border-transparent focus:border-primary-blue focus:bg-white rounded-xl outline-none text-sm transition-all"
        />
      </div>

      {/* État chargement / erreur */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-56 gap-4 text-medium-gray">
          <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
          <p className="text-sm font-medium">Chargement des clients…</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center h-56 gap-4 text-medium-gray">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={load}
            className="text-xs font-bold text-primary-blue hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Réessayer
          </button>
        </div>
      )}

      {/* Tableau */}
      {!loading && !error && (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-light-gray overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-light-gray/20 text-[10px] font-black text-medium-gray uppercase tracking-widest border-b border-light-gray">
                <tr>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Téléphone</th>
                  <th className="px-6 py-4">Ville</th>
                  <th className="px-6 py-4">Inscrit le</th>
                  <th className="px-6 py-4">Commandes</th>
                  <th className="px-6 py-4">Total dépensé</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-medium-gray italic">
                      Aucun client trouvé pour ces critères.
                    </td>
                  </tr>
                ) : (
                  clients.map((c) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-primary-blue/5 transition-all group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-blue/10 flex items-center justify-center font-black text-primary-blue uppercase text-xs shrink-0">
                            {initials(c.fullName)}
                          </div>
                          <span className="text-sm font-bold text-dark-gray">{c.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-dark-gray font-medium">{c.phone}</td>
                      <td className="px-6 py-4 text-xs text-dark-gray font-medium">{c.city ?? '—'}</td>
                      <td className="px-6 py-4 text-xs text-medium-gray">{formatDate(c.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${c.ordersCount > 0 ? 'bg-primary-blue/10 text-primary-blue' : 'bg-light-gray text-medium-gray'}`}>
                          {c.ordersCount > 0 ? `${c.ordersCount} commande${c.ordersCount > 1 ? 's' : ''}` : 'Aucun achat'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-dark-gray">
                        {c.totalSpent > 0 ? `${fmt(c.totalSpent)} F` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Voir fiche */}
                          <button
                            id={`client-detail-${c.id}`}
                            onClick={() => setSelectedId(c.id)}
                            className="p-2 text-primary-blue hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-light-gray transition-all"
                            title="Voir la fiche"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          {/* Bloc / débloc */}
                          <button
                            id={`client-toggle-${c.id}`}
                            onClick={() => handleToggle(c)}
                            disabled={toggling === c.id}
                            className={`p-2 rounded-lg shadow-sm border border-transparent hover:border-light-gray transition-all disabled:opacity-50
                              ${c.status === 'active' ? 'text-red-500 hover:bg-white' : 'text-green-600 hover:bg-white'}`}
                            title={c.status === 'active' ? 'Bloquer' : 'Débloquer'}
                          >
                            {toggling === c.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : c.status === 'active' ? (
                              <ShieldX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-9 w-9 rounded-xl border border-light-gray bg-white flex items-center justify-center text-medium-gray hover:border-primary-blue hover:text-primary-blue transition-all disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-dark-gray">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-9 w-9 rounded-xl border border-light-gray bg-white flex items-center justify-center text-medium-gray hover:border-primary-blue hover:text-primary-blue transition-all disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal fiche client */}
      <AnimatePresence>
        {selectedId !== null && (
          <ClientModal
            clientId={selectedId}
            onClose={() => setSelectedId(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

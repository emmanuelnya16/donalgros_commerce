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
  MoreVertical,
  ChevronRight
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
  Legend
} from 'recharts';
import { useAppContext } from '../../context/AppContext';

// Mock Data for Charts
const REVENUE_DATA = [
  { day: 'Lun', amount: 120000 },
  { day: 'Mar', amount: 350000 },
  { day: 'Mer', amount: 180000 },
  { day: 'Jeu', amount: 420000 },
  { day: 'Ven', amount: 510000 },
  { day: 'Sam', amount: 780000 },
  { day: 'Dim', amount: 450000 },
];

const ORDER_STATUS_DATA = [
  { week: 'Sem 1', livrées: 120, annulées: 10, preparation: 20 },
  { week: 'Sem 2', livrées: 150, annulées: 15, preparation: 30 },
  { week: 'Sem 3', livrées: 180, annulées: 8, preparation: 15 },
  { week: 'Sem 4', livrées: 210, annulées: 12, preparation: 25 },
];

const KPICard = ({ title, value, change, isPositive, color, icon: Icon, details }: any) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm border border-light-gray border-l-4 transition-all hover:shadow-md ${color}`}>
    <div className="flex items-start justify-between mb-4">
      <div className="p-2.5 rounded-xl bg-light-gray/50 text-dark-gray">
        <Icon className="w-6 h-6" />
      </div>
      <button className="text-medium-gray hover:text-dark-gray">
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
    <div className="space-y-1">
      <p className="text-[11px] font-black text-medium-gray uppercase tracking-widest">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-display font-black text-dark-gray">{value}</h3>
        <span className={`text-[10px] font-black flex items-center gap-0.5 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}%
        </span>
      </div>
      <p className="text-[10px] text-medium-gray font-medium">{details}</p>
    </div>
  </div>
);

export const AdminDashboard = () => {
  const { products, orders } = useAppContext();

  const kpis = [
    { title: "Chiffre d'Affaires du Jour", value: "842,500 F", change: 12.5, isPositive: true, color: "border-l-green-500", icon: DollarSign, details: "vs hier (748,000 F)" },
    { title: "Commandes du Jour", value: "24", change: 8, isPositive: true, color: "border-l-blue-500", icon: ShoppingBag, details: "12 en attente, 8 en cours, 4 livrées" },
    { title: "Nouveaux Clients du Mois", value: "+148", change: 22, isPositive: true, color: "border-l-purple-500", icon: Users, details: "vs mois dernier (+121)" },
    { title: "Ruptures de Stock", value: products.filter(p => p.stock === 0).length.toString(), change: 0, isPositive: true, color: "border-l-red-500", icon: AlertTriangle, details: "Actions requises immédiates" },
    { title: "Panier Moyen", value: "35,400 F", change: 5.2, isPositive: false, color: "border-l-orange-500", icon: CreditCard, details: "vs mois dernier (37,200 F)" },
    { title: "Taux Paiement Mobile", value: "68%", change: 15, isPositive: true, color: "border-l-blue-600", icon: CreditCard, details: "MTN MoMo & Orange Money" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <KPICard {...kpi} />
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-light-gray flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-display font-black text-lg text-dark-gray">Évolution du Chiffre d'Affaires</h3>
              <p className="text-xs text-medium-gray">Les 7 derniers jours</p>
            </div>
            <select className="bg-light-gray/50 border border-light-gray rounded-lg px-3 py-1.5 text-xs font-bold outline-none">
              <option>7 jours</option>
              <option>30 jours</option>
              <option>Cette année</option>
            </select>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A56DB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1A56DB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  formatter={(val: number) => [`${val.toLocaleString()} F`, 'CA']}
                />
                <Area type="monotone" dataKey="amount" stroke="#1A56DB" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-light-gray flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-display font-black text-lg text-dark-gray">Commandes par Statut</h3>
              <p className="text-xs text-medium-gray">Performance hebdomadaire</p>
            </div>
            <div className="flex gap-2">
               <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1A56DB]"></span>
                  <span className="text-[10px] font-bold text-medium-gray uppercase">Livrées</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                  <span className="text-[10px] font-bold text-medium-gray uppercase">Prépa</span>
               </div>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ORDER_STATUS_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="livrées" fill="#1A56DB" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="preparation" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="annulées" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Latest Orders */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-light-gray overflow-hidden">
          <div className="p-6 border-b border-light-gray flex items-center justify-between">
            <h3 className="font-display font-black text-lg text-dark-gray">Dernières Commandes</h3>
            <button className="text-xs font-black text-primary-blue flex items-center gap-1 hover:underline">
               VOIR TOUT <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-light-gray/30 text-[10px] font-black text-medium-gray uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Commande</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Paiement</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-primary-blue/5 transition-colors">
                    <td className="px-6 py-4 text-xs font-black text-primary-blue">{order.id}</td>
                    <td className="px-6 py-4 text-xs font-bold text-dark-gray">Exemple Client</td>
                    <td className="px-6 py-4 text-xs font-black text-dark-gray">{order.total.toLocaleString()} F</td>
                    <td className="px-6 py-4">
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-light-gray text-medium-gray uppercase uppercase">
                        {order.paymentMode === 'now' ? 'Mobile Money' : 'Cash'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                       <span className="px-2.5 py-1 rounded-full bg-blue-50 text-primary-blue font-bold text-[10px] whitespace-nowrap">
                         {order.status}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <button className="p-1 text-medium-gray hover:text-primary-blue transition-colors">
                          <ArrowUpRight className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                   <tr>
                     <td colSpan={6} className="px-6 py-12 text-center text-sm text-medium-gray italic font-medium">Aucune commande récente</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-light-gray overflow-hidden">
          <div className="p-6 border-b border-light-gray flex items-center justify-between">
            <h3 className="font-display font-black text-lg text-dark-gray">Top Ventes</h3>
            <span className="text-[10px] font-black text-white bg-yellow-500 px-2 py-0.5 rounded-full">CE MOIS</span>
          </div>
          <div className="p-4 space-y-4">
            {products.slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-light-gray border border-light-gray/50 overflow-hidden shrink-0 shadow-sm">
                    <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                  </div>
                  <div className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-sm
                    ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-600' : 'bg-medium-gray'}
                  `}>
                    {i + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-dark-gray truncate">{p.name}</p>
                  <p className="text-[10px] text-medium-gray font-medium">{p.category.toUpperCase()} • 120 ventes</p>
                </div>
                <div className="text-right">
                   <p className="text-xs font-black text-primary-blue">{(p.price * 120).toLocaleString()} F</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-light-gray/30 border-t border-light-gray text-center">
            <button className="text-[10px] font-black text-medium-gray hover:text-dark-gray uppercase tracking-widest">Rapport Complet Ventes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, 
  Search, 
  Calendar, 
  ChevronRight, 
  Printer, 
  CheckCircle2, 
  Truck, 
  Package, 
  XCircle,
  MoreVertical,
  Clock,
  AlertTriangle,
  Users,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useAppContext, Order, OrderStatus } from '../../context/AppContext';

const STATUS_CONFIG: Record<OrderStatus, { color: string, bg: string, icon: any }> = {
  'En attente': { color: 'text-gray-600', bg: 'bg-gray-100', icon: Clock },
  'Confirmé': { color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircle2 },
  'En préparation': { color: 'text-orange-600', bg: 'bg-orange-100', icon: Package },
  'Expédié': { color: 'text-blue-500', bg: 'bg-blue-50', icon: Truck },
  'Livré': { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle2 },
  'Annulé': { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
  'Paiement échoué': { color: 'text-red-800', bg: 'bg-red-200', icon: AlertTriangle }
} as any;

export const AdminOrders = () => {
  const { orders, updateOrderStatus } = useAppContext();
  const [activeOrder, setActiveOrder] = React.useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = React.useState('Tous');

  const filteredOrders = orders.filter(o => filterStatus === 'Tous' || o.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-blue/10 text-primary-blue rounded-xl">
             <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-dark-gray uppercase tracking-tighter">Gestion des Commandes</h1>
            <p className="text-xs text-medium-gray font-medium">{orders.filter(o => o.status === 'En attente').length} commandes en attente de traitement</p>
          </div>
        </div>
        <button className="h-11 px-6 bg-white border border-light-gray text-dark-gray rounded-xl font-bold text-sm hover:bg-light-gray transition-all flex items-center gap-2">
          <Printer className="w-4 h-4" />
          Exporter le rapport du jour
        </button>
      </div>

      {/* Tabs / Filters */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-light-gray flex items-center gap-2 overflow-x-auto no-scrollbar">
        {['Tous', 'En attente', 'Confirmé', 'En préparation', 'Expédié', 'Livré', 'Annulé'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 h-10 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
              ${filterStatus === status ? 'bg-primary-blue text-white shadow-lg shadow-primary-blue/20' : 'text-medium-gray hover:bg-light-gray'}
            `}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Orders List */}
        <div className={`bg-white rounded-2xl shadow-sm border border-light-gray overflow-hidden ${activeOrder ? 'xl:col-span-4' : 'xl:col-span-12'}`}>
          <div className="p-4 border-b border-light-gray relative">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-medium-gray" />
            <input 
              type="text" 
              placeholder="Rechercher #ID, Client..." 
              className="w-full h-11 pl-10 pr-4 bg-light-gray/20 border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-primary-blue transition-all"
            />
          </div>
          <div className="divide-y divide-light-gray overflow-y-auto max-h-[70vh] no-scrollbar">
            {filteredOrders.map((order) => (
              <div 
                key={order.id}
                onClick={() => setActiveOrder(order)}
                className={`p-4 cursor-pointer transition-all hover:bg-light-gray group relative
                  ${activeOrder?.id === order.id ? 'bg-primary-blue/5 border-l-4 border-primary-blue' : 'border-l-4 border-transparent'}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-black text-primary-blue">{order.id}</span>
                  <span className="text-[10px] font-bold text-medium-gray">{order.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-dark-gray">Client Exemple</p>
                    <p className="text-[11px] text-medium-gray font-medium">{order.items.length} articles • {order.total.toLocaleString()} F</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter
                    ${STATUS_CONFIG[order.status]?.bg} ${STATUS_CONFIG[order.status]?.color}
                  `}>
                    {order.status}
                  </div>
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && (
              <div className="p-12 text-center text-sm text-medium-gray italic font-medium">Aucune commande trouvée</div>
            )}
          </div>
        </div>

        {/* Order Details Panel */}
        <AnimatePresence>
          {activeOrder && (
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               className="xl:col-span-8 space-y-6"
            >
              {/* Order Header Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-light-gray p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-display font-black text-dark-gray">{activeOrder.id}</h2>
                    <p className="text-sm text-medium-gray">Commandée le {activeOrder.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-medium-gray hover:bg-light-gray rounded-lg transition-all border border-light-gray">
                      <Printer className="w-5 h-5" />
                    </button>
                    <div className="relative group">
                       <button className="p-2 text-medium-gray hover:bg-light-gray rounded-lg transition-all border border-light-gray">
                         <MoreVertical className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-light-gray">
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-medium-gray uppercase tracking-widest flex items-center gap-2">
                         <Users className="w-3 h-3" /> Information Client
                      </p>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-light-gray flex items-center justify-center font-bold text-dark-gray uppercase">JD</div>
                         <div>
                            <p className="text-sm font-bold text-dark-gray">Jean Dupont</p>
                            <p className="text-xs text-medium-gray">jean.dupont@email.com</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-medium-gray">
                         <Phone className="w-3.5 h-3.5" />
                         <span className="font-medium">+237 678 90 12 34</span>
                         <button className="ml-auto text-primary-blue hover:underline">Appeler</button>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-medium-gray uppercase tracking-widest flex items-center gap-2">
                         <MapPin className="w-3.5 h-3.5" /> Adresse de livraison
                      </p>
                      <div className="space-y-1">
                         <p className="text-sm font-bold text-dark-gray">{activeOrder.address.city}</p>
                         <p className="text-xs text-medium-gray">{activeOrder.address.district}</p>
                         <p className="text-xs text-medium-gray italic">{activeOrder.address.details}</p>
                      </div>
                      <button className="text-xs text-primary-blue font-bold flex items-center gap-1 hover:underline">
                         VOIR SUR GOOGLE MAPS <ExternalLink className="w-3 h-3" />
                      </button>
                   </div>

                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-medium-gray uppercase tracking-widest flex items-center gap-2">
                         <CreditCard className="w-3.5 h-3.5" /> Mode de Paiement
                      </p>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-lg bg-light-gray flex items-center justify-center font-bold text-dark-gray uppercase p-2">
                            {activeOrder.paymentMode === 'now' ? (
                               <img src="https://logos-marques.com/wp-content/uploads/2021/07/Orange-Money-logo.png" className="w-full h-full object-contain" />
                            ) : (
                               <ShoppingCart className="w-6 h-6 text-medium-gray" />
                            )}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-dark-gray">{activeOrder.paymentMode === 'now' ? 'Mobile Money' : 'Paiement Livraison'}</p>
                            <span className={`text-[10px] font-black uppercase ${activeOrder.paymentStatus === 'payé' ? 'text-green-600' : 'text-orange-600'}`}>
                               {activeOrder.paymentStatus}
                            </span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Items List */}
                <div className="space-y-4 mb-8">
                  <p className="text-[10px] font-black text-medium-gray uppercase tracking-widest">Articles de la commande</p>
                  <div className="space-y-3">
                    {activeOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-light-gray/50 hover:bg-light-gray/10 transition-all">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-light-gray shrink-0">
                          <img src={item.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-dark-gray truncate">{item.name}</h4>
                          <p className="text-[11px] text-medium-gray">{item.selectedSize ? `Taille: ${item.selectedSize}` : ''} {item.selectedColor ? `• Couleur: ${item.selectedColor}` : ''}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-medium-gray font-bold">x{item.quantity}</p>
                          <p className="text-sm font-black text-dark-gray">{(item.price * item.quantity).toLocaleString()} F</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Recap */}
                <div className="bg-light-gray/30 rounded-2xl p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                   <div className="space-y-2 flex-1">
                      <div className="flex justify-between text-xs font-medium text-medium-gray">
                         <span>Sous-total articles</span>
                         <span>{(activeOrder.total - 1500).toLocaleString()} F</span>
                      </div>
                      <div className="flex justify-between text-xs font-medium text-medium-gray">
                         <span>Frais de livraison</span>
                         <span>+1,500 F</span>
                      </div>
                      <div className="flex justify-between text-sm font-black text-dark-gray pt-2 border-t border-light-gray">
                         <span>TOTAL TTC</span>
                         <span className="text-xl text-primary-blue">{activeOrder.total.toLocaleString()} F</span>
                      </div>
                   </div>
                   
                   <div className="w-full md:w-64 space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Mettre à jour le statut</label>
                        <select 
                          value={activeOrder.status}
                          onChange={(e) => updateOrderStatus(activeOrder.id, e.target.value as OrderStatus)}
                          className="w-full h-11 px-4 bg-white border border-primary-blue rounded-xl outline-none text-sm font-bold text-primary-blue shadow-lg shadow-primary-blue/10"
                        >
                          <option value="En attente">En attente</option>
                          <option value="Confirmé">Confirmé</option>
                          <option value="En préparation">En préparation</option>
                          <option value="Expédié">Expédié</option>
                          <option value="Livré">Livré</option>
                          <option value="Annulé">Annulé</option>
                        </select>
                      </div>
                      <button className="w-full h-11 bg-primary-blue/10 text-primary-blue rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-primary-blue/20">
                         <MessageSquare className="w-4 h-4" />
                         Notifier par SMS
                      </button>
                   </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-light-gray p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-medium-gray mb-4">Notes Internes (privées)</h3>
                <textarea 
                  placeholder="Ajouter une instruction pour l'équipe, une note sur le client..."
                  className="w-full h-24 p-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-sm font-medium resize-none shadow-inner"
                />
                <div className="mt-4 flex items-center justify-between text-[10px] text-medium-gray italic">
                   <span>Visible uniquement par les administrateurs</span>
                   <button className="bg-dark-gray text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-widest hover:brightness-125 transition-all">Enregistrer Note</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

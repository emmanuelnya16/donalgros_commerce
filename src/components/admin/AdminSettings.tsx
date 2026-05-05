import React from 'react';
import { Settings, Store, Truck, CreditCard, ShieldCheck, Mail, Phone, MapPin, Save, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const AdminSettings = () => {
  const { settings } = useAppContext();

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gray-600/10 text-gray-700 rounded-xl">
           <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl text-dark-gray uppercase tracking-tighter">Paramètres Généraux</h1>
          <p className="text-xs text-medium-gray font-medium">Configuration globale de la boutique Donald Gros</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Nav Settings (Internal) */}
        <div className="lg:col-span-1 space-y-2">
           {[
             { id: 'general', label: 'Boutique', icon: Store },
             { id: 'shipping', label: 'Livraison', icon: Truck },
             { id: 'payment', label: 'Paiements', icon: CreditCard },
             { id: 'security', label: 'Accès & Rôles', icon: ShieldCheck },
           ].map(t => (
             <button key={t.id} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border font-bold text-sm
               ${t.id === 'general' ? 'bg-white border-primary-blue text-primary-blue shadow-sm' : 'bg-transparent border-transparent text-medium-gray hover:bg-white/50'}
             `}>
               <t.icon className="w-5 h-5" />
               {t.label}
             </button>
           ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-8">
           {/* Section 1: Information */}
           <section className="bg-white rounded-3xl shadow-sm border border-light-gray overflow-hidden">
              <div className="p-6 border-b border-light-gray bg-light-gray/20">
                 <h3 className="font-display font-black text-lg text-dark-gray uppercase tracking-tighter">Informations de la Boutique</h3>
              </div>
              <div className="p-8 space-y-6">
                 <div className="flex items-center gap-8 mb-4">
                    <div className="w-24 h-24 rounded-3xl border-2 border-primary-blue bg-white flex items-center justify-center p-4 relative group cursor-pointer shadow-xl">
                       <span className="font-display font-black text-2xl tracking-tighter">DG</span>
                       <div className="absolute inset-0 bg-primary-blue/80 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-3xl transition-all">
                          <Plus className="w-8 h-8 text-white" />
                       </div>
                    </div>
                    <div>
                       <h4 className="font-bold text-dark-gray">Logo Officiel</h4>
                       <p className="text-xs text-medium-gray mt-1">Utilisé sur le site, les factures et les emails.</p>
                       <button className="mt-2 text-xs font-black text-primary-blue hover:underline">REMPLACER</button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Nom du Site</label>
                       <input type="text" defaultValue={settings.name} className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all font-bold text-sm" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Email de Contact</label>
                       <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-medium-gray" />
                          <input type="email" defaultValue={settings.email} className="w-full h-11 pl-11 pr-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all font-bold text-sm" />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Téléphone Principal</label>
                       <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-medium-gray" />
                          <input type="text" defaultValue={settings.phone} className="w-full h-11 pl-11 pr-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all font-bold text-sm" />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Adresse Siège</label>
                       <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-medium-gray" />
                          <input type="text" defaultValue={settings.address} className="w-full h-11 pl-11 pr-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all font-bold text-sm" />
                       </div>
                    </div>
                 </div>
              </div>
           </section>

           {/* Section 2: Shipping */}
           <section className="bg-white rounded-3xl shadow-sm border border-light-gray overflow-hidden">
              <div className="p-6 border-b border-light-gray flex items-center justify-between">
                 <h3 className="font-display font-black text-lg text-dark-gray uppercase tracking-tighter">Zones de Livraison</h3>
                 <button className="text-xs font-black text-primary-blue flex items-center gap-1 hover:underline">
                    <Plus className="w-3.5 h-3.5" /> AJOUTER ZONE
                 </button>
              </div>
              <div className="p-0">
                 <table className="w-full text-left">
                    <thead className="bg-light-gray/20 text-[9px] font-black text-medium-gray uppercase tracking-widest border-b border-light-gray">
                       <tr>
                          <th className="px-8 py-3">Ville</th>
                          <th className="px-8 py-3 text-right">Frais (F)</th>
                          <th className="px-8 py-3 text-right">Délai</th>
                          <th className="px-8 py-3 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-light-gray">
                       {settings.shipping.map((s, idx) => (
                         <tr key={idx} className="hover:bg-light-gray/20">
                            <td className="px-8 py-4 text-sm font-bold text-dark-gray">{s.city}</td>
                            <td className="px-8 py-4 text-right text-sm font-black text-primary-blue">{s.price.toLocaleString()} F</td>
                            <td className="px-8 py-4 text-right text-xs font-medium text-medium-gray italic">{s.delay}</td>
                            <td className="px-8 py-4 text-right">
                               <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </section>

           <div className="flex justify-end pt-4">
              <button className="h-14 px-10 bg-primary-blue text-white rounded-2xl font-display font-black text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary-blue/20 flex items-center gap-3">
                 <Save className="w-5 h-5" /> Enregistrer les Paramètres
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

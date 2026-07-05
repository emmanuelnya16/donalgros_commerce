import React from 'react';
import { Settings, Store, Truck, CreditCard, ShieldCheck, Mail, Phone, MapPin, Save, Plus, Trash2, Globe } from 'lucide-react';
import { useAppContext, StoreSettings } from '../../context/AppContext';

export const AdminSettings = () => {
  const { settings, updateSettings } = useAppContext();
  const [activeSubTab, setActiveSubTab] = React.useState<'general' | 'shipping' | 'payment'>('general');
  const [formData, setFormData] = React.useState<StoreSettings>({ ...settings });
  const [newZone, setNewZone] = React.useState({ city: '', price: 2000, delay: '2-3 jours' });
  const [isAddingZone, setIsAddingZone] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  // Sync state if settings change (e.g. from Context reload)
  React.useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleSave = () => {
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddZone = () => {
    if (!newZone.city.trim()) return;
    setFormData(prev => ({
      ...prev,
      shipping: [...prev.shipping, { ...newZone, city: newZone.city.trim() }]
    }));
    setNewZone({ city: '', price: 2000, delay: '2-3 jours' });
    setIsAddingZone(false);
  };

  const handleRemoveZone = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      shipping: prev.shipping.filter((_, i) => i !== idx)
    }));
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-600/10 text-gray-700 rounded-xl">
             <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-dark-gray uppercase tracking-tighter">Paramètres Généraux</h1>
            <p className="text-xs text-medium-gray font-medium">Configuration globale de la boutique Donald Gros</p>
          </div>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-500 text-white font-bold text-xs uppercase px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 animate-bounce">
            ✓ Paramètres enregistrés avec succès !
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Nav Settings (Internal) */}
        <div className="lg:col-span-1 space-y-2">
           {[
             { id: 'general', label: 'Boutique', icon: Store },
             { id: 'shipping', label: 'Livraison', icon: Truck },
             { id: 'payment', label: 'Paiements', icon: CreditCard },
           ].map(t => (
             <button
               key={t.id}
               onClick={() => setActiveSubTab(t.id as any)}
               className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border font-bold text-sm
                 ${activeSubTab === t.id 
                   ? 'bg-white border-primary-blue text-primary-blue shadow-sm' 
                   : 'bg-transparent border-transparent text-medium-gray hover:bg-white/50'
                 }`}
             >
               <t.icon className="w-5 h-5" />
               {t.label}
             </button>
           ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {activeSubTab === 'general' && (
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
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all font-bold text-sm"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Email de Contact</label>
                        <div className="relative">
                           <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-medium-gray" />
                           <input
                             type="email"
                             value={formData.email}
                             onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                             className="w-full h-11 pl-11 pr-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all font-bold text-sm"
                           />
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Téléphone Principal</label>
                        <div className="relative">
                           <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-medium-gray" />
                           <input
                             type="text"
                             value={formData.phone}
                             onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                             className="w-full h-11 pl-11 pr-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all font-bold text-sm"
                           />
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Adresse Siège</label>
                        <div className="relative">
                           <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-medium-gray" />
                           <input
                             type="text"
                             value={formData.address}
                             onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                             className="w-full h-11 pl-11 pr-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all font-bold text-sm"
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </section>
          )}

          {activeSubTab === 'shipping' && (
            <div className="space-y-6">
              {/* Option 1: Mode Global vs Par Zone */}
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-light-gray space-y-4">
                <h3 className="font-display font-black text-sm text-dark-gray uppercase tracking-wider">
                  Type de tarification
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, useGlobalDeliveryPrice: true }))}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${
                      formData.useGlobalDeliveryPrice
                        ? 'border-primary-blue bg-blue-50/20'
                        : 'border-light-gray hover:bg-gray-50'
                    }`}
                  >
                    <Globe className="w-6 h-6 text-primary-blue mb-3" />
                    <h4 className="font-bold text-sm text-dark-gray">Tarif unique (Global)</h4>
                    <p className="text-xs text-medium-gray mt-1">
                      Un seul prix de livraison appliqué pour toutes les villes.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, useGlobalDeliveryPrice: false }))}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${
                      !formData.useGlobalDeliveryPrice
                        ? 'border-primary-blue bg-blue-50/20'
                        : 'border-light-gray hover:bg-gray-50'
                    }`}
                  >
                    <Truck className="w-6 h-6 text-primary-blue mb-3" />
                    <h4 className="font-bold text-sm text-dark-gray">Tarification par Zone</h4>
                    <p className="text-xs text-medium-gray mt-1">
                      Définir des tarifs personnalisés par ville (Douala, Yaoundé, etc.).
                    </p>
                  </button>
                </div>

                {formData.useGlobalDeliveryPrice ? (
                  <div className="pt-4 border-t border-light-gray grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-medium-gray ml-1">
                        Prix Global de Livraison (FCFA)
                      </label>
                      <input
                        type="number"
                        value={formData.globalDeliveryPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, globalDeliveryPrice: Number(e.target.value) }))}
                        className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all font-bold text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-light-gray grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-medium-gray ml-1">
                        Prix par défaut pour les autres villes (FCFA)
                      </label>
                      <input
                        type="number"
                        value={formData.globalDeliveryPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, globalDeliveryPrice: Number(e.target.value) }))}
                        className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all font-bold text-sm"
                      />
                      <p className="text-[10px] text-medium-gray">
                        Appliqué automatiquement si la ville du client n'est pas répertoriée dans les zones ci-dessous.
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* Zones de Livraison (uniquement si non global ou comme liste de support) */}
              {!formData.useGlobalDeliveryPrice && (
                <section className="bg-white rounded-3xl shadow-sm border border-light-gray overflow-hidden">
                  <div className="p-6 border-b border-light-gray flex items-center justify-between">
                     <h3 className="font-display font-black text-lg text-dark-gray uppercase tracking-tighter">Zones de Livraison Spécifiques</h3>
                     <button
                       type="button"
                       onClick={() => setIsAddingZone(true)}
                       className="text-xs font-black text-primary-blue flex items-center gap-1 hover:underline"
                     >
                        <Plus className="w-3.5 h-3.5" /> AJOUTER ZONE
                     </button>
                  </div>

                  {isAddingZone && (
                    <div className="p-6 bg-light-gray/20 border-b border-light-gray grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-medium-gray">Ville</label>
                        <input
                          type="text"
                          placeholder="Ex: Garoua"
                          value={newZone.city}
                          onChange={e => setNewZone(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full h-10 px-3 bg-white border border-light-gray rounded-lg text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-medium-gray">Frais (FCFA)</label>
                        <input
                          type="number"
                          value={newZone.price}
                          onChange={e => setNewZone(prev => ({ ...prev, price: Number(e.target.value) }))}
                          className="w-full h-10 px-3 bg-white border border-light-gray rounded-lg text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddZone}
                          className="flex-1 h-10 bg-primary-blue text-white rounded-lg text-xs font-bold uppercase"
                        >
                          Ajouter
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingZone(false)}
                          className="h-10 px-3 bg-white border border-light-gray rounded-lg text-xs font-bold uppercase text-medium-gray"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}

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
                           {formData.shipping.map((s, idx) => (
                             <tr key={idx} className="hover:bg-light-gray/20">
                                <td className="px-8 py-4 text-sm font-bold text-dark-gray">{s.city}</td>
                                <td className="px-8 py-4 text-right text-sm font-black text-primary-blue">{s.price.toLocaleString()} F</td>
                                <td className="px-8 py-4 text-right text-xs font-medium text-medium-gray italic">{s.delay}</td>
                                <td className="px-8 py-4 text-right">
                                   <button
                                     type="button"
                                     onClick={() => handleRemoveZone(idx)}
                                     className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                                   >
                                     <Trash2 className="w-4 h-4" />
                                   </button>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
                </section>
              )}
            </div>
          )}

          {activeSubTab === 'payment' && (
            <section className="bg-white rounded-3xl shadow-sm border border-light-gray overflow-hidden">
               <div className="p-6 border-b border-light-gray bg-light-gray/20">
                  <h3 className="font-display font-black text-lg text-dark-gray uppercase tracking-tighter">Clés API PawaPay</h3>
               </div>
               <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Clé MTN MoMo</label>
                        <input
                          type="text"
                          value={formData.paymentKeys.mtn}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            paymentKeys: { ...prev.paymentKeys, mtn: e.target.value }
                          }))}
                          className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all font-bold text-sm"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Clé Orange Money</label>
                        <input
                          type="text"
                          value={formData.paymentKeys.orange}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            paymentKeys: { ...prev.paymentKeys, orange: e.target.value }
                          }))}
                          className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all font-bold text-sm"
                        />
                     </div>
                  </div>
               </div>
            </section>
          )}

          <div className="flex justify-end pt-4">
             <button
               onClick={handleSave}
               className="h-14 px-10 bg-primary-blue text-white rounded-2xl font-display font-black text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary-blue/20 flex items-center gap-3"
             >
                <Save className="w-5 h-5" /> Enregistrer les Paramètres
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

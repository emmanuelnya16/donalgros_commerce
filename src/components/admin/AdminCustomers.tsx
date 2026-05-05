import React from 'react';
import { motion } from 'motion/react';
import { Users, Search, Filter, Mail, Phone, MapPin, ChevronRight, Trash2, ShieldX, UserCheck } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const AdminCustomers = () => {
  const { orders } = useAppContext();
  
  // Mock customers derived from orders + some extras
  const customers = [
    { id: 'u1', name: 'Jean Dupont', email: 'jean.dupont@email.com', phone: '+237 678 90 12 34', city: 'Douala', joinDate: '12 Mars 2024', status: 'active', spend: 125000, orders: 3 },
    { id: 'u2', name: 'Alice Mballa', email: 'alice.m@email.com', phone: '+237 699 11 22 33', city: 'Yaoundé', joinDate: '05 Janv 2024', status: 'active', spend: 450000, orders: 8 },
    { id: 'u3', name: 'Marc Kengne', email: 'marc.k@outlook.com', phone: '+237 655 44 33 22', city: 'Bafoussam', joinDate: '18 Fév 2024', status: 'active', spend: 85000, orders: 1 },
    { id: 'u4', name: 'Sophie Nkoa', email: 'sophie.n@gmail.com', phone: '+237 677 88 99 00', city: 'Douala', joinDate: '22 Avril 2024', status: 'blocked', spend: 0, orders: 0 },
  ];

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-blue/10 text-primary-blue rounded-xl">
             <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-dark-gray uppercase tracking-tighter">Gestion des Clients</h1>
            <p className="text-xs text-medium-gray font-medium">{customers.length} clients dans la base de données</p>
          </div>
        </div>
        <button className="h-11 px-6 bg-white border border-primary-blue text-primary-blue rounded-xl font-bold text-sm hover:bg-primary-blue/5 transition-all">
          Exporter (CSV)
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-light-gray flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-medium-gray" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, téléphone, ville..."
            className="w-full h-11 pl-12 pr-4 bg-light-gray/20 border border-transparent focus:border-primary-blue focus:bg-white rounded-xl outline-none text-sm transition-all shadow-inner"
          />
        </div>
        <select className="h-11 px-4 bg-light-gray/20 border border-transparent focus:border-primary-blue focus:bg-white rounded-xl outline-none text-sm font-bold transition-all">
           <option>Tous les statuts</option>
           <option>Compte Actif</option>
           <option>Compte Bloqué</option>
        </select>
        <select className="h-11 px-4 bg-light-gray/20 border border-transparent focus:border-primary-blue focus:bg-white rounded-xl outline-none text-sm font-bold transition-all">
           <option>Toutes les villes</option>
           <option>Douala</option>
           <option>Yaoundé</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-light-gray overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-light-gray/20 text-[10px] font-black text-medium-gray uppercase tracking-widest border-b border-light-gray">
            <tr>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Ville</th>
              <th className="px-6 py-4">Inscrit le</th>
              <th className="px-6 py-4">Achats</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-primary-blue/5 transition-all group">
                <td className="px-6 py-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-blue/10 flex items-center justify-center font-bold text-primary-blue uppercase text-xs">
                         {c.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-bold text-dark-gray">{c.name}</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-dark-gray font-medium italic">{c.phone}</span>
                      <span className="text-[10px] text-medium-gray">{c.email}</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-dark-gray">{c.city}</td>
                <td className="px-6 py-4 text-xs text-medium-gray">{c.joinDate}</td>
                <td className="px-6 py-4">
                   <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${c.orders > 0 ? 'bg-primary-blue/10 text-primary-blue' : 'bg-light-gray text-medium-gray'}`}>
                      {c.orders > 0 ? `${c.orders} commandes` : 'Aucun achat'}
                   </span>
                </td>
                <td className="px-6 py-4 text-sm font-black text-dark-gray">{c.spend.toLocaleString()} F</td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${c.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                      {c.status === 'active' ? 'ACTIF' : 'BLOQUÉ'}
                   </span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center justify-center gap-2">
                       <button className="p-2 text-primary-blue hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-light-gray transition-all" title="Voir Fiche">
                          <ChevronRight className="w-4 h-4" />
                       </button>
                       {c.status === 'active' ? (
                         <button className="p-2 text-red-500 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-light-gray transition-all" title="Bloquer">
                            <ShieldX className="w-4 h-4" />
                         </button>
                       ) : (
                         <button className="p-2 text-green-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-light-gray transition-all" title="Débloquer">
                            <UserCheck className="w-4 h-4" />
                         </button>
                       )}
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

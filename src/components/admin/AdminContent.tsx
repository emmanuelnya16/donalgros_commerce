import React from 'react';
import { Monitor, Image as ImageIcon, Plus, Layout, ArrowRightLeft, Trash2, Edit2, Play } from 'lucide-react';

export const AdminContent = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-600/10 text-indigo-600 rounded-xl">
           <Monitor className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl text-dark-gray uppercase tracking-tighter">Gestion du Contenu</h1>
          <p className="text-xs text-medium-gray font-medium">Bannières, accueil et visuels du site</p>
        </div>
      </div>

      {/* Hero Banners */}
      <section className="bg-white rounded-2xl shadow-sm border border-light-gray overflow-hidden">
        <div className="p-6 border-b border-light-gray flex items-center justify-between">
           <div>
              <h3 className="font-display font-black text-lg text-dark-gray">Slider Page d'Accueil</h3>
              <p className="text-xs text-medium-gray italic">Minimum 1440x580px recommandé</p>
           </div>
           <button className="h-10 px-4 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:brightness-110 shadow-lg shadow-indigo-600/20">
              <Plus className="w-4 h-4" /> Ajouter
           </button>
        </div>
        <div className="p-6">
           <div className="space-y-4">
              {[
                { title: 'Collection Homme Printemps', img: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=600', status: 'Active' },
                { title: 'Promo Flash Électroménager', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600', status: 'Active' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-6 p-4 rounded-2xl border border-light-gray hover:border-indigo-600/30 transition-all group">
                   <div className="w-8 h-8 flex items-center justify-center text-medium-gray opacity-30 cursor-grab">
                      <ArrowRightLeft className="w-5 h-5 rotate-90" />
                   </div>
                   <div className="w-32 h-16 rounded-lg overflow-hidden bg-light-gray shrink-0 shadow-sm">
                      <img src={b.img} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-dark-gray">{b.title}</p>
                      <p className="text-[10px] text-green-600 font-black uppercase tracking-widest flex items-center gap-1">
                         <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> {b.status}
                      </p>
                   </div>
                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-2 text-medium-gray hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button className="p-2 text-medium-gray hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Promotional Bar */}
      <section className="bg-white rounded-2xl shadow-sm border border-light-gray overflow-hidden">
        <div className="p-6 border-b border-light-gray">
           <h3 className="font-display font-black text-lg text-dark-gray">Bandeau Promotionnel Défilant</h3>
           <p className="text-xs text-medium-gray">Messages défilant sous le hero banner</p>
        </div>
        <div className="p-6 space-y-4">
           <div className="flex gap-4">
              <input type="text" placeholder="Ajouter un nouveau message (ex: Livraison gratuite dès 200k !)" className="flex-1 h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-indigo-600 transition-all text-sm font-medium" />
              <button className="h-11 px-6 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest whitespace-nowrap">Ajouter au rail</button>
           </div>
           <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-light-gray/20 rounded-xl border border-dashed border-light-gray">
                 <span className="text-xs font-bold text-dark-gray">Livraison en 24h sur Douala & Yaoundé !</span>
                 <button className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};

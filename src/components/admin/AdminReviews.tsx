import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, CheckCircle2, XCircle, Clock, Trash2, Filter, Search, User, Package } from 'lucide-react';
import { useAppContext, Review } from '../../context/AppContext';
import { getAdminReviews, deleteReview } from '../../services/adminReviewService';

export const AdminReviews = () => {
  const { moderateReview } = useAppContext();
  const [activeTab, setActiveTab] = React.useState<'pending' | 'approved' | 'rejected'>('pending');
  const [reviewsList, setReviewsList] = React.useState<Review[]>([]);
  const [pendingBadgeCount, setPendingBadgeCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const fetchReviews = React.useCallback(async (tabStatus: 'pending' | 'approved' | 'rejected') => {
    setLoading(true);
    try {
      const backendStatus = tabStatus === 'approved' ? 'published' : tabStatus;
      const data = await getAdminReviews(backendStatus);
      setReviewsList(data.reviews);
      setPendingBadgeCount(data.pendingCount);
    } catch (err) {
      console.error("Erreur lors de la récupération des avis administrateur:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchReviews(activeTab);
  }, [activeTab, fetchReviews]);

  const handleModerate = async (reviewId: string, status: 'approved' | 'rejected') => {
    let reason = undefined;
    if (status === 'rejected') {
      const input = prompt("Raison du rejet de l'avis (optionnelle) :");
      if (input === null) return; // Annulation
      reason = input.trim();
    }
    try {
      await moderateReview(reviewId, status, reason);
      fetchReviews(activeTab);
    } catch (err) {
      alert("Une erreur est survenue lors de la modération.");
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cet avis définitivement ?")) return;
    try {
      await deleteReview(reviewId);
      fetchReviews(activeTab);
    } catch (err) {
      alert("Erreur lors de la suppression de l'avis.");
    }
  };

  const displayReviews = reviewsList;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-500/10 text-yellow-600 rounded-xl">
             <Star className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-dark-gray uppercase tracking-tighter">Modération des Avis</h1>
            <p className="text-xs text-medium-gray font-medium">Gérez les retours clients et la confiance du site</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-light-gray overflow-x-auto no-scrollbar">
        {[
          { id: 'pending', label: 'En attente', icon: Clock, color: 'text-orange-500' },
          { id: 'approved', label: 'Publiés', icon: CheckCircle2, color: 'text-green-600' },
          { id: 'rejected', label: 'Rejetés', icon: XCircle, color: 'text-red-500' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all
              ${activeTab === tab.id ? 'bg-light-gray text-dark-gray shadow-inner' : 'text-medium-gray hover:bg-light-gray/50'}
            `}
          >
            <tab.icon className={`w-4 h-4 ${tab.color}`} />
            {tab.label}
            {tab.id === 'pending' && pendingBadgeCount > 0 && (
              <span className="px-2 py-0.5 bg-orange-500 text-white text-[9px] rounded-full font-black animate-pulse ml-1">
                {pendingBadgeCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="md:col-span-2 py-20 text-center">
            <p className="text-sm font-medium text-medium-gray animate-pulse">Chargement des avis...</p>
          </div>
        ) : displayReviews.length === 0 ? (
          <div className="md:col-span-2 py-20 text-center bg-white rounded-3xl border border-dashed border-light-gray">
             <Star className="w-12 h-12 text-light-gray mx-auto mb-4" />
             <p className="text-sm font-medium text-medium-gray italic">Aucun avis dans cette catégorie.</p>
          </div>
        ) : (
          displayReviews.map((review) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={review.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-light-gray space-y-4 hover:shadow-md transition-all relative group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-light-gray flex items-center justify-center font-black text-xs text-medium-gray uppercase">
                      {review.userName.charAt(0)}
                   </div>
                   <div>
                      <p className="text-sm font-black text-dark-gray">{review.userName}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-medium-gray">{review.date}</span>
                        {review.isVerifiedPurchase && (
                          <span className="text-[9px] font-black text-green-600 bg-green-50 px-1.5 rounded leading-none">ACHAT VÉRIFIÉ</span>
                        )}
                      </div>
                   </div>
                </div>
                <div className="flex gap-0.5">
                   {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-light-gray'}`} />
                   ))}
                </div>
              </div>

              <div className="bg-light-gray/20 p-3 rounded-xl border border-light-gray/50 flex items-center gap-3">
                 <div className="w-10 h-10 bg-white rounded-lg border border-light-gray overflow-hidden shrink-0">
                    <Package className="w-full h-full p-2 text-medium-gray opacity-30" />
                 </div>
                 <div className="min-w-0">
                    <p className="text-[10px] font-black text-medium-gray uppercase tracking-tighter leading-none mb-1">Produit concerné</p>
                    <p className="text-xs font-bold text-dark-gray truncate">{review.productName}</p>
                 </div>
              </div>

              <div className="space-y-1.5">
                 <h4 className="font-display font-black text-sm text-dark-gray">{review.title}</h4>
                 <p className="text-xs text-medium-gray leading-relaxed italic">"{review.comment}"</p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-light-gray">
                  {activeTab === 'pending' && (
                     <>
                        <button 
                           onClick={() => handleModerate(review.id, 'approved')}
                           className="flex-1 h-9 bg-green-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:brightness-110 flex items-center justify-center gap-2"
                         >
                           <CheckCircle2 className="w-3.5 h-3.5" /> Approuver
                        </button>
                        <button 
                           onClick={() => handleModerate(review.id, 'rejected')}
                           className="flex-1 h-9 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 flex items-center justify-center gap-2"
                         >
                           <XCircle className="w-3.5 h-3.5" /> Rejeter
                        </button>
                     </>
                  )}
                  {activeTab !== 'pending' && (
                     <button 
                       onClick={() => handleDelete(Number(review.id))}
                       className="flex-1 h-9 bg-light-gray text-medium-gray rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                     >
                        <Trash2 className="w-3.5 h-3.5" /> Supprimer Définitivement
                     </button>
                  )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

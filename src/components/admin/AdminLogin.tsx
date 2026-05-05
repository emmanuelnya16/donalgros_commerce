import React from 'react';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, Mail } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const AdminLogin = () => {
  const { adminLogin } = useAppContext();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay
    setTimeout(() => {
      const success = adminLogin(email, password);
      if (success) {
        window.location.hash = 'admin/dashboard';
      } else {
        setError("Identifiants invalides ou accès non autorisé.");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 text-center pb-2">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2 mb-6">
            <button 
              onClick={() => window.location.hash = ''} 
              className="absolute top-6 left-6 flex items-center gap-2 text-xs font-bold text-dark-gray/40 hover:text-primary-blue transition-colors group"
            >
              <div className="p-1.5 rounded-lg bg-light-gray group-hover:bg-primary-blue/10 transition-colors">
                <ArrowLeft className="w-3 h-3" />
              </div>
              RETOUR AU SITE
            </button>
            <div className="font-display font-black text-3xl tracking-tighter text-dark-gray">
              DONALD <span className="text-primary-blue">GROS</span>
            </div>
            <div className="flex items-center gap-2 text-primary-blue bg-primary-blue/10 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" /> Administration
            </div>
          </div>
          <p className="text-sm text-medium-gray font-sans italic">Espace réservé au personnel autorisé</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold border border-red-100"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-dark-gray/60 ml-1">Email administrateur</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-medium-gray" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@donaldgros.com"
                  className="w-full h-12 pl-11 pr-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/5 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-dark-gray/60 ml-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-medium-gray" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-12 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/5 transition-all text-sm font-black tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-medium-gray hover:text-dark-gray"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-light-gray text-primary-blue focus:ring-primary-blue" />
              <span className="text-xs text-medium-gray font-medium group-hover:text-dark-gray transition-colors">Se souvenir de moi</span>
            </label>
            <button type="button" className="text-xs text-medium-gray hover:text-primary-blue italic transition-colors">Mot de passe oublié ?</button>
          </div>

          <button
            disabled={isLoading}
            type="submit"
            className="w-full h-12 bg-primary-blue text-white rounded-xl font-display font-black text-sm uppercase tracking-widest hover:bg-primary-blue/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-primary-blue/20"
          >
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
               "Accéder au Back-Office"
            )}
          </button>
        </form>

        <div className="p-6 bg-light-gray/30 border-t border-light-gray text-center">
           <p className="text-[10px] text-medium-gray font-medium">Session sécurisée - Chiffrement AES-256</p>
        </div>
      </motion.div>
    </div>
  );
};

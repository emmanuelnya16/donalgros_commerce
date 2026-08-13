import React from 'react';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { extractErrorMessage } from '../../services/adminAuthService';

export const AdminActivate = () => {
  const { activateAdmin } = useAppContext();
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  
  const [token, setToken] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // Extraire le token depuis le hash ou la query string (support de: #admin/activate?token=xxx)
    const getQueryParam = (paramName: string) => {
      const hashSplit = window.location.hash.split('?');
      const searchStr = hashSplit.length > 1 ? '?' + hashSplit[1] : window.location.search;
      const params = new URLSearchParams(searchStr);
      return params.get(paramName) || '';
    };

    const t = getQueryParam('token');
    setToken(t);
    if (!t) {
      setError("Le jeton d'activation est manquant dans l'URL. Veuillez vérifier le lien fourni dans votre e-mail.");
    }
  }, []);

  // Validation
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isMatch = password === confirmPassword && confirmPassword !== '';
  const isValid = hasMinLength && hasLetter && hasNumber && isMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !token) return;

    setIsLoading(true);
    setError('');

    try {
      await activateAdmin({ token, password });
      setSuccess(true);
      setTimeout(() => {
        window.location.hash = 'admin/login';
      }, 3500);
    } catch (err) {
      setError(extractErrorMessage(err, "Échec de l'activation du compte. Le jeton est peut-être expiré ou invalide."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 text-center pb-2">
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="font-display font-black text-3xl tracking-tighter text-dark-gray">
              DONALD <span className="text-primary-blue">GROS</span>
            </div>
            <div className="flex items-center gap-2 text-primary-blue bg-primary-blue/10 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" /> Activation de Compte
            </div>
          </div>
          <p className="text-sm text-medium-gray font-sans">Configurez votre mot de passe définitif pour activer votre accès administrateur.</p>
        </div>

        {success ? (
          <div className="p-8 space-y-6 text-center">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
            <div>
              <h3 className="font-display font-black text-lg text-dark-gray uppercase tracking-tighter mb-2">Compte Activé !</h3>
              <p className="text-sm text-medium-gray">Votre mot de passe a été enregistré avec succès.</p>
              <p className="text-xs text-primary-blue font-bold mt-4 animate-pulse">Redirection vers la page de connexion...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-start gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold border border-red-100"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-dark-gray/60 ml-1">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-medium-gray" />
                  <input
                    required
                    disabled={!token || isLoading}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 caractères"
                    className="w-full h-12 pl-11 pr-12 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/5 transition-all text-sm font-medium"
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

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-dark-gray/60 ml-1">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-medium-gray" />
                  <input
                    required
                    disabled={!token || isLoading}
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Saisissez à nouveau le mot de passe"
                    className="w-full h-12 pl-11 pr-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/5 transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Validation indicators */}
            <div className="p-4 bg-light-gray/30 rounded-xl space-y-2">
              <p className="text-[10px] font-black text-dark-gray/50 uppercase tracking-wider mb-1">Critères de sécurité :</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${hasMinLength ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  <span className="text-[11px] font-medium text-medium-gray">Au moins 8 caractères</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${hasLetter ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  <span className="text-[11px] font-medium text-medium-gray">Au moins 1 lettre</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${hasNumber ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  <span className="text-[11px] font-medium text-medium-gray">Au moins 1 chiffre</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isMatch ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  <span className="text-[11px] font-medium text-medium-gray">Mots de passe identiques</span>
                </div>
              </div>
            </div>

            <button
              disabled={!isValid || !token || isLoading}
              type="submit"
              className="w-full h-12 bg-primary-blue text-white rounded-xl font-display font-black text-sm uppercase tracking-widest hover:bg-primary-blue/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-primary-blue/20"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Activation…</>
              ) : (
                'Activer mon compte'
              )}
            </button>
          </form>
        )}

        <div className="p-6 bg-light-gray/30 border-t border-light-gray text-center">
          <p className="text-[10px] text-medium-gray font-medium">Donald Gros E-commerce · Espace sécurisé</p>
        </div>
      </motion.div>
    </div>
  );
};

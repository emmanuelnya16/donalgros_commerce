import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Lock, User, MapPin, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { translations } from '../translations';
import { extractErrorMessage, normalizePhone } from '../services/authService';

interface AuthProps {
  mode: 'login' | 'signup';
  onSwitch: (mode: 'login' | 'signup') => void;
}

const BrandPanel = () => {
  const { language } = useAppContext();
  const t = translations[language];
  return (
    <div className="hidden lg:flex lg:w-[42%] bg-primary-blue text-white flex-col items-center justify-center relative overflow-hidden p-12 h-full">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center font-display font-black text-primary-blue text-2xl mb-4 shadow-xl">DG</div>
        <h2 className="text-2xl font-display font-bold mb-2 tracking-tight">DONALD GROS</h2>
        <p className="text-white/70 text-sm font-sans mb-8">{t.brandTagline}</p>
        <div className="w-10 h-1 bg-primary-green rounded-full mb-8" />
        <ul className="space-y-6 w-full max-w-xs">
          {[t.benefit1, t.benefit2, t.benefit3, t.benefit4].map((item, i) => (
            <li key={i} className="flex items-center gap-4 group">
              <span className="w-2 h-2 bg-primary-green rounded-full shrink-0 group-hover:scale-150 transition-transform" />
              <span className="text-[15px] font-sans font-medium text-white/90">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const AuthPages: React.FC<AuthProps> = ({ mode, onSwitch }) => {
  const { login, register, language } = useAppContext();
  const t = translations[language];

  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    password: '',
    terms: false,
  });

  // Réinitialise les erreurs au changement de mode
  React.useEffect(() => {
    setError(null);
    setIsLoading(false);
  }, [mode]);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    if (pwd.length < 6) return 1;
    if (pwd.length < 10) return 2;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return 4;
    return 3;
  };
  const strength = getPasswordStrength(formData.password);
  const strengthText = (t.strengthText as string[])[strength - 1] || '';
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-primary-green'];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login({ phone: normalizePhone(formData.phone), password: formData.password });
      window.location.hash = '';
    } catch (err) {
      setError(extractErrorMessage(err, language === 'fr' ? 'Identifiants incorrects.' : 'Invalid credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        city: formData.city.trim(),
        phone: normalizePhone(formData.phone),
        password: formData.password,
      });
      window.location.hash = '';
    } catch (err) {
      setError(extractErrorMessage(err, language === 'fr' ? 'Une erreur est survenue. Réessayez.' : 'An error occurred. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full h-full pl-10 pr-4 outline-none text-sm font-medium bg-transparent";
  const wrapClass = "relative h-12 rounded-lg border border-light-gray focus-within:border-primary-blue focus-within:ring-2 focus-within:ring-primary-blue/20 transition-all flex items-center";

  return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col lg:flex-row overflow-hidden">
      <BrandPanel />
      <div className="w-full lg:w-[58%] h-full overflow-y-auto bg-white">
        <div className="min-h-full flex flex-col items-center justify-center p-6 md:p-12 py-12">
          {/* Mobile Brand */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-primary-blue text-white rounded-xl flex items-center justify-center font-display font-black text-lg mb-2 shadow-lg">DG</div>
            <h2 className="text-xl font-display font-bold text-primary-blue tracking-tight">DONALD GROS</h2>
          </div>

          <div className="w-full max-w-md">
            {/* Tabs */}
            <div className="bg-light-gray h-12 rounded-full p-1 flex items-center mb-8 md:mb-10 overflow-hidden shadow-inner">
              <button onClick={() => onSwitch('login')} className={`flex-1 h-full rounded-full font-display font-bold text-sm transition-all ${mode === 'login' ? 'bg-primary-blue text-white shadow-md' : 'text-medium-gray hover:text-dark-gray'}`}>{t.loginAction}</button>
              <button onClick={() => onSwitch('signup')} className={`flex-1 h-full rounded-full font-display font-bold text-sm transition-all ${mode === 'signup' ? 'bg-primary-blue text-white shadow-md' : 'text-medium-gray hover:text-dark-gray'}`}>{t.signupAction}</button>
            </div>

            {/* Bandeau erreur global */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* ── CONNEXION ── */}
              {mode === 'login' ? (
                <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="mb-8">
                    <h1 className="text-2xl font-display font-bold text-dark-gray mb-1">{t.authWelcome}</h1>
                    <p className="text-medium-gray text-sm">{t.authWelcomeSub}</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    {/* Téléphone */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-dark-gray block">{t.phoneLabel}</label>
                      <div className="flex h-12 rounded-lg border border-light-gray overflow-hidden focus-within:border-primary-blue focus-within:ring-2 focus-within:ring-primary-blue/20 transition-all">
                        <div className="bg-light-gray/50 px-4 flex items-center gap-2 border-r border-light-gray shrink-0">
                          <span className="text-base">🇨🇲</span>
                          <span className="font-bold text-dark-gray">+237</span>
                        </div>
                        <div className="flex-1 relative flex items-center">
                          <Phone className="absolute left-3 w-4 h-4 text-medium-gray" />
                          <input type="tel" required placeholder="6XX XXX XXX"
                            className="w-full h-full pl-10 pr-4 outline-none text-sm font-medium"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mot de passe */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-dark-gray block">{t.passwordLabel}</label>
                      <div className={wrapClass}>
                        <Lock className="absolute left-3 w-4 h-4 text-medium-gray" />
                        <input type={showPassword ? 'text' : 'password'} required placeholder="••••••"
                          className="w-full h-full pl-10 pr-12 outline-none text-sm font-medium"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 p-1 text-medium-gray hover:text-primary-blue transition-colors">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="text-right">
                        <button type="button" className="text-xs font-bold text-primary-blue hover:underline">{t.forgotPassword}</button>
                      </div>
                    </div>

                    <button type="submit" disabled={isLoading}
                      className="w-full h-12 bg-primary-blue text-white font-display font-bold rounded-lg shadow-xl hover:bg-dark-gray transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />{language === 'fr' ? 'Connexion...' : 'Logging in...'}</> : t.loginAction}
                    </button>
                  </form>
                </motion.div>
              ) : (
                /* ── INSCRIPTION ── */
                <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="mb-6">
                    <h1 className="text-2xl font-display font-bold text-dark-gray mb-1">{t.authJoin}</h1>
                    <p className="text-medium-gray text-sm">{t.authJoinSub}</p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4 md:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-dark-gray block">{t.firstNameLabel}</label>
                        <div className={wrapClass}>
                          <User className="absolute left-3 w-4 h-4 text-medium-gray" />
                          <input type="text" required placeholder="Ex: Jean" className={inputClass}
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-dark-gray block">{t.lastNameLabel}</label>
                        <div className={wrapClass}>
                          <User className="absolute left-3 w-4 h-4 text-medium-gray" />
                          <input type="text" required placeholder="Ex: Mono" className={inputClass}
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-dark-gray block">{t.cityLabel}</label>
                      <div className={wrapClass}>
                        <MapPin className="absolute left-3 w-4 h-4 text-medium-gray" />
                        <input type="text" required placeholder="Ex: Douala, Yaoundé..." className={inputClass}
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-dark-gray block">{t.phoneLabel}</label>
                      <div className="flex h-12 rounded-lg border border-light-gray overflow-hidden focus-within:border-primary-blue focus-within:ring-2 focus-within:ring-primary-blue/20 transition-all">
                        <div className="bg-light-gray/50 px-4 flex items-center gap-2 border-r border-light-gray shrink-0">
                          <span className="text-base">🇨🇲</span>
                          <span className="font-bold text-dark-gray">+237</span>
                        </div>
                        <div className="flex-1 relative flex items-center">
                          <Phone className="absolute left-3 w-4 h-4 text-medium-gray" />
                          <input type="tel" required placeholder="6XX XXX XXX"
                            className="w-full h-full pl-10 pr-4 outline-none text-sm font-medium"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-dark-gray block">{t.passwordLabel}</label>
                      <div className={`${wrapClass} overflow-hidden`}>
                        <Lock className="absolute left-3 w-4 h-4 text-medium-gray" />
                        <input type={showPassword ? 'text' : 'password'} required placeholder="••••••"
                          className="w-full h-full pl-10 pr-12 outline-none text-sm font-medium"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 p-1 text-medium-gray hover:text-primary-blue transition-colors">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {/* Indicateur de force */}
                      <div className="pt-2 flex items-center gap-3">
                        <div className="flex-1 h-1.5 flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`flex-1 rounded-full transition-colors ${strength >= i ? strengthColors[strength - 1] : 'bg-light-gray'}`} />
                          ))}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${strength > 0 ? (strength <= 2 ? 'text-red-500' : strength === 3 ? 'text-yellow-600' : 'text-primary-green') : 'text-medium-gray'}`}>
                          {strengthText || (language === 'fr' ? 'Niveau' : 'Level')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 py-2">
                      <input type="checkbox" id="terms" required className="mt-1 w-4 h-4 rounded border-light-gray text-primary-green focus:ring-primary-green"
                        checked={formData.terms}
                        onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                      />
                      <label htmlFor="terms" className="text-xs text-medium-gray leading-relaxed">{t.termsText}</label>
                    </div>

                    <button type="submit" disabled={isLoading}
                      className="w-full h-12 bg-primary-green text-white font-display font-bold rounded-lg shadow-xl hover:bg-dark-gray transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />{language === 'fr' ? 'Création...' : 'Creating...'}</> : t.signupAction}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-center gap-3 px-4 py-3 bg-light-gray/50 rounded-xl border border-light-gray/50">
              <span className="w-2 h-2 bg-primary-green rounded-full animate-pulse shrink-0" />
              <p className="text-[11px] text-medium-gray font-sans">{t.secureConn}</p>
            </div>

            <button onClick={() => window.location.hash = ''} className="w-full text-center mt-8 text-sm text-medium-gray hover:text-primary-blue transition-colors font-medium">
              {t.backToShop}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

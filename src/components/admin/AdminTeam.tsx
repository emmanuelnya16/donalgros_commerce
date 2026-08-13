import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, Shield, Mail, Key, Copy, Check, Info, Loader2, ArrowRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { extractErrorMessage, CreatedAdminData } from '../../services/adminAuthService';

export const AdminTeam = () => {
  const { createAdmin } = useAppContext();
  
  // Form state
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<'ROLE_SUPER_ADMIN' | 'ROLE_MANAGER'>('ROLE_MANAGER');
  
  const [error, setError] = React.useState('');
  const [createdAdmin, setCreatedAdmin] = React.useState<CreatedAdminData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;

    setIsLoading(true);
    setError('');
    setCreatedAdmin(null);

    try {
      const data = await createAdmin({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        role
      });
      setCreatedAdmin(data);
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setRole('ROLE_MANAGER');
    } catch (err) {
      setError(extractErrorMessage(err, "Erreur lors de la création du compte administrateur."));
    } finally {
      setIsLoading(false);
    }
  };

  const getActivationLink = () => {
    if (!createdAdmin || !createdAdmin.activationToken) return '';
    return `${window.location.origin}${window.location.pathname}#admin/activate?token=${createdAdmin.activationToken}`;
  };

  const handleCopyLink = () => {
    const link = getActivationLink();
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-600/10 text-primary-blue rounded-xl">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl text-dark-gray uppercase tracking-tighter">Gestion de l'Équipe</h1>
          <p className="text-xs text-medium-gray font-medium">Créez et configurez les accès des membres du personnel d'administration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-3xl shadow-sm border border-light-gray overflow-hidden">
            <div className="p-6 border-b border-light-gray bg-light-gray/20 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary-blue" />
              <h3 className="font-display font-black text-lg text-dark-gray uppercase tracking-tighter">Ajouter un collaborateur</h3>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold flex gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Prénom</label>
                  <input
                    required
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ex: Jean"
                    className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all font-bold text-sm"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Nom de famille</label>
                  <input
                    required
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ex: Dupont"
                    className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all font-bold text-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Adresse E-mail pro</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-medium-gray" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jean.dupont@donaldgros.com"
                    className="w-full h-11 pl-11 pr-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all font-bold text-sm"
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Rôle d'administration</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ROLE_MANAGER */}
                  <button
                    type="button"
                    onClick={() => setRole('ROLE_MANAGER')}
                    className={`p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col ${
                      role === 'ROLE_MANAGER'
                        ? 'border-primary-blue bg-blue-50/20 text-primary-blue'
                        : 'border-light-gray hover:bg-gray-50 text-dark-gray'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <Shield className={`w-5 h-5 ${role === 'ROLE_MANAGER' ? 'text-primary-blue' : 'text-medium-gray'}`} />
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${role === 'ROLE_MANAGER' ? 'border-primary-blue' : 'border-medium-gray'}`}>
                        {role === 'ROLE_MANAGER' && <span className="w-2.5 h-2.5 bg-primary-blue rounded-full" />}
                      </span>
                    </div>
                    <span className="font-bold text-sm">Gestionnaire (Simple Admin)</span>
                    <span className="text-[10px] text-medium-gray mt-1 leading-tight font-medium">
                      Accès limité. Ne peut gérer que le catalogue (produits et catégories). Restreint du dashboard, des commandes, des clients et des paramètres.
                    </span>
                  </button>

                  {/* ROLE_SUPER_ADMIN */}
                  <button
                    type="button"
                    onClick={() => setRole('ROLE_SUPER_ADMIN')}
                    className={`p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col ${
                      role === 'ROLE_SUPER_ADMIN'
                        ? 'border-primary-blue bg-blue-50/20 text-primary-blue'
                        : 'border-light-gray hover:bg-gray-50 text-dark-gray'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <Shield className={`w-5 h-5 ${role === 'ROLE_SUPER_ADMIN' ? 'text-primary-blue' : 'text-medium-gray'}`} />
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${role === 'ROLE_SUPER_ADMIN' ? 'border-primary-blue' : 'border-medium-gray'}`}>
                        {role === 'ROLE_SUPER_ADMIN' && <span className="w-2.5 h-2.5 bg-primary-blue rounded-full" />}
                      </span>
                    </div>
                    <span className="font-bold text-sm">Super Administrateur</span>
                    <span className="text-[10px] text-medium-gray mt-1 leading-tight font-medium">
                      Accès illimité. Contrôle total de la boutique, de la configuration de paiement, des commandes, des clients, et de la création d'équipe.
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t border-light-gray">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 px-8 bg-primary-blue text-white rounded-xl font-display font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary-blue/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Inviter le collaborateur</>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Info / Result Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Result Alert */}
          <AnimatePresence mode="wait">
            {createdAdmin ? (
              <motion.div
                key="success-alert"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-xl shadow-emerald-500/5 space-y-4"
              >
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-black text-base text-dark-gray uppercase tracking-tighter">Compte créé !</h4>
                  <p className="text-xs text-medium-gray mt-1">L'administrateur <strong>{createdAdmin.firstName} {createdAdmin.lastName}</strong> a été créé avec le rôle <strong>{createdAdmin.role === 'ROLE_SUPER_ADMIN' ? 'Super Admin' : 'Gestionnaire'}</strong>.</p>
                </div>

                {createdAdmin.mailSent ? (
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-[10px] font-bold border border-emerald-100 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    Un e-mail d'activation a été envoyé.
                  </div>
                ) : (
                  <div className="bg-amber-50 text-amber-700 p-3 rounded-xl text-[10px] font-bold border border-amber-100 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    Le serveur mail local est inactif, utilisez le jeton ci-dessous.
                  </div>
                )}

                {createdAdmin.activationToken && (
                  <div className="space-y-2 pt-2 border-t border-light-gray">
                    <span className="text-[10px] font-black text-medium-gray uppercase tracking-wider block">Lien de test d'activation :</span>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        type="text"
                        value={getActivationLink()}
                        className="flex-1 h-9 px-2 bg-light-gray/50 border border-light-gray rounded-lg text-[10px] font-mono outline-none"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="h-9 px-3 bg-primary-blue text-white rounded-lg hover:bg-dark-gray transition-colors flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-wider"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copié' : 'Copier'}
                      </button>
                    </div>
                    <span className="text-[9px] text-medium-gray block italic">
                      Copiez ce lien et ouvrez-le dans un nouvel onglet pour simuler la configuration du mot de passe en mode dev.
                    </span>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="info-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-6 border border-light-gray shadow-sm space-y-4"
              >
                <div className="w-12 h-12 bg-blue-50 text-primary-blue rounded-2xl flex items-center justify-center">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-black text-base text-dark-gray uppercase tracking-tighter">Processus d'invitation</h4>
                  <ul className="text-xs text-medium-gray space-y-2 mt-3 list-decimal list-inside font-medium">
                    <li>Saisissez l'identité du collaborateur.</li>
                    <li>Choisissez le niveau d'autorisation.</li>
                    <li>Un jeton temporaire de sécurité est créé en base.</li>
                    <li>Un e-mail contenant un lien d'activation sécurisé est envoyé.</li>
                    <li>Le nouveau collaborateur clique sur le lien pour configurer son mot de passe définitif.</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

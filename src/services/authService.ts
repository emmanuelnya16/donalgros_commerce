/**
 * authService.ts — Donald Gros E-commerce
 *
 * Toutes les fonctions d'authentification cliente (User).
 * Utilise l'instance Axios centralisée avec gestion du token.
 */

import api, { tokenStore } from './api';

// ─── Types — miroir du backend Symfony ───────────────────────────────────────

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  city: string | null;
  status: 'active' | 'blocked';
  createdAt?: string;
}

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  city: string;
  phone: string;
  password: string;
}

interface SymfonyResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface AuthResponseData {
  accessToken: string;
  user: AuthUser;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Normalise le numéro de téléphone camerounais côté frontend
 * pour s'assurer qu'il commence par +237.
 * Le backend fait la même chose, mais ça évite les erreurs de validation.
 */
export const normalizePhone = (phone: string): string => {
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.startsWith('+237')) return cleaned;
  if (cleaned.startsWith('237')) return '+' + cleaned;
  return '+237' + cleaned;
};

// ─── Fonctions d'authentification ────────────────────────────────────────────

/**
 * Connexion client — POST /api/auth/login
 * Stocke l'access token en mémoire.
 * Le refresh token est automatiquement stocké dans le cookie HttpOnly.
 */
export const userLogin = async (payload: LoginPayload): Promise<AuthUser> => {
  const { data } = await api.post<SymfonyResponse<AuthResponseData>>(
    '/api/auth/login',
    {
      phone: normalizePhone(payload.phone),
      password: payload.password,
    }
  );

  tokenStore.set(data.data.accessToken);
  return data.data.user;
};

/**
 * Inscription client — POST /api/auth/register
 */
export const userRegister = async (payload: RegisterPayload): Promise<AuthUser> => {
  const { data } = await api.post<SymfonyResponse<AuthResponseData>>(
    '/api/auth/register',
    {
      ...payload,
      phone: normalizePhone(payload.phone),
    }
  );

  tokenStore.set(data.data.accessToken);
  return data.data.user;
};

/**
 * Déconnexion — POST /api/auth/logout
 * Révoque les refresh tokens en base + efface le cookie côté serveur.
 */
export const userLogout = async (): Promise<void> => {
  try {
    await api.post('/api/auth/logout');
  } catch {
    // On déconnecte quand même côté client même si le serveur échoue
  } finally {
    tokenStore.clear();
  }
};

/**
 * Récupère le profil de l'utilisateur connecté — GET /api/auth/me
 * Utilisé au démarrage de l'app pour restaurer la session depuis le cookie.
 */
export const getMe = async (): Promise<AuthUser | null> => {
  try {
    // D'abord on tente un refresh silencieux (cookie HttpOnly présent ?)
    const { data: refreshData } = await api.post<SymfonyResponse<AuthResponseData>>(
      '/api/auth/refresh'
    );
    tokenStore.set(refreshData.data.accessToken);

    // Ensuite on récupère le profil complet
    const { data } = await api.get<SymfonyResponse<AuthUser>>('/api/auth/me');
    return data.data;
  } catch {
    tokenStore.clear();
    return null;
  }
};

/**
 * Extrait un message d'erreur lisible depuis une réponse Axios/Symfony.
 */
export const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== 'object') return fallback;
  const axiosError = error as {
    response?: { data?: { message?: string; errors?: Record<string, string[]> } };
  };
  const data = axiosError.response?.data;
  if (!data) return fallback;

  // Erreur de validation — affiche le premier message d'erreur de champ
  if (data.errors) {
    const firstField = Object.values(data.errors)[0];
    if (Array.isArray(firstField) && firstField.length > 0) return firstField[0];
  }

  return data.message ?? fallback;
};

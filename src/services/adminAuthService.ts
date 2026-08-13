/**
 * adminAuthService.ts — Donald Gros E-commerce
 *
 * Fonctions d'authentification administrateur.
 * Endpoint : POST /api/admin/auth/login
 * Identifiant : email professionnel (pas de téléphone)
 */

import api, { tokenStore } from './api';
import { extractErrorMessage } from './authService';

// ─── Types — miroir du backend Symfony Admin entity ──────────────────────────

export interface AuthAdmin {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: 'ROLE_SUPER_ADMIN' | 'ROLE_MANAGER';
  isSuperAdmin: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
}

export interface AdminLoginPayload {
  email: string;
  password: string;
}

interface SymfonyResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface AdminAuthResponseData {
  accessToken: string;
  admin: AuthAdmin;
}

// ─── Fonctions d'authentification Admin ──────────────────────────────────────

/**
 * Connexion admin — POST /api/admin/auth/login
 * Identifiant : email | Mot de passe
 * Le refresh token est stocké dans un cookie HttpOnly côté serveur.
 */
export const adminLogin = async (payload: AdminLoginPayload): Promise<AuthAdmin> => {
  const { data } = await api.post<SymfonyResponse<AdminAuthResponseData>>(
    '/api/admin/auth/login',
    payload
  );

  tokenStore.set(data.data.accessToken);
  return data.data.admin;
};

/**
 * Déconnexion admin — POST /api/admin/auth/logout
 * Révoque tous les refresh tokens admin en base.
 */
export const adminLogout = async (): Promise<void> => {
  try {
    await api.post('/api/admin/auth/logout');
  } catch {
    // Déconnexion côté client même si le serveur échoue
  } finally {
    tokenStore.clear();
  }
};

/**
 * Restauration de session admin au démarrage — via cookie HttpOnly
 * Appelle /api/auth/refresh puis /api/admin/auth/me
 */
export const getAdminMe = async (): Promise<AuthAdmin | null> => {
  try {
    const { data: refreshData } = await api.post<SymfonyResponse<AdminAuthResponseData>>(
      '/api/auth/refresh'
    );
    tokenStore.set(refreshData.data.accessToken);

    const { data } = await api.get<SymfonyResponse<AuthAdmin>>('/api/admin/auth/me');
    return data.data;
  } catch {
    tokenStore.clear();
    return null;
  }
};

// ─── Nouvelles fonctionnalités d'administration (Création & Activation) ───────

export interface CreateAdminPayload {
  firstName: string;
  lastName: string;
  email: string;
  role: 'ROLE_SUPER_ADMIN' | 'ROLE_MANAGER';
}

export interface CreatedAdminData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ROLE_SUPER_ADMIN' | 'ROLE_MANAGER';
  isActive: boolean;
  activationToken?: string;
  mailSent: boolean;
}

export interface ActivateAdminPayload {
  token: string;
  password: string;
}

/**
  * Créer un administrateur — POST /api/admin/users
  * Nécessite le rôle ROLE_SUPER_ADMIN
  */
export const createAdmin = async (payload: CreateAdminPayload): Promise<CreatedAdminData> => {
  const { data } = await api.post<SymfonyResponse<CreatedAdminData>>(
    '/api/admin/users',
    payload
  );
  return data.data;
};

/**
  * Activer un compte administrateur — POST /api/admin/auth/activate
  * Public, pas de token requis
  */
export const activateAdmin = async (payload: ActivateAdminPayload): Promise<void> => {
  await api.post<SymfonyResponse<null>>(
    '/api/admin/auth/activate',
    payload
  );
};

export { extractErrorMessage };


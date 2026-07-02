/**
 * Client Axios centralisé — Donald Gros E-commerce
 *
 * Stratégie d'authentification :
 *   - Access Token (JWT 1h)  → stocké en mémoire (module-level variable)
 *   - Refresh Token (7 jours) → Cookie HttpOnly géré automatiquement par le navigateur
 *
 * Quand l'access token expire (401), l'interceptor appelle automatiquement
 * POST /api/auth/refresh et rejoue la requête originale.
 */

import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

// ─── Token en mémoire ─────────────────────────────────────────────────────────
// Jamais stocké en localStorage/sessionStorage → protégé contre XSS
let _accessToken: string | null = null;

export const tokenStore = {
  get: (): string | null => _accessToken,
  set: (token: string | null): void => { _accessToken = token; },
  clear: (): void => { _accessToken = null; },
};

// ─── Instance Axios ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,   // envoie automatiquement le cookie HttpOnly refresh_token
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15_000,
});

// ─── Interceptor REQUEST — attache le JWT ─────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.get();
  
  // Ne pas envoyer de token pour les requêtes strictement publiques.
  // Cela évite que Symfony bloque l'admin sur le firewall User.
  const isPublicApiRoute = config.url && (
    config.url.startsWith('/api/categories') ||
    config.url.startsWith('/api/products') ||
    config.url.startsWith('/api/banners')
  ) && !config.url.startsWith('/api/admin');

  if (token && config.headers && !isPublicApiRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Interceptor RESPONSE — refresh automatique ───────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Ignore les erreurs non-401 ou les routes de login/refresh (évite boucle infinie)
    const isAuthRoute =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status !== 401 || originalRequest._retry || isAuthRoute) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // File d'attente : d'autres requêtes attendent le nouveau token
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Tente de rafraîchir via le cookie HttpOnly (withCredentials = true)
      const { data } = await axios.post<{
        success: boolean;
        data: { accessToken: string };
      }>(
        `${BASE_URL}/api/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newToken = data.data.accessToken;
      tokenStore.set(newToken);
      processQueue(null, newToken);

      if (originalRequest.headers) {
        (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      tokenStore.clear();
      processQueue(refreshError as AxiosError, null);
      // Émettre un événement pour que le Context déconnecte l'utilisateur
      window.dispatchEvent(new CustomEvent('auth:logout'));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;

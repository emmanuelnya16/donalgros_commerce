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

// En développement : BASE_URL = '' → toutes les requêtes /api/* passent par le proxy Vite
// (vite.config.ts redirige /api → localhost:8000 côté SERVEUR, pas navigateur)
// → même origine pour le navigateur → cookie HttpOnly envoyé automatiquement ✅
//
// En production : BASE_URL = VITE_API_URL (même domaine, pas de proxy nécessaire)
const BASE_URL = import.meta.env.DEV
  ? ''                                          // dev : proxy Vite actif
  : (import.meta.env.VITE_API_URL ?? '');

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
  timeout: 30_000,  // 30s — laisse le temps au serveur de démarrer
});

// ─── Utilitaire Retry avec Backoff Exponentiel ────────────────────────────────
/**
 * Réessaie une fonction async en cas d'erreur réseau (pas de réponse du serveur).
 * Utile au démarrage quand Symfony vient de se lancer et n'est pas encore prêt.
 *
 * @param fn          La fonction async à réessayer
 * @param retries     Nombre max de tentatives (défaut: 4)
 * @param baseDelayMs Délai initial en ms (double à chaque tentative)
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 4,
  baseDelayMs = 800
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isNetworkError =
        axios.isAxiosError(err) &&
        (!err.response || err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK');

      // Ne pas réessayer sur les erreurs métier (4xx, 5xx)
      if (!isNetworkError || attempt === retries) throw err;

      const delay = baseDelayMs * Math.pow(2, attempt); // 800, 1600, 3200, 6400…
      console.warn(`[retry] Tentative ${attempt + 1}/${retries} échouée, nouvel essai dans ${delay}ms…`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

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
    // Détecter les erreurs de connexion ou de dépassement de délai (timeout)
    const isTimeoutOrNetworkError = 
      error.code === 'ECONNABORTED' || 
      error.message?.toLowerCase().includes('timeout') || 
      error.message?.toLowerCase().includes('network error') ||
      !error.response;

    if (isTimeoutOrNetworkError) {
      // On ne modifie pas le message ici pour ne pas masquer le type d'erreur
      // Le retry est géré par retryWithBackoff au niveau des services
      return Promise.reject(error);
    }

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

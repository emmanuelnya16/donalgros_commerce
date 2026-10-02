/**
 * trackingService.ts - Donald Gros E-commerce
 *
 * Tracker maison : envoie un evenement de visite de page
 * vers notre backend Symfony (POST /api/track).
 *
 * Caracteristiques :
 *   - Fire-and-forget (pas d attente de reponse)
 *   - Silencieux en cas d erreur reseau (ne plante pas le site)
 *   - N envoie pas les pages admin (prefixe /admin)
 *   - Utilise fetch natif (pas axios) pour etre leger et independent
 */

const TRACK_URL = '/api/track';

/**
 * Envoie une visite de page au backend.
 *
 * @param page     Chemin de la page visitee (ex: "/products", "/catalogue")
 * @param referrer URL de provenance (document.referrer, vide si acces direct)
 */
export function trackPageView(page: string, referrer: string = ''): void {
  // Ne pas tracker les pages admin
  if (page.startsWith('admin') || page.startsWith('/admin')) return;

  // Ne pas tracker les pages systeme
  if (page === '' || page === '/') {
    page = '/';
  } else {
    // Normalise le chemin : toujours commencer par /
    if (!page.startsWith('/')) page = '/' + page;
  }

  // Fire-and-forget - on ne bloque pas le rendu
  fetch(TRACK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page, referrer }),
    // keepalive permet d envoyer meme si la page se ferme
    keepalive: true,
  }).catch(() => {
    // Silencieux - une erreur reseau ne doit pas impacter l UX
  });
}

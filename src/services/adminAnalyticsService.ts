/**
 * adminAnalyticsService.ts
 * Appelle le backend Symfony pour récupérer les données Google Analytics 4
 */

// Même pattern que les autres services admin du projet
const BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL ?? '');

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DailyStats {
  date: string;       // format : "20240924"
  visiteurs: number;
  pagesVues: number;
}

export interface TrafficSource {
  source: string;
  visiteurs: number;
}

export interface TopPage {
  page: string;
  visiteurs: number;
}

export interface AnalyticsOverview {
  totalVisiteurs: number;
  totalPagesVues: number;
  moyennePagesParSession: number;
  tauxRebond: number;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  daily: DailyStats[];
  sources: TrafficSource[];
  topPages: TopPage[];
  period: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export async function fetchAnalytics(
  startDate: string = '30daysAgo',
  endDate: string = 'today'
): Promise<AnalyticsData> {
  const base = BASE_URL;
  const params = new URLSearchParams({ startDate, endDate });
  const url = `${base}/admin/analytics?${params}`;

  const token = localStorage.getItem('admin_token');
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erreur API analytics (${response.status}): ${text}`);
  }

  return response.json();
}

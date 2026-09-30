/**
 * adminAnalyticsService.ts
 * Appelle le backend Symfony pour récupérer les données Google Analytics 4
 */

import api from './api';

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
  const params = new URLSearchParams({ startDate, endDate });
  const { data } = await api.get<{ data: AnalyticsData }>(`/api/admin/analytics?${params}`);
  return data.data;
}

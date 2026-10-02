/**
 * adminAnalyticsService.ts - Donald Gros E-commerce
 *
 * Appelle les endpoints de notre propre backend Symfony (tracker maison).
 * Remplace l ancien service Google Analytics 4.
 *
 * Endpoints consommes :
 *   GET /api/admin/stats/overview
 *   GET /api/admin/stats/visits-per-day?days=N
 *   GET /api/admin/stats/top-pages?limit=10
 *   GET /api/admin/stats/referrers?limit=10
 *   GET /api/admin/stats/peak-hours
 */

import api from './api';

// Types

export interface StatsOverview {
  totalVisits: number;
  uniqueVisitors: number;
  visitsToday: number;
  visitsThisWeek: number;
  visitsThisMonth: number;
}

export interface DailyVisit {
  day: string;
  visits: number;
}

export interface TopPage {
  page: string;
  visits: number;
}

export interface Referrer {
  source: string;
  visits: number;
}

export interface PeakHour {
  hour: number;
  visits: number;
}

// Service functions

export async function getStatsOverview(): Promise<StatsOverview> {
  const { data } = await api.get<{ data: StatsOverview }>('/api/admin/stats/overview');
  return data.data;
}

export async function getVisitsPerDay(days: number = 30): Promise<DailyVisit[]> {
  const { data } = await api.get<{ data: { days: number; chart: DailyVisit[] } }>(
    `/api/admin/stats/visits-per-day?days=${days}`
  );
  return data.data.chart;
}

export async function getTopPages(limit: number = 10): Promise<TopPage[]> {
  const { data } = await api.get<{ data: { topPages: TopPage[] } }>(
    `/api/admin/stats/top-pages?limit=${limit}`
  );
  return data.data.topPages;
}

export async function getReferrers(limit: number = 10): Promise<Referrer[]> {
  const { data } = await api.get<{ data: { referrers: Referrer[] } }>(
    `/api/admin/stats/referrers?limit=${limit}`
  );
  return data.data.referrers;
}

export async function getPeakHours(): Promise<PeakHour[]> {
  const { data } = await api.get<{ data: { peakHours: PeakHour[] } }>(
    '/api/admin/stats/peak-hours'
  );
  return data.data.peakHours;
}

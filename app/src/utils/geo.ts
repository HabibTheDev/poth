import { LatLng } from '@/types/domain';

const EARTH_RADIUS_KM = 6371;

export function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_KM * c;
}

export function haversineMeters(a: LatLng, b: LatLng): number {
  return haversineKm(a, b) * 1000;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

export function formatRelativeTime(iso: string, t: (path: string, vars?: Record<string, string | number>) => string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.max(0, Math.round(diffMs / 60000));
  if (diffMin < 1) return t('common.justNow');
  if (diffMin < 60) return t('common.minutesAgo', { count: diffMin });
  const hrs = Math.round(diffMin / 60);
  return t('common.hoursAgo', { count: hrs });
}

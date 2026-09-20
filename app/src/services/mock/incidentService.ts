import { IncidentService } from '../types';
import { mockIncidents } from '@/mocks/dhaka';
import { Incident, IncidentType } from '@/types/domain';
import { haversineKm } from '@/utils/geo';
import { delay, uid } from './util';

let incidents: Incident[] = [...mockIncidents];

// Section 12: nearby reports of the same type should merge into one
// incident cluster rather than spawning independent reports.
const MERGE_RADIUS_KM = 0.15;

// Section 13: confirmations extend the effective lifetime, with a cap
// to prevent indefinite extension abuse.
const CONFIRM_EXTENSION_MIN = 15;
const MAX_LIFETIME_MIN = 180;

function isLive(i: Incident) {
  return new Date(i.expiresAt).getTime() > Date.now();
}

export const mockIncidentService: IncidentService = {
  async listNearby(center, radiusKm) {
    const nearby = incidents.filter(
      (i) => isLive(i) && haversineKm(center, i.location) <= radiusKm
    );
    return delay(nearby, 450);
  },

  async report({ type, location, description, photoUrl }) {
    const existing = incidents.find(
      (i) => isLive(i) && i.type === type && haversineKm(i.location, location) <= MERGE_RADIUS_KM
    );

    if (existing) {
      const updated: Incident = {
        ...existing,
        confirmCount: existing.confirmCount + 1,
        lastConfirmedAt: new Date().toISOString(),
        confidence: Math.min(97, existing.confidence + 6),
        status: 'active',
      };
      incidents = incidents.map((i) => (i.id === existing.id ? updated : i));
      return delay(updated, 500);
    }

    const created: Incident = {
      id: uid('i'),
      type,
      location,
      description,
      photoUrl,
      severity: 2,
      reporterId: 'u1',
      reporterName: 'You',
      createdAt: new Date().toISOString(),
      lastConfirmedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 20 * 60_000).toISOString(),
      status: 'reported',
      confirmCount: 1,
      denyCount: 0,
      confidence: 40,
    };
    incidents = [created, ...incidents];
    return delay(created, 500);
  },

  async confirm(id, stillActive) {
    const target = incidents.find((i) => i.id === id);
    if (!target) throw new Error('Incident not found');

    let updated: Incident;
    if (stillActive) {
      const createdAt = new Date(target.createdAt).getTime();
      const proposedExpiry = Date.now() + CONFIRM_EXTENSION_MIN * 60_000;
      const cappedExpiry = Math.min(proposedExpiry, createdAt + MAX_LIFETIME_MIN * 60_000);
      updated = {
        ...target,
        confirmCount: target.confirmCount + 1,
        lastConfirmedAt: new Date().toISOString(),
        expiresAt: new Date(cappedExpiry).toISOString(),
        confidence: Math.min(97, target.confidence + 4),
        status: 'confirmed',
      };
    } else {
      const nextDeny = target.denyCount + 1;
      const resolved = nextDeny >= 3;
      updated = {
        ...target,
        denyCount: nextDeny,
        confidence: Math.max(5, target.confidence - 20),
        status: resolved ? 'resolved' : target.status,
        expiresAt: resolved ? new Date().toISOString() : target.expiresAt,
      };
    }

    incidents = incidents.map((i) => (i.id === id ? updated : i));
    return delay(updated, 400);
  },
};

export function seedIncidentTypeLabel(type: IncidentType) {
  return type;
}

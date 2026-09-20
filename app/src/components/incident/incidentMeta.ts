import { Ionicons } from '@expo/vector-icons';
import { IncidentType } from '@/types/domain';

export const INCIDENT_TYPES: IncidentType[] = [
  'traffic_jam',
  'heavy_traffic',
  'road_blocked',
  'accident',
  'police',
  'construction',
  'pothole',
  'bad_road',
  'waterlogging',
  'broken_signal',
  'toll',
  'hazard',
  'breakdown',
  'other',
];

export const INCIDENT_ICONS: Record<IncidentType, keyof typeof Ionicons.glyphMap> = {
  traffic_jam: 'car',
  heavy_traffic: 'car-sport',
  road_blocked: 'close-circle',
  accident: 'warning',
  police: 'shield',
  construction: 'construct',
  pothole: 'ellipse',
  bad_road: 'trail-sign',
  waterlogging: 'water',
  broken_signal: 'radio-button-off',
  toll: 'cash',
  hazard: 'alert',
  breakdown: 'build',
  other: 'information-circle',
};

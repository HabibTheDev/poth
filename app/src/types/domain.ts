export type LatLng = { latitude: number; longitude: number };

// ---------- Vehicles ----------
export type VehicleType =
  | 'motorcycle'
  | 'car'
  | 'suv'
  | 'truck'
  | 'cng'
  | 'microbus'
  | 'bicycle'
  | 'other';

export type FuelType = 'petrol' | 'diesel' | 'cng' | 'octane' | 'electric';

export interface Vehicle {
  id: string;
  type: VehicleType;
  brand: string;
  model: string;
  year?: number;
  fuelType: FuelType;
  tankCapacityLiters: number;
  mileageKmPerLiter: number;
  odometerKm: number;
  currentFuelLiters: number;
  isDefault: boolean;
}

// ---------- Incidents ----------
export type IncidentType =
  | 'traffic_jam'
  | 'heavy_traffic'
  | 'road_blocked'
  | 'accident'
  | 'police'
  | 'construction'
  | 'pothole'
  | 'bad_road'
  | 'waterlogging'
  | 'broken_signal'
  | 'toll'
  | 'hazard'
  | 'breakdown'
  | 'other';

export type IncidentStatus = 'reported' | 'confirmed' | 'active' | 'resolved' | 'expired';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface Incident {
  id: string;
  type: IncidentType;
  location: LatLng;
  roadName?: string;
  description?: string;
  severity: 1 | 2 | 3;
  reporterId: string;
  reporterName: string;
  createdAt: string; // ISO timestamp
  lastConfirmedAt: string;
  expiresAt: string;
  status: IncidentStatus;
  confirmCount: number;
  denyCount: number;
  confidence: number; // 0-100
  photoUrl?: string;
}

export function confidenceLevel(score: number): ConfidenceLevel {
  if (score >= 75) return 'high';
  if (score >= 45) return 'medium';
  return 'low';
}

// ---------- Fuel intelligence ----------
export interface FuelEstimate {
  distanceKm: number;
  mileageKmPerLiter: number;
  fuelAvailableLiters: number;
  fuelRequiredLiters: number;
  canReach: boolean;
  estimatedRemainingLiters: number;
  shortfallLiters?: number;
  recommendedStopAtKm?: number;
}

// ---------- Trips ----------
export interface TripCostEstimate {
  distanceKm: number;
  fuelCostBdt: number;
  tollCostBdt: number;
  parkingCostBdt: number;
  totalBdt: number;
}

export interface Trip {
  id: string;
  vehicleId: string;
  startLabel: string;
  destinationLabel: string;
  distanceKm: number;
  durationMin: number;
  estimatedFuelLiters: number;
  estimatedCostBdt: number;
  completedAt: string;
}

// ---------- Navigation / routing ----------
export type RoutePreference = 'fastest' | 'cheapest' | 'safest' | 'best_road';

export interface RouteOption {
  id: string;
  preference: RoutePreference;
  distanceKm: number;
  durationMin: number;
  fuelCostBdt: number;
  riskScore: number; // 0-10, lower is safer
  roadQualityScore: number; // 0-10, higher is better
}

export interface NavigationStep {
  id: string;
  instruction: string;
  distanceMeters: number;
  roadName: string;
}

// ---------- Places ----------
export type PlaceCategory = 'fuel_station' | 'mechanic' | 'hospital' | 'police' | 'saved';

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  location: LatLng;
  address?: string;
}

// ---------- Community ----------
export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorReputation: number;
  title: string;
  body: string;
  imageUrl?: string;
  createdAt: string;
  reactionCount: number;
  commentCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

// ---------- User ----------
export interface User {
  id: string;
  name: string;
  phone: string;
  reputationScore: number;
  createdAt: string;
}

// ---------- Road intelligence ----------
export interface RoadScore {
  overall: number; // 0-10
  roadQuality: number;
  traffic: number;
  bikeFriendliness: number;
  currentRisk: number;
}

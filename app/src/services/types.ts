import {
  Vehicle,
  Incident,
  IncidentType,
  FuelEstimate,
  TripCostEstimate,
  Trip,
  Place,
  CommunityPost,
  Comment,
  User,
  LatLng,
  RouteOption,
  RoutePreference,
} from '@/types/domain';

export interface AuthService {
  requestOtp(phone: string): Promise<{ requestId: string }>;
  verifyOtp(requestId: string, code: string, name?: string): Promise<{ user: User; token: string }>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

export interface VehicleService {
  list(): Promise<Vehicle[]>;
  add(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle>;
  update(id: string, patch: Partial<Vehicle>): Promise<Vehicle>;
  remove(id: string): Promise<void>;
  setDefault(id: string): Promise<void>;
}

export interface IncidentService {
  listNearby(center: LatLng, radiusKm: number): Promise<Incident[]>;
  report(input: {
    type: IncidentType;
    location: LatLng;
    description?: string;
    photoUrl?: string;
  }): Promise<Incident>;
  confirm(id: string, stillActive: boolean): Promise<Incident>;
}

export interface FuelService {
  estimate(input: {
    distanceKm: number;
    mileageKmPerLiter: number;
    fuelAvailableLiters: number;
    tankCapacityLiters: number;
  }): Promise<FuelEstimate>;
}

export interface TripService {
  estimateCost(input: { distanceKm: number; mileageKmPerLiter: number }): Promise<TripCostEstimate>;
  listHistory(vehicleId?: string): Promise<Trip[]>;
}

export interface PlacesService {
  listNearby(center: LatLng, category?: string): Promise<Place[]>;
}

export interface CommunityService {
  listPosts(): Promise<CommunityPost[]>;
  getPost(id: string): Promise<CommunityPost | null>;
  listComments(postId: string): Promise<Comment[]>;
  addComment(postId: string, body: string): Promise<Comment>;
  createPost(input: { title: string; body: string }): Promise<CommunityPost>;
}

export interface NavigationService {
  getRouteOptions(origin: LatLng, destination: LatLng): Promise<RouteOption[]>;
  getRoutePolyline(origin: LatLng, destination: LatLng, preference: RoutePreference): Promise<LatLng[]>;
}

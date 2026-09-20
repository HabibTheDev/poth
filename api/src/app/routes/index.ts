import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { UserRoutes } from '../modules/User/user.route';
import { VehicleRoutes } from '../modules/Vehicle/vehicle.route';
import { IncidentRoutes } from '../modules/Incident/incident.route';
import { PlaceRoutes } from '../modules/Place/place.route';
import { SavedRouteRoutes } from '../modules/Route/route.route';
import { FuelRoutes } from '../modules/Fuel/fuel.route';
import { TripRoutes } from '../modules/Trip/trip.route';
import { TollPointRoutes } from '../modules/Toll/toll.route';
import { CommunityRoutes } from '../modules/Community/community.route';
import { NotificationRoutes } from '../modules/Notification/notification.route';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/vehicles', route: VehicleRoutes },
  { path: '/incidents', route: IncidentRoutes },
  { path: '/places', route: PlaceRoutes },
  { path: '/routes', route: SavedRouteRoutes },
  { path: '/fuel', route: FuelRoutes },
  { path: '/trips', route: TripRoutes },
  { path: '/tolls', route: TollPointRoutes },
  { path: '/community', route: CommunityRoutes },
  { path: '/notifications', route: NotificationRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

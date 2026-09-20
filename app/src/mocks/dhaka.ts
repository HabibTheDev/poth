import { Incident, Vehicle, Place, CommunityPost, Comment, Trip, User } from '@/types/domain';

// Central Dhaka reference point (roughly Farmgate)
export const DHAKA_CENTER = { latitude: 23.7568, longitude: 90.3888 };

export const mockUser: User = {
  id: 'u1',
  name: 'Rafiul Islam',
  phone: '01812-345678',
  reputationScore: 82,
  createdAt: '2025-11-02T08:00:00.000Z',
};

export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    type: 'motorcycle',
    brand: 'Yamaha',
    model: 'R15',
    year: 2023,
    fuelType: 'petrol',
    tankCapacityLiters: 11,
    mileageKmPerLiter: 38,
    odometerKm: 8420,
    currentFuelLiters: 5.2,
    isDefault: true,
  },
  {
    id: 'v2',
    type: 'car',
    brand: 'Toyota',
    model: 'Axio',
    year: 2019,
    fuelType: 'petrol',
    tankCapacityLiters: 42,
    mileageKmPerLiter: 13,
    odometerKm: 61230,
    currentFuelLiters: 18,
    isDefault: false,
  },
];

function minutesAgoIso(min: number) {
  return new Date(Date.now() - min * 60_000).toISOString();
}
function minutesFromNowIso(min: number) {
  return new Date(Date.now() + min * 60_000).toISOString();
}

export const mockIncidents: Incident[] = [
  {
    id: 'i1',
    type: 'road_blocked',
    location: { latitude: 23.7589, longitude: 90.3897 },
    roadName: 'Kazi Nazrul Islam Ave',
    description: 'Delivery truck broken down blocking one lane',
    severity: 2,
    reporterId: 'u2',
    reporterName: 'Sumaiya A.',
    createdAt: minutesAgoIso(42),
    lastConfirmedAt: minutesAgoIso(3),
    expiresAt: minutesFromNowIso(18),
    status: 'active',
    confirmCount: 8,
    denyCount: 0,
    confidence: 91,
  },
  {
    id: 'i2',
    type: 'traffic_jam',
    location: { latitude: 23.7515, longitude: 90.3925 },
    roadName: 'Mymensingh Rd, Farmgate',
    severity: 2,
    reporterId: 'u3',
    reporterName: 'Tanvir H.',
    createdAt: minutesAgoIso(15),
    lastConfirmedAt: minutesAgoIso(2),
    expiresAt: minutesFromNowIso(10),
    status: 'active',
    confirmCount: 14,
    denyCount: 1,
    confidence: 88,
  },
  {
    id: 'i3',
    type: 'waterlogging',
    location: { latitude: 23.7461, longitude: 90.3742 },
    roadName: 'Green Road',
    description: 'Ankle-deep water near the intersection',
    severity: 2,
    reporterId: 'u4',
    reporterName: 'Nusrat J.',
    createdAt: minutesAgoIso(70),
    lastConfirmedAt: minutesAgoIso(20),
    expiresAt: minutesFromNowIso(40),
    status: 'active',
    confirmCount: 5,
    denyCount: 0,
    confidence: 76,
  },
  {
    id: 'i4',
    type: 'pothole',
    location: { latitude: 23.7654, longitude: 90.3838 },
    roadName: 'Mirpur Rd, near Sonargaon',
    severity: 1,
    reporterId: 'u5',
    reporterName: 'Kamal U.',
    createdAt: minutesAgoIso(400),
    lastConfirmedAt: minutesAgoIso(120),
    expiresAt: minutesFromNowIso(2000),
    status: 'active',
    confirmCount: 22,
    denyCount: 2,
    confidence: 82,
  },
  {
    id: 'i5',
    type: 'police',
    location: { latitude: 23.7401, longitude: 90.3792 },
    roadName: 'Dhanmondi 27',
    severity: 1,
    reporterId: 'u6',
    reporterName: 'Farhana R.',
    createdAt: minutesAgoIso(9),
    lastConfirmedAt: minutesAgoIso(1),
    expiresAt: minutesFromNowIso(25),
    status: 'active',
    confirmCount: 3,
    denyCount: 0,
    confidence: 58,
  },
  {
    id: 'i6',
    type: 'accident',
    location: { latitude: 23.7702, longitude: 90.3944 },
    roadName: 'Mohakhali Flyover',
    severity: 3,
    reporterId: 'u7',
    reporterName: 'Shakil A.',
    createdAt: minutesAgoIso(6),
    lastConfirmedAt: minutesAgoIso(1),
    expiresAt: minutesFromNowIso(30),
    status: 'active',
    confirmCount: 11,
    denyCount: 0,
    confidence: 93,
  },
];

export const mockPlaces: Place[] = [
  { id: 'p1', name: 'Padma Fuel Station', category: 'fuel_station', location: { latitude: 23.7530, longitude: 90.3860 }, address: 'Panthapath' },
  { id: 'p2', name: 'Meghna CNG & Filling', category: 'fuel_station', location: { latitude: 23.7605, longitude: 90.3910 }, address: 'Karwan Bazar' },
  { id: 'p3', name: 'City Bike Care', category: 'mechanic', location: { latitude: 23.7488, longitude: 90.3835 }, address: 'Dhanmondi 8' },
  { id: 'p4', name: 'Square Hospital', category: 'hospital', location: { latitude: 23.7529, longitude: 90.3854 }, address: 'Panthapath' },
];

export const mockPosts: CommunityPost[] = [
  {
    id: 'c1',
    authorId: 'u8',
    authorName: 'Imran K.',
    authorReputation: 91,
    title: 'Progoti Sarani is finally smooth after the repair work',
    body:
      'Rode from Badda to Kuril Flyover this morning — the stretch near Nadda that was full of potholes for months has been repaved. Still a bit of a squeeze near the bus stops but a huge improvement.',
    createdAt: minutesAgoIso(210),
    reactionCount: 34,
    commentCount: 3,
  },
  {
    id: 'c2',
    authorId: 'u9',
    authorName: 'Ayesha S.',
    authorReputation: 76,
    title: 'Best route to avoid the Gulshan 1 roundabout jam?',
    body:
      "Every evening around 6pm the Gulshan 1 roundabout is a parking lot. I've been cutting through Road 11 instead — takes 4 minutes longer but I actually keep moving. Anyone found something faster?",
    createdAt: minutesAgoIso(540),
    reactionCount: 19,
    commentCount: 7,
  },
  {
    id: 'c3',
    authorId: 'u10',
    authorName: 'Rakibul H.',
    authorReputation: 68,
    title: 'CNG mileage tips for older engines',
    body:
      "My '14 model was giving me 9km/L on CNG until I got the timing checked. Jumped to almost 12km/L after. If your mileage feels low, it's worth Tk 500 to have someone check it before you assume the tank is the problem.",
    createdAt: minutesAgoIso(1400),
    reactionCount: 52,
    commentCount: 11,
  },
];

export const mockComments: Comment[] = [
  { id: 'cm1', postId: 'c1', authorId: 'u11', authorName: 'Nabila T.', body: 'Can confirm, used it yesterday. Much better.', createdAt: minutesAgoIso(180) },
  { id: 'cm2', postId: 'c1', authorId: 'u12', authorName: 'Hasan M.', body: 'Still bad right at the Nadda bus stand though.', createdAt: minutesAgoIso(120) },
  { id: 'cm3', postId: 'c2', authorId: 'u13', authorName: 'Farzana I.', body: 'Road 11 works but gets tight after 6:30. Try Road 13 instead.', createdAt: minutesAgoIso(300) },
];

export const mockTrips: Trip[] = [
  {
    id: 't1',
    vehicleId: 'v1',
    startLabel: 'Dhanmondi 27',
    destinationLabel: 'Uttara Sector 7',
    distanceKm: 22.4,
    durationMin: 58,
    estimatedFuelLiters: 0.59,
    estimatedCostBdt: 74,
    completedAt: minutesAgoIso(60 * 26),
  },
  {
    id: 't2',
    vehicleId: 'v1',
    startLabel: 'Farmgate',
    destinationLabel: 'Motijheel',
    distanceKm: 9.1,
    durationMin: 31,
    estimatedFuelLiters: 0.24,
    estimatedCostBdt: 30,
    completedAt: minutesAgoIso(60 * 50),
  },
  {
    id: 't3',
    vehicleId: 'v2',
    startLabel: 'Banani',
    destinationLabel: 'Hazrat Shahjalal Airport',
    distanceKm: 11.6,
    durationMin: 24,
    estimatedFuelLiters: 0.89,
    estimatedCostBdt: 112,
    completedAt: minutesAgoIso(60 * 96),
  },
];

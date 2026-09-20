import { Router } from 'express';
import auth from '../../middlewares/auth';
import { TripController } from './trip.controller';

const router = Router();

router.use(auth());

router.get('/', TripController.getUserTrips);
router.post('/', TripController.createTrip);
router.get('/stats', TripController.getTripStats);
router.get('/:id', TripController.getSingleTrip);
router.patch('/:id/complete', TripController.completeTrip);
router.patch('/:id/cancel', TripController.cancelTrip);
router.delete('/:id', TripController.deleteTrip);

export const TripRoutes = router;

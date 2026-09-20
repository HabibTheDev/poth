import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { PlaceValidation } from './place.validation';
import { PlaceController } from './place.controller';

const router = Router();

router.get('/search', validateRequest(PlaceValidation.searchPlacesSchema), PlaceController.searchPlaces);
router.get('/nearby', validateRequest(PlaceValidation.getNearbyPlacesSchema), PlaceController.getNearbyPlaces);
router.get('/:id', PlaceController.getPlaceById);

router.use(auth('SUPER_ADMIN', 'ADMIN', 'MODERATOR'));

router.post('/', PlaceController.createPlace);
router.patch('/:id', PlaceController.updatePlace);
router.delete('/:id', PlaceController.deletePlace);

export const PlaceRoutes = router;

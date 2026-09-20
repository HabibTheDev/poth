import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { SavedRouteValidation } from './route.validation';
import { SavedRouteController } from './route.controller';

const router = Router();

router.use(auth());

router.post('/', validateRequest(SavedRouteValidation.createSavedRouteSchema), SavedRouteController.createSavedRoute);
router.get('/', validateRequest(SavedRouteValidation.searchRoutesQuerySchema), SavedRouteController.getUserRoutes);
router.get('/:id', SavedRouteController.getSingleRoute);
router.patch('/:id', validateRequest(SavedRouteValidation.updateSavedRouteSchema), SavedRouteController.updateSavedRoute);
router.delete('/:id', SavedRouteController.deleteSavedRoute);
router.patch('/:id/favorite', SavedRouteController.toggleFavorite);

export const SavedRouteRoutes = router;

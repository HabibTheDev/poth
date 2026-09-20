import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { FuelValidation } from './fuel.validation';
import { FuelController } from './fuel.controller';

const router = Router();

router.use(auth());

router.get('/', FuelController.getUserFuelRecords);
router.post('/', validateRequest(FuelValidation.createFuelRecordSchema), FuelController.createFuelRecord);
router.get('/stats', FuelController.getFuelStats);
router.get('/vehicles/:vehicleId/range', FuelController.predictRange);
router.get('/:id', FuelController.getSingleFuelRecord);
router.delete('/:id', FuelController.deleteFuelRecord);

export const FuelRoutes = router;

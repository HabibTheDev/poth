import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { VehicleValidation } from './vehicle.validation';
import { VehicleController } from './vehicle.controller';

const router = Router();

router.use(auth());

router.post('/', validateRequest(VehicleValidation.createVehicleSchema), VehicleController.createVehicle);
router.get('/', VehicleController.getUserVehicles);
router.get('/:id', VehicleController.getSingleVehicle);
router.patch('/:id', validateRequest(VehicleValidation.updateVehicleSchema), VehicleController.updateVehicle);
router.delete('/:id', VehicleController.deleteVehicle);
router.patch('/:id/set-primary', VehicleController.setPrimary);
router.post('/:id/fuel-efficiencies', validateRequest(VehicleValidation.fuelEfficiencySchema), VehicleController.addFuelEfficiency);
router.get('/:id/fuel-efficiencies', VehicleController.getFuelEfficiencies);

export const VehicleRoutes = router;

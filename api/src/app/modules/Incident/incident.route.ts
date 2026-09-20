import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { IncidentValidation } from './incident.validation';
import { IncidentController } from './incident.controller';

const router = Router();

router.use(auth());

router.post('/', validateRequest(IncidentValidation.createIncidentSchema), IncidentController.createIncident);
router.get('/', IncidentController.getNearbyIncidents);
router.get('/bounds', IncidentController.getIncidentsInBounds);
router.get('/stats', IncidentController.getIncidentStats);
router.get('/clusters', IncidentController.getClusters);
router.get('/:id', IncidentController.getIncidentById);
router.get('/:id/confirmations', IncidentController.getConfirmations);
router.patch('/:id', validateRequest(IncidentValidation.updateIncidentSchema), IncidentController.updateIncident);
router.delete('/:id', IncidentController.deleteIncident);
router.post('/:id/confirm', validateRequest(IncidentValidation.confirmIncidentSchema), IncidentController.confirmIncident);

export const IncidentRoutes = router;

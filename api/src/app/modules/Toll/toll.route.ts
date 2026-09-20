import { Router } from 'express';
import auth from '../../middlewares/auth';
import { TollPointController } from './toll.controller';

const router = Router();

router.get('/', TollPointController.getAllTollPoints);
router.get('/on-route', TollPointController.getTollsOnRoute);
router.get('/:id', TollPointController.getTollPointById);

router.use(auth('SUPER_ADMIN', 'ADMIN', 'MODERATOR'));

router.post('/', TollPointController.createTollPoint);
router.patch('/:id', TollPointController.updateTollPoint);
router.delete('/:id', TollPointController.deleteTollPoint);

export const TollPointRoutes = router;

import express from 'express';
import { AdminController } from '../controllers/AdminController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect, authorize('super_admin'));

router.get('/stats', AdminController.getStats);
router.get('/users', AdminController.listUsers);
router.put('/users/:id/role', AdminController.updateRole);
router.get('/markup', AdminController.getGlobalMarkup);
router.put('/markup', AdminController.setGlobalMarkup);
router.get('/providers/status', AdminController.getProviderStatus);

export default router;

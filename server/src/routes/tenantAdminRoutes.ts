import express from 'express';
import { TenantAdminController } from '../controllers\TenantAdminController';
import { protect } from '../middlewares\authMiddleware';
import { authorize } from '../middlewares\authMiddleware';

const router = express.Router();

router.use(protect, authorize('tenant_admin', 'super_admin'));

router.get('/users', TenantAdminController.listUsers);
router.put('/markup', TenantAdminController.updateMarkup);
router.get('/stats', TenantAdminController.getStats);

export default router;

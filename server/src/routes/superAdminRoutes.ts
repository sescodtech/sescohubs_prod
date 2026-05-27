import express from 'express';
import { SuperAdminController } from '../controllers/SuperAdminController';
import { protect } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect, authorize('super_admin'));

router.post('/tenants', SuperAdminController.createTenant);
router.get('/tenants', SuperAdminController.listTenants);
router.put('/tenants/:id', SuperAdminController.updateTenant);

export default router;

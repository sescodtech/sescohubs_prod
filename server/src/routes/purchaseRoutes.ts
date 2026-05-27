import express from 'express';
import { PurchaseController } from '../controllers\PurchaseController';
import { protect } from '../middlewares\authMiddleware';

const router = express.Router();

router.post('/buy-data', protect, PurchaseController.buyData);

export default router;

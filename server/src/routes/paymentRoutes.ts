import express from 'express';
import { PaymentController } from '../controllers/PaymentController';

const router = express.Router();

router.post('/initiate', PaymentController.initiate);
router.get('/callback', PaymentController.callback);
router.post('/webhook', PaymentController.webhook);

export default router;

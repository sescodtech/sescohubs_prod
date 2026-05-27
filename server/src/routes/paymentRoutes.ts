import express from 'express';
import { PaymentController } from '../controllers/PaymentController';

const router = express.Router();

router.get('/callback', PaymentController.callback);

export default router;

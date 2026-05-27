import express from 'express';
import { WalletController } from '../controllers/WalletController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Matches /api/my/wallet
router.get('/my/wallet', protect, WalletController.getMyWallet);

// Matches /api/wallet/deposit/initiate
router.post('/wallet/deposit/initiate', protect, WalletController.depositInitiate);

export default router;

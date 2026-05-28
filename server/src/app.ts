import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import walletRoutes from './routes/walletRoutes';
import paymentRoutes from './routes/paymentRoutes';
import purchaseRoutes from './routes/purchaseRoutes';
import productRoutes from './routes/productRoutes';
import superAdminRoutes from './routes/superAdminRoutes';
import tenantAdminRoutes from './routes/tenantAdminRoutes';
import adminRoutes from './routes/adminRoutes';
import myRoutes from './routes/myRoutes';
import { protect } from './middlewares/authMiddleware';
import { AuthController } from './controllers/AuthController';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.get('/api/me', protect, AuthController.me); // Added this for frontend compatibility
app.use('/api/my', myRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/tenant-admin', tenantAdminRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export { app };

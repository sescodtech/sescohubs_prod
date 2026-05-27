import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/User';
import { Tenant } from './src/models/Tenant';
import { AuthService } from './src/services/AuthService';

dotenv.config();

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sescohubs';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for seeding...');

    // 1. Create the primary Tenant (Your business)
    const tenantName = 'SescoHubs Main';
    const tenantSlug = 'sescohubs';

    let tenant = await Tenant.findOne({ slug: tenantSlug });
    if (!tenant) {
      tenant = await Tenant.create({
        name: tenantName,
        slug: tenantSlug,
        primaryColor: '#0284c7',
        secondaryColor: '#0f172a',
        markupSettings: {
          data: 15,
          airtime: 5,
          cable: 20,
          education: 10,
          recharge: 8
        }
      });
      console.log(`✅ Primary Tenant created: ${tenantName}`);
    } else {
      console.log('ℹ️  Primary Tenant already exists.');
    }

    // 2. Create the Super Admin User
    const adminEmail = 'sescowemp@gmail.com';
    const adminPassword = 'Sesco7465@@';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await AuthService.hashPassword(adminPassword);
      const superAdmin = await User.create({
        name: 'Sesco Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'super_admin',
        tenantId: tenant._id, // Link to primary tenant
        status: 'active'
      });
      console.log(`✅ Super Admin account created for: ${adminEmail}`);
    } else {
      console.log('ℹ️  Super Admin already exists.');
    }

    console.log('\n🚀 Seeding completed successfully!');
    console.log('You can now login with your email and password.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();

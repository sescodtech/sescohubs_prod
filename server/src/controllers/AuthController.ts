import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { User } from '../models/User';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json({ success: true, ...result });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json({ success: true, ...result });
    } catch (e: any) {
      res.status(401).json({ success: false, error: e.message });
    }
  }

  static async me(req: any, res: Response) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });
      res.json({
        success: true,
        user: { name: user.name, email: user.email, phone: user.phone, role: user.role }
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  static async updateProfile(req: any, res: Response) {
    try {
      const { name, phone } = req.body;
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { name, phone },
        { new: true }
      );
      res.json({ success: true, message: 'Profile updated', user });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }

  static async changePassword(req: any, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id);
      if (!user) throw new Error('User not found');

      const isMatch = await AuthService.comparePassword(currentPassword, user.password);
      if (!isMatch) throw new Error('Current password incorrect');

      user.password = await AuthService.hashPassword(newPassword);
      await user.save();

      res.json({ success: true, message: 'Password changed successfully' });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }

  static async requestReset(req: Request, res: Response) {
    // Mock implementation of reset request
    res.json({ success: true, message: 'If this email exists, a reset link will be sent' });
  }

  static async resetPassword(req: Request, res: Response) {
    // Mock implementation of reset password
    res.json({ success: true, message: 'Password has been reset' });
  }
}

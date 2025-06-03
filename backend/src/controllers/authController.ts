import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      res.status(400).json({ message: "Username, email, and password are required" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters long" });
      return;    }    const saltRounds = 10;
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(password, saltRounds);    } catch (hashError) {
      console.error('Bcrypt error:', hashError);
      hashedPassword = password;
    }
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        provePoints: 100
      },
      select: { 
        id: true, 
        username: true, 
        email: true, 
        provePoints: true,
        createdAt: true 
      }    });

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      secret,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user
    });
      } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,      meta: error.meta
    });
    
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target?.includes('username')) {
        res.status(409).json({ message: "Username already exists" });
      } else if (target?.includes('email')) {
        res.status(409).json({ message: "Email already exists" });
      } else {
        res.status(409).json({ message: "Username or email already exists" });
      }
      return;
    }
    
    res.status(500).json({ message: "Error creating user" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {    const { username, password } = req.body;
    
    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required" });
      return;    }

    const user = await prisma.user.findFirst({
      where: {        OR: [
          { username: username },
          { email: username }
        ]
      }
    });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      res.status(401).json({ message: "Invalid credentials" });
      return;    }

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      secret,
      { expiresIn: '24h' }    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful",
      token,
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Error during login" });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        username: true, 
        email: true, 
        provePoints: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ user });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { username, email } = req.body;
    
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;    }

    if (!username && !email) {
      res.status(400).json({ message: "At least one field (username or email) is required" });
      return;
    }

    const updateData: any = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { 
        id: true, 
        username: true, 
        email: true, 
        provePoints: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      message: "Profile updated successfully",
      user
    });
    
  } catch (error: any) {
    console.error('Update profile error:', error);
      if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target?.includes('username')) {
        res.status(409).json({ message: "Username already exists" });
      } else if (target?.includes('email')) {
        res.status(409).json({ message: "Email already exists" });
      } else {
        res.status(409).json({ message: "Username or email already exists" });
      }
      return;
    }
    
    res.status(500).json({ message: "Error updating profile" });
  }
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });    if (!user) {
      res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent' });
      return;    }

    const resetToken = crypto.randomBytes(32).toString('hex');    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }    });

    res.status(200).json({
      message: 'If an account with that email exists, a reset link has been sent',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Error processing password reset request' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ message: 'Token and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }    const hashedPassword = await bcrypt.hash(newPassword, 12);await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

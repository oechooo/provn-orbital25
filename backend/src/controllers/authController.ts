import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    
    // Enhanced validation
    if (!username || !email || !password) {
      res.status(400).json({ message: "Username, email, and password are required" });
      return;
    }

    if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ message: "Invalid input format" });
      return;
    }

    // Trim and validate inputs
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (trimmedUsername.length < 3) {
      res.status(400).json({ message: "Username must be at least 3 characters long" });
      return;
    }

    if (trimmedUsername.length > 30) {
      res.status(400).json({ message: "Username must be less than 30 characters" });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      res.status(400).json({ message: "Please enter a valid email address" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters long" });
      return;
    }

    if (password.length > 128) {
      res.status(400).json({ message: "Password must be less than 128 characters" });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        username: trimmedUsername,
        email: trimmedEmail,
        password: hashedPassword,
        provePoints: 100 // Starting points for new users
      },
      select: { 
        id: true, 
        username: true, 
        email: true, 
        isAdmin: true,
        provePoints: true,
        createdAt: true 
      }
    });

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET not configured');
      res.status(500).json({ message: "Authentication service unavailable" });
      return;
    }

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
      message: error.message,
      meta: error.meta
    });
    
    // Handle unique constraint violations
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
  try {
    const { username, password } = req.body;
    
    // Enhanced validation
    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required" });
      return;
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      res.status(400).json({ message: "Invalid input format" });
      return;
    }

    if (username.trim().length === 0 || password.trim().length === 0) {
      res.status(400).json({ message: "Username and password cannot be empty" });
      return;
    }

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.trim() },
          { email: username.trim() } // Allow login with email
        ]
      }
    });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Verify password
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.error('Bcrypt comparison error:', bcryptError);
      res.status(500).json({ message: "Authentication error" });
      return;
    }
    
    if (!isValidPassword) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET not configured');
      res.status(500).json({ message: "Authentication service unavailable" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      secret,
      { expiresIn: '24h' }
    );

    // Return user info without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful",
      token,
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // User is already authenticated via middleware, user info is in req.user
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
        isAdmin: true,
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
      return;
    }

    // Basic validation
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
        isAdmin: true,
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
    
    // Handle unique constraint violations
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
    });

    if (!user) {
      // Don't reveal if user exists for security
      res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent' });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to user (we'll add these fields to schema)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // In a real app, you would send an email here
    // For demo purposes, we'll just log the token
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset URL: http://localhost:5173/reset-password?token=${resetToken}`);

    res.status(200).json({ 
      message: 'If an account with that email exists, a reset link has been sent',
      // Include token in response for demo purposes (remove in production)
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
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
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
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and clear reset token
    await prisma.user.update({
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

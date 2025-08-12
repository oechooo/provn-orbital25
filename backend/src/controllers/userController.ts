// src/controllers/userController.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthRequest } from '../middleware/auth';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Using select to ensure we get the fields needed by the test
    const users = await prisma.user.findMany({
      select: { 
        id: true, 
        username: true, 
        email: true, 
        createdAt: true, 
        updatedAt: true 
      } // Exclude password from response
    });
    
    if (users.length === 0) {
      // Return an empty array, not an error
      res.json([]);
      return;
    }
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: { 
        id: true, 
        username: true, 
        email: true, 
        createdAt: true, 
        updatedAt: true 
      } // Exclude password
    });
    
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: "Error fetching user" });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    
    // Basic validation
    if (!username || !email || !password) {
      res.status(400).json({ message: "Username, email, and password are required" });
      return;
    }
    
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password // In a real app, you should hash this password
      },
      select: { 
        id: true, 
        username: true, 
        email: true, 
        createdAt: true, 
        updatedAt: true 
      } // Exclude password from response
    });
    res.status(201).json(user);
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    // Handle unique constraint violations
    if (error instanceof PrismaClientKnownRequestError || 
        (error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002')) {
      res.status(409).json({ message: "Username or email already exists" });
      return;
    }
    
    res.status(500).json({ message: "Error creating user" });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }
    
    // Check if user exists before updating
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: req.body,
      select: { 
        id: true, 
        username: true, 
        email: true, 
        createdAt: true, 
        updatedAt: true 
      } // Exclude password from response
    });
    res.json(user);
  } catch (error: any) {
    console.error('Error updating user:', error);
    
    // Handle unique constraint violations
    if (error instanceof PrismaClientKnownRequestError || 
        (error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002')) {
      res.status(409).json({ message: "Username or email already exists" });
      return;
    }
    
    // Handle not found errors (this should be caught by the check above, but just in case)
    if (error.message && error.message.includes('Record to update not found')) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    
    res.status(500).json({ message: "Error updating user" });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }
    
    // Check if user exists before deleting
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    
    await prisma.user.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

export const updateUserAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const { 
      avatarSkinColor, 
      avatarHairColor, 
      avatarHair, 
      avatarEyes, 
      avatarMouth, 
      avatarAccessories 
    } = req.body;
    
    // Basic validation for avatar config
    if (!avatarSkinColor || !avatarHairColor || !avatarHair || !avatarEyes || !avatarMouth) {
      res.status(400).json({ message: "All avatar fields except accessories are required" });
      return;
    }

    // Get current user to check their PP balance
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        provePoints: true,
        avatarHair: true,
        avatarEyes: true,
        avatarMouth: true,
        avatarAccessories: true
      }
    });

    if (!currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Avatar pricing structure (should match frontend)
    const AVATAR_REQUIREMENTS = {
      hairStyle: {
        curlyShortHair: 25, straightHair: 30, curlyBob: 35, wavyBob: 40, bunHair: 45,
        braids: 60, froBun: 50, bangs: 35, bowlCutHair: 20, halfShavedHead: 70,
        mohawk: 80, shavedHead: 15
      },
      eyes: {
        angry: 20, cheery: 25, confused: 20, sad: 20, sleepy: 25, starstruck: 40, winking: 35
      },
      mouth: {
        openedSmile: 20, gapSmile: 25, awkwardSmile: 30, kawaii: 50, braces: 35,
        openSad: 25, unimpressed: 30
      },
      accessories: {
        catEars: 60, clownNose: 40, faceMask: 30, glasses: 45, mustache: 35,
        sailormoonCrown: 100, sleepMask: 50, sunglasses: 55
      }
    };

    // Calculate unlock requirements for premium items (NO COST - just requirements to unlock)
    let totalRequirement = 0;
    const unlockedItems: string[] = [];

    // Check unlock requirements for premium items based on current PP balance
    if (avatarHair !== 'shortHair') {
      const requirement = AVATAR_REQUIREMENTS.hairStyle[avatarHair as keyof typeof AVATAR_REQUIREMENTS.hairStyle] || 50;
      totalRequirement = Math.max(totalRequirement, requirement);
      unlockedItems.push(`Hair: ${avatarHair} (${requirement} PP required)`);
    }
    
    if (avatarEyes !== 'normal') {
      const requirement = AVATAR_REQUIREMENTS.eyes[avatarEyes as keyof typeof AVATAR_REQUIREMENTS.eyes] || 30;
      totalRequirement = Math.max(totalRequirement, requirement);
      unlockedItems.push(`Eyes: ${avatarEyes} (${requirement} PP required)`);
    }
    
    if (avatarMouth !== 'teethSmile') {
      const requirement = AVATAR_REQUIREMENTS.mouth[avatarMouth as keyof typeof AVATAR_REQUIREMENTS.mouth] || 30;
      totalRequirement = Math.max(totalRequirement, requirement);
      unlockedItems.push(`Mouth: ${avatarMouth} (${requirement} PP required)`);
    }
    
    if (avatarAccessories !== 'none') {
      const requirement = AVATAR_REQUIREMENTS.accessories[avatarAccessories as keyof typeof AVATAR_REQUIREMENTS.accessories] || 100;
      totalRequirement = Math.max(totalRequirement, requirement);
      unlockedItems.push(`Accessories: ${avatarAccessories} (${requirement} PP required)`);
    }

    // Check if user meets the unlock requirements (PP balance, not deduction)
    if (totalRequirement > currentUser.provePoints) {
      res.status(400).json({ 
        message: `Insufficient ProvePoints to unlock these features. Required: ${totalRequirement} PP, Available: ${currentUser.provePoints} PP` 
      });
      return;
    }

    // Update user with new avatar (NO PP DEDUCTION - just unlock system)
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        avatarSkinColor,
        avatarHairColor,
        avatarHair,
        avatarEyes,
        avatarMouth,
        avatarAccessories: avatarAccessories || 'none'
      } as any, // Temporary type assertion until Prisma client is fully updated
      select: { 
        id: true, 
        username: true, 
        email: true, 
        provePoints: true,
        createdAt: true, 
        updatedAt: true,
        avatarSkinColor: true,
        avatarHairColor: true,
        avatarHair: true,
        avatarEyes: true,
        avatarMouth: true,
        avatarAccessories: true
      }
    });
    
    res.json({ 
      message: totalRequirement > 0 ? `Avatar updated! Features unlocked with ${totalRequirement} PP requirement.` : "Avatar updated successfully!", 
      requirementMet: totalRequirement,
      unlockedFeatures: unlockedItems,
      ...user 
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ message: "Error updating avatar" });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
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
        updatedAt: true,
        avatarSkinColor: true,
        avatarHairColor: true,
        avatarHair: true,
        avatarEyes: true,
        avatarMouth: true,
        avatarAccessories: true,
        // @ts-ignore - purchased fields exist but not in current type definition
        purchasedHair: true,
        purchasedEyes: true,
        purchasedMouth: true,
        purchasedAccessories: true
      }
    });
    
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: "Error fetching user" });
  }
};


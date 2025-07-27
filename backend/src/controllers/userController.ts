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

    // Get current user to check what they already own and their PP balance
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        provePoints: true,
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
    }) as any; // Type assertion after query

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

    // Calculate cost for new items only
    let totalCost = 0;

    // Parse purchased items (stored as JSON strings) - using any to avoid TS errors during transition
    const purchasedHair = JSON.parse((currentUser as any).purchasedHair || '[]');
    const purchasedEyes = JSON.parse((currentUser as any).purchasedEyes || '[]');
    const purchasedMouth = JSON.parse((currentUser as any).purchasedMouth || '[]');
    const purchasedAccessories = JSON.parse((currentUser as any).purchasedAccessories || '[]');

    // Items to add to purchased lists
    const newPurchases = {
      hair: [] as string[],
      eyes: [] as string[],
      mouth: [] as string[],
      accessories: [] as string[]
    };

    // Only charge for premium items they haven't purchased before
    if (avatarHair !== 'shortHair' && !purchasedHair.includes(avatarHair)) {
      totalCost += AVATAR_REQUIREMENTS.hairStyle[avatarHair as keyof typeof AVATAR_REQUIREMENTS.hairStyle] || 50;
      newPurchases.hair.push(avatarHair);
    }
    
    if (avatarEyes !== 'normal' && !purchasedEyes.includes(avatarEyes)) {
      totalCost += AVATAR_REQUIREMENTS.eyes[avatarEyes as keyof typeof AVATAR_REQUIREMENTS.eyes] || 30;
      newPurchases.eyes.push(avatarEyes);
    }
    
    if (avatarMouth !== 'teethSmile' && !purchasedMouth.includes(avatarMouth)) {
      totalCost += AVATAR_REQUIREMENTS.mouth[avatarMouth as keyof typeof AVATAR_REQUIREMENTS.mouth] || 30;
      newPurchases.mouth.push(avatarMouth);
    }
    
    if (avatarAccessories !== 'none' && !purchasedAccessories.includes(avatarAccessories)) {
      totalCost += AVATAR_REQUIREMENTS.accessories[avatarAccessories as keyof typeof AVATAR_REQUIREMENTS.accessories] || 100;
      newPurchases.accessories.push(avatarAccessories);
    }

    // Check if user can afford the total cost
    if (totalCost > currentUser.provePoints) {
      res.status(400).json({ 
        message: `Insufficient ProvePoints. Required: ${totalCost}, Available: ${currentUser.provePoints}` 
      });
      return;
    }

    // Update purchased lists with new items
    const updatedPurchasedHair = [...purchasedHair, ...newPurchases.hair];
    const updatedPurchasedEyes = [...purchasedEyes, ...newPurchases.eyes];
    const updatedPurchasedMouth = [...purchasedMouth, ...newPurchases.mouth];
    const updatedPurchasedAccessories = [...purchasedAccessories, ...newPurchases.accessories];

    // Update user with new avatar and deduct PP
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        avatarSkinColor,
        avatarHairColor,
        avatarHair,
        avatarEyes,
        avatarMouth,
        avatarAccessories: avatarAccessories || 'none',
        provePoints: currentUser.provePoints - totalCost,
        purchasedHair: JSON.stringify(updatedPurchasedHair),
        purchasedEyes: JSON.stringify(updatedPurchasedEyes),
        purchasedMouth: JSON.stringify(updatedPurchasedMouth),
        purchasedAccessories: JSON.stringify(updatedPurchasedAccessories)
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
        avatarAccessories: true,
        // @ts-ignore - purchased fields exist but not in current type definition
        purchasedHair: true,
        purchasedEyes: true,
        purchasedMouth: true,
        purchasedAccessories: true
      }
    });
    
    res.json({ 
      message: totalCost > 0 ? `Avatar updated! ${totalCost} PP deducted.` : "Avatar updated successfully!", 
      costDeducted: totalCost,
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


// src/controllers/userController.ts
import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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
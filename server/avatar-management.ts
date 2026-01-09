// avatar-management.ts

import 'dotenv/config';
import express, { Router, type Request, Response, NextFunction } from "express";
import { db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const router = Router();

// Gender determination function
const determineGender = (fullName: string): string | null => {
  if (!fullName) return null;
  const nameLower = fullName.toLowerCase();
  
  const femaleKeywords = [
    'begum', 'khatun', 'banu', 'jahan', 'ara', 'sultana', 'akter', 'akhter','Akther',
    'nesa', 'bibi', 'parvin', 'parveen', 'fatema', 'fatima',
    'khaleda', 'hasina', 'sheikh', 'begom', 'begam', 'aktar', 'akhtar',
    'Nesa', 'Bibi', 'Parvin', 'Fatema', 'Fatima', 'Khaleda', 'Hasina', 'Khatun',
    'Akther', 'Begom', 'Begam'
  ];
  
  const maleKeywords = [
    'alam', 'ullah', 'islam', 'ahmed', 'rahman', 'mia', 'miah', 'khan', 
    'hossain', 'hossein', 'hussain', 'chowdhury', 'chaudhury', 'uddin',
    'haque', 'hak', 'howlader', 'hoque', 'islam', 'mohammad',
    'muhammad', 'md.', 'mr.', 'shah', 'sheikh', 'siddique', 'sarker', 
    'Abdul', 'Abdur', 'Md', 'Muhammed', 'Mohammed', 'Md.', 'Hossain',
    'Hoque', 'Salim', 'Mostafa', 'Abdul','Majid','Majidul','Majed','Majedul','Mannan','Hamid'
  ];
  
  for (const keyword of femaleKeywords) {
    if (nameLower.includes(keyword)) return 'female';
  }
  for (const keyword of maleKeywords) {
    if (nameLower.includes(keyword)) return 'male';
  }
  return null;
};

// Configure multer for file uploads
const storage = multer.diskstorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Serve static files from the uploads directory
router.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Gender and Avatar Assignment Endpoints
router.post("/api/assign-gender", async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users);
    let maleCount = 0, femaleCount = 0, unknownCount = 0, updatedCount = 0;
    
    for (const user of allUsers) {
      if (user.gender) continue;
      const gender = determineGender(user.fullName);
      if (gender) {
        await db.update(users).set({ gender }).where(eq(users.id, user.id));
        if (gender === 'male') maleCount++; else femaleCount++;
        updatedCount++;
      } else unknownCount++;
    }
    
    res.json({ success: true, stats: { updatedCount, maleCount, femaleCount, unknownCount } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/api/gender-stats", async (req: Request, res: Response) => {
  try {
    // Get gender statistics
    const stats = await db.execute('SELECT gender, COUNT(*) as count FROM users GROUP BY gender');
    
    // Get sample users with avatars
    const allUsers = await db.select().from(users);
    const usersWithAvatars = allUsers
      .filter(user => user.profilePicture)
      .slice(0, 5)
      .map(user => ({
        id: user.id,
        fullName: user.fullName,
        gender: user.gender,
        avatar: user.profilePicture ? user.profilePicture.substring(0, 50) + "..." : null
      }));
    
    // Calculate avatar statistics
    const avatarStats = {
      male: {
        total: allUsers.filter(u => u.gender === 'male').length,
        withAvatar: allUsers.filter(u => u.gender === 'male' && u.profilePicture).length
      },
      female: {
        total: allUsers.filter(u => u.gender === 'female').length,
        withAvatar: allUsers.filter(u => u.gender === 'female' && u.profilePicture).length
      },
      noGender: {
        total: allUsers.filter(u => !u.gender).length,
        withAvatar: allUsers.filter(u => !u.gender && u.profilePicture).length
      }
    };
    
    res.json({
      genderStats: stats.rows,
      avatarStats: avatarStats,
      sampleUsers: usersWithAvatars,
      summary: {
        totalUsers: allUsers.length,
        usersWithAvatars: allUsers.filter(u => u.profilePicture).length,
        usersWithoutAvatars: allUsers.filter(u => !u.profilePicture).length
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/assign-avatars", async (req: Request, res: Response) => {
  try {
    const maleAvatarDir = path.join(process.cwd(), 'client', 'src', 'assets', 'MaleAvatar');
    const femaleAvatarDir = path.join(process.cwd(), 'client', 'src', 'assets', 'FemaleAvatar');
    
    let maleAvatars: string[] = [];
    let femaleAvatars: string[] = [];
    
    try {
      const maleFiles = fs.readdirSync(maleAvatarDir);
      maleAvatars = maleFiles.filter(file => 
        file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.svg')
      ).map(file => '/assets/MaleAvatar/' + file);
    } catch (error: any) { 
      console.error('Error reading male avatars:', error); 
    }
    
    try {
      const femaleFiles = fs.readdirSync(femaleAvatarDir);
      femaleAvatars = femaleFiles.filter(file => 
        file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.svg')
      ).map(file => '/assets/FemaleAvatar/' + file);
    } catch (error: any) { 
      console.error('Error reading female avatars:', error); 
    }
    
    if (maleAvatars.length === 0 || femaleAvatars.length === 0) {
      return res.status(400).json({ success: false, message: 'No avatars found' });
    }
    
    const allUsers = await db.select().from(users);
    let updatedCount = 0, skippedCount = 0;
    
    for (const user of allUsers) {
      if (!user.gender) { 
        skippedCount++; 
        continue; 
      }
      const avatarSet = user.gender.toLowerCase() === 'male' ? maleAvatars : femaleAvatars;
      const randomIndex = Math.floor(Math.random() * avatarSet.length);
      const selectedAvatar = avatarSet[randomIndex];
      await db.update(users).set({ profilePicture: selectedAvatar }).where(eq(users.id, user.id));
      updatedCount++;
    }
    
    res.json({ success: true, stats: { updatedCount, skippedCount } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test endpoint
router.get("/api/test", (req: Request, res: Response) => {
  res.json({ message: "Test endpoint works!", timestamp: new Date().toISOString() });
});

// Simple verify endpoint
router.get("/api/simple-verify", async (req: Request, res: Response) => {
  try {
    // Get all users and filter in JavaScript
    const allUsers = await db.select().from(users);
    const usersWithAvatars = allUsers
      .filter(user => user.profilePicture)
      .slice(0, 5);
    
    const results = usersWithAvatars.map(user => ({
      id: user.id,
      fullName: user.fullName,
      gender: user.gender,
      avatar: user.profilePicture
    }));
    
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Avatar stats endpoint
router.get("/api/avatar-stats", async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users);
    
    const stats = {
      male: {
        total: allUsers.filter(u => u.gender === 'male').length,
        withAvatar: allUsers.filter(u => u.gender === 'male' && u.profilePicture).length
      },
      female: {
        total: allUsers.filter(u => u.gender === 'female').length,
        withAvatar: allUsers.filter(u => u.gender === 'female' && u.profilePicture).length
      },
      noGender: {
        total: allUsers.filter(u => !u.gender).length,
        withAvatar: allUsers.filter(u => !u.gender && u.profilePicture).length
      }
    };
    
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/improved-assign-gender", async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users);
    let maleCount = 0, femaleCount = 0, unknownCount = 0, updatedCount = 0, alreadyHasGender = 0;
    
    for (const user of allUsers) {
      if (user.gender) {
        alreadyHasGender++;
        continue;
      }
      
      const gender = determineGender(user.fullName);
      if (gender) {
        await db.update(users).set({ gender }).where(eq(users.id, user.id));
        if (gender === 'male') maleCount++; else femaleCount++;
        updatedCount++;
      } else {
        unknownCount++;
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Improved gender assignment complete',
      stats: {
        totalUsers: allUsers.length,
        alreadyHasGender,
        updatedCount,
        maleCount,
        femaleCount,
        unknownCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload avatar endpoint
router.post("/api/upload-avatar", upload.single('avatar'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const userId = parseInt(req.body.userId);
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Valid User ID required' });
    }
    
    // Check if user exists
    const userExists = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!userExists.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    
    // Update user's profile picture
    await db.update(users)
      .set({ profilePicture: avatarPath })
      .where(eq(users.id, userId));
    
    res.json({ 
      success: true, 
      message: 'Avatar uploaded successfully',
      avatarPath 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reset to default avatar endpoint
router.post("/api/reset-avatar", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ success: false, message: 'Valid User ID required' });
    }
    
    // Get user's gender
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length || !user[0].gender) {
      return res.status(400).json({ success: false, message: 'User or gender not found' });
    }
    
    // Get appropriate avatar set
    const avatarDir = user[0].gender.toLowerCase() === 'male' 
      ? path.join(process.cwd(), 'client', 'src', 'assets', 'MaleAvatar')
      : path.join(process.cwd(), 'client', 'src', 'assets', 'FemaleAvatar');
    
    if (!fs.existsSync(avatarDir)) {
      return res.status(400).json({ success: false, message: 'Avatar directory not found' });
    }
    
    const files = fs.readdirSync(avatarDir);
    const avatars = files.filter(file => 
      file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.svg')
    );
    
    if (avatars.length === 0) {
      return res.status(400).json({ success: false, message: 'No avatars found' });
    }
    
    const randomIndex = Math.floor(Math.random() * avatars.length);
    const selectedAvatar = user[0].gender.toLowerCase() === 'male'
      ? `/assets/MaleAvatar/${avatars[randomIndex]}`
      : `/assets/FemaleAvatar/${avatars[randomIndex]}`;
    
    // Update user's profile picture
    await db.update(users)
      .set({ profilePicture: selectedAvatar })
      .where(eq(users.id, userId));
    
    res.json({ 
      success: true, 
      message: 'Avatar reset to default',
      avatarPath: selectedAvatar 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/api/force-asset-avatars", async (req: Request, res: Response) => {
  try {
    const maleAvatarDir = path.join(process.cwd(), 'client', 'src', 'assets', 'MaleAvatar');
    const femaleAvatarDir = path.join(process.cwd(), 'client', 'src', 'assets', 'FemaleAvatar');
    
    let maleAvatars: string[] = [];
    let femaleAvatars: string[] = [];
    
    try {
      if (fs.existsSync(maleAvatarDir)) {
        const maleFiles = fs.readdirSync(maleAvatarDir);
        maleAvatars = maleFiles
          .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.svg'))
          .map(file => `/assets/MaleAvatar/${file}`);
      }
    } catch (error: any) { 
      console.error('Error reading male avatars:', error); 
    }
    
    try {
      if (fs.existsSync(femaleAvatarDir)) {
        const femaleFiles = fs.readdirSync(femaleAvatarDir);
        femaleAvatars = femaleFiles
          .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.svg'))
          .map(file => `/assets/FemaleAvatar/${file}`);
      }
    } catch (error: any) { 
      console.error('Error reading female avatars:', error); 
    }
    
    if (maleAvatars.length === 0 || femaleAvatars.length === 0) {
      return res.status(400).json({ success: false, message: 'No avatars found in one or both directories' });
    }
    
    const allUsers = await db.select().from(users);
    let updatedCount = 0;
    let skippedCount = 0;
    let maleCount = 0;
    let femaleCount = 0;
    let fixedGenderMismatch = 0;
    
    for (const user of allUsers) {
      if (!user.gender) {
        skippedCount++;
        continue;
      }
      
      const avatarSet = user.gender.toLowerCase() === 'male' ? maleAvatars : femaleAvatars;
      const expectedAvatarType = user.gender.toLowerCase();
      
      if (user.gender.toLowerCase() === 'male') maleCount++;
      else femaleCount++;
      
      // Check if current avatar is correct
      let needsUpdate = true;
      if (user.profilePicture) {
        const isMaleAvatar = user.profilePicture.includes('/assets/MaleAvatar/');
        const isFemaleAvatar = user.profilePicture.includes('/assets/FemaleAvatar/');
        
        if ((expectedAvatarType === 'male' && isMaleAvatar) || 
            (expectedAvatarType === 'female' && isFemaleAvatar)) {
          needsUpdate = false;
        } else {
          fixedGenderMismatch++;
        }
      }
      
      if (needsUpdate) {
        const randomIndex = Math.floor(Math.random() * avatarSet.length);
        const selectedAvatar = avatarSet[randomIndex];
        
        await db.update(users)
          .set({ 
            profilePicture: selectedAvatar
          })
          .where(eq(users.id, user.id));
        
        updatedCount++;
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Force asset avatars complete',
      stats: {
        totalUsers: allUsers.length,
        updatedCount,
        skippedCount,
        maleCount,
        femaleCount,
        fixedGenderMismatch
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// NEW: Simple gender stats endpoint
router.get("/api/user-gender-stats", async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users);
    
    const genderStats = {
      total: allUsers.length,
      male: allUsers.filter(u => u.gender === 'male').length,
      female: allUsers.filter(u => u.gender === 'female').length,
      other: allUsers.filter(u => u.gender && u.gender !== 'male' && u.gender !== 'female').length,
      unspecified: allUsers.filter(u => !u.gender).length
    };
    
    res.json({
      success: true,
      stats: genderStats
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Error handling middleware
router.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error(err); // Log the error for debugging
});

export default router;
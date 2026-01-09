import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import { users } from "../shared/schema";
import { eq, sql } from "drizzle-orm";
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'pulsecare-blood-donor-management-system-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours default
  }
}));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });
  next();
});

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
const storage = multer.diskStorage({
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
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
// Add this line after the existing uploads static serving
app.use('/assets', express.static(path.join(process.cwd(), 'client', 'src', 'assets')));

// Gender and Avatar Assignment Endpoints
app.post("/api/assign-gender", async (req: Request, res: Response) => {
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

app.get("/api/gender-stats", async (req: Request, res: Response) => {
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

app.post("/api/assign-avatars", async (req: Request, res: Response) => {
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
app.get("/api/test", (req: Request, res: Response) => {
  res.json({ message: "Test endpoint works!", timestamp: new Date().toISOString() });
});

// Simple verify endpoint
app.get("/api/simple-verify", async (req: Request, res: Response) => {
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
app.get("/api/avatar-stats", async (req: Request, res: Response) => {
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

app.post("/api/improved-assign-gender", async (req: Request, res: Response) => {
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
app.post("/api/upload-avatar", upload.single('avatar'), async (req: Request, res: Response) => {
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
app.post("/api/reset-avatar", async (req: Request, res: Response) => {
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

app.post("/api/force-asset-avatars", async (req: Request, res: Response) => {
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

// Careful assign avatars endpoint - preserves custom avatars
app.post("/api/careful-assign-avatars", async (req: Request, res: Response) => {
  try {
    const maleAvatarDir = path.join(process.cwd(), 'client', 'src', 'assets', 'MaleAvatar');
    const femaleAvatarDir = path.join(process.cwd(), 'client', 'src', 'assets', 'FemaleAvatar');
    
    let maleAvatars: string[] = [];
    let femaleAvatars: string[] = [];
    
    // Get male avatars
    if (fs.existsSync(maleAvatarDir)) {
      const maleFiles = fs.readdirSync(maleAvatarDir);
      maleAvatars = maleFiles
        .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.svg'))
        .map(file => `/assets/MaleAvatar/${file}`);
    }
    
    // Get female avatars
    if (fs.existsSync(femaleAvatarDir)) {
      const femaleFiles = fs.readdirSync(femaleAvatarDir);
      femaleAvatars = femaleFiles
        .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.svg'))
        .map(file => `/assets/FemaleAvatar/${file}`);
    }
    
    if (maleAvatars.length === 0 || femaleAvatars.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No avatars found in one or both directories',
        maleAvatarsCount: maleAvatars.length,
        femaleAvatarsCount: femaleAvatars.length
      });
    }
    
    const allUsers = await db.select().from(users);
    let updatedCount = 0;
    let skippedCount = 0;
    let fixedMismatch = 0;
    let addedMissing = 0;
    let preservedCustom = 0;
    
    for (const user of allUsers) {
      if (!user.gender) {
        skippedCount++;
        continue;
      }
      
      const expectedAvatarType = user.gender.toLowerCase();
      const avatarSet = expectedAvatarType === 'male' ? maleAvatars : femaleAvatars;
      
      // Check if user has an avatar
      if (!user.profilePicture) {
        // No avatar, assign one
        const randomIndex = Math.floor(Math.random() * avatarSet.length);
        const selectedAvatar = avatarSet[randomIndex];
        
        await db.update(users)
          .set({ profilePicture: selectedAvatar })
          .where(eq(users.id, user.id));
          
        updatedCount++;
        addedMissing++;
      } else {
        // User has an avatar, check if it's correct
        const isMaleAvatar = user.profilePicture.includes('/assets/MaleAvatar/');
        const isFemaleAvatar = user.profilePicture.includes('/assets/FemaleAvatar/');
        const isCustomAvatar = !isMaleAvatar && !isFemaleAvatar;
        
        if (isCustomAvatar) {
          // This is a custom avatar, preserve it
          preservedCustom++;
          continue;
        }
        
        // Check if avatar matches gender
        if ((expectedAvatarType === 'male' && !isMaleAvatar) || 
            (expectedAvatarType === 'female' && !isFemaleAvatar)) {
          // Gender mismatch, fix it
          const randomIndex = Math.floor(Math.random() * avatarSet.length);
          const selectedAvatar = avatarSet[randomIndex];
          
          await db.update(users)
            .set({ profilePicture: selectedAvatar })
            .where(eq(users.id, user.id));
            
          updatedCount++;
          fixedMismatch++;
        } else {
          // Avatar is correct, skip
          skippedCount++;
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Careful avatar assignment complete',
      stats: {
        totalUsers: allUsers.length,
        updatedCount,
        skippedCount,
        fixedMismatch,
        addedMissing,
        preservedCustom,
        maleAvatarsCount: maleAvatars.length,
        femaleAvatarsCount: femaleAvatars.length
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//Gender Mismatch Fix Endpoint
app.get("/api/check-gender-mismatches", async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users);
    const mismatches = [];
    const noGenderUsers = [];
    
    for (const user of allUsers) {
      // Check for users without gender
      if (!user.gender) {
        const determinedGender = determineGender(user.fullName);
        if (determinedGender) {
          noGenderUsers.push({
            id: user.id,
            fullName: user.fullName,
            currentGender: null,
            suggestedGender: determinedGender,
            avatar: user.profilePicture
          });
        }
        continue;
      }
      
      // Check for gender mismatches
      const determinedGender = determineGender(user.fullName);
      if (determinedGender && determinedGender !== user.gender) {
        mismatches.push({
          id: user.id,
          fullName: user.fullName,
          currentGender: user.gender,
          suggestedGender: determinedGender,
          avatar: user.profilePicture
        });
      }
    }
    
    res.json({
      totalMismatches: mismatches.length,
      totalNoGender: noGenderUsers.length,
      mismatches: mismatches.slice(0, 20), // Show first 20 mismatches
      noGenderUsers: noGenderUsers.slice(0, 20) // Show first 20 users without gender
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/fix-gender-mismatches", async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users);
    let fixedMismatches = 0;
    let assignedGender = 0;
    
    for (const user of allUsers) {
      const determinedGender = determineGender(user.fullName);
      
      if (!user.gender && determinedGender) {
        // Assign gender to users without it
        await db.update(users)
          .set({ gender: determinedGender })
          .where(eq(users.id, user.id));
        assignedGender++;
      } else if (user.gender && determinedGender && determinedGender !== user.gender) {
        // Fix gender mismatches
        await db.update(users)
          .set({ gender: determinedGender })
          .where(eq(users.id, user.id));
        fixedMismatches++;
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Gender mismatches fixed',
      stats: {
        fixedMismatches,
        assignedGender,
        totalUsers: allUsers.length
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/aggressive-gender-fix", async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users);
    let fixedMismatches = 0;
    let assignedGender = 0;
    
    // Enhanced gender detection patterns
    const malePatterns = [
      /^md\./i, /^mr\./i, /^mohammad/i, /^muhammad/i, /^abdul/i, /^ahmed/i, 
      /^rahman/i, /^hossain/i, /^islam/i, /^ali/i, /^hasan/i, /^hussein/i,
      /^khan/i, /^mia$/i, /^miah$/i, /^uddin/i, /ullah$/i, /hoque$/i,
      /^alam/i, /^haque/i, /^chowdhury/i, /^sarker/i, /^sheikh/i,
      /^majid/i, /^majidul/i, /^majed/i, /^majedul/i, /^mannan/i, /^hamid/i
    ];
    
    const femalePatterns = [
      /^begum/i, /^khatun$/i, /^akter$/i, /^akhter$/i, /^nesa$/i, /^bibi$/i,
      /^parvin/i, /^parveen/i, /^fatema/i, /^fatima/i, /^khaleda/i, /^hasina/i,
      /jahan$/i, /ara$/i, /sultana$/i, /banu$/i, /begom$/i, /begam$/i
    ];
    
    for (const user of allUsers) {
      const fullName = user.fullName || '';
      let determinedGender = null;
      
      // Check male patterns
      for (const pattern of malePatterns) {
        if (pattern.test(fullName)) {
          determinedGender = 'male';
          break;
        }
      }
      
      // Check female patterns if not already determined as male
      if (!determinedGender) {
        for (const pattern of femalePatterns) {
          if (pattern.test(fullName)) {
            determinedGender = 'female';
            break;
          }
        }
      }
      
      // Apply gender if determined
      if (determinedGender) {
        if (!user.gender) {
          // Assign gender to users without it
          await db.update(users)
            .set({ gender: determinedGender })
            .where(eq(users.id, user.id));
          assignedGender++;
          console.log(`Assigned gender ${determinedGender} to user ${user.fullName} (ID: ${user.id})`);
        } else if (user.gender !== determinedGender) {
          // Fix gender mismatches
          await db.update(users)
            .set({ gender: determinedGender })
            .where(eq(users.id, user.id));
          fixedMismatches++;
          console.log(`Fixed gender for user ${user.fullName} (ID: ${user.id}): ${user.gender} -> ${determinedGender}`);
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Aggressive gender fix complete',
      stats: {
        fixedMismatches,
        assignedGender,
        totalUsers: allUsers.length
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/fix-user-gender", async (req: Request, res: Response) => {
  try {
    const { userId, gender } = req.body;
    
    if (!userId || !gender) {
      return res.status(400).json({ success: false, message: 'User ID and gender are required' });
    }
    
    if (gender !== 'male' && gender !== 'female') {
      return res.status(400).json({ success: false, message: 'Gender must be "male" or "female"' });
    }
    
    // Check if user exists
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update user's gender
    await db.update(users)
      .set({ gender })
      .where(eq(users.id, userId));
    
    res.json({ 
      success: true, 
      message: `User gender updated to ${gender}`,
      user: {
        id: userId,
        fullName: user[0].fullName,
        oldGender: user[0].gender,
        newGender: gender
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/assign-random-avatars", async (req: Request, res: Response) => {
  try {
    // Define paths to avatar directories
    const maleAvatarDir = path.join(process.cwd(), 'client', 'src', 'assets', 'MaleAvatar');
    const femaleAvatarDir = path.join(process.cwd(), 'client', 'src', 'assets', 'FemaleAvatar');
    
    // Initialize avatar arrays
    let maleAvatars: string[] = [];
    let femaleAvatars: string[] = [];
    
    // Check if male avatar directory exists and read files
    if (fs.existsSync(maleAvatarDir)) {
      const maleFiles = fs.readdirSync(maleAvatarDir);
      maleAvatars = maleFiles
        .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.svg'))
        .map(file => `/assets/MaleAvatar/${file}`);
    }
    
    // Check if female avatar directory exists and read files
    if (fs.existsSync(femaleAvatarDir)) {
      const femaleFiles = fs.readdirSync(femaleAvatarDir);
      femaleAvatars = femaleFiles
        .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.svg'))
        .map(file => `/assets/FemaleAvatar/${file}`);
    }
    
    // Check if we have avatars
    if (maleAvatars.length === 0 || femaleAvatars.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No avatars found in one or both directories',
        maleAvatarsCount: maleAvatars.length,
        femaleAvatarsCount: femaleAvatars.length
      });
    }
    
    // Get all users from the database
    const allUsers = await db.select().from(users);
    
    // Initialize counters
    let maleCount = 0;
    let femaleCount = 0;
    let skippedCount = 0;
    
    // Process each user
    for (const user of allUsers) {
      if (user.gender === 'male') {
        // Assign random male avatar
        const randomIndex = Math.floor(Math.random() * maleAvatars.length);
        const selectedAvatar = maleAvatars[randomIndex];
        
        await db.update(users)
          .set({ profilePicture: selectedAvatar })
          .where(eq(users.id, user.id));
        
        maleCount++;
      } else if (user.gender === 'female') {
        // Assign random female avatar
        const randomIndex = Math.floor(Math.random() * femaleAvatars.length);
        const selectedAvatar = femaleAvatars[randomIndex];
        
        await db.update(users)
          .set({ profilePicture: selectedAvatar })
          .where(eq(users.id, user.id));
        
        femaleCount++;
      } else {
        // Skip users without gender
        skippedCount++;
      }
    }
    
    // Return success response with statistics
    res.json({ 
      success: true, 
      message: 'Random avatars assigned successfully',
      stats: {
        totalUsers: allUsers.length,
        maleCount,
        femaleCount,
        skippedCount,
        maleAvatarsCount: maleAvatars.length,
        femaleAvatarsCount: femaleAvatars.length
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// NEW: Profile endpoint to get user by ID
app.get("/api/profile/:id", async (req: Request, res: Response) => {
  try {
    const profileId = parseInt(req.params.id);
    
    if (isNaN(profileId)) {
      return res.status(400).json({ error: 'Invalid profile ID' });
    }
    
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Fetch user profile from database
    const user = await db.select().from(users).where(eq(users.id, profileId)).limit(1);
    
    if (!user.length) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const userData = user[0];
    
    // Return user profile data
    return res.json({
      id: userData.id,
      fullName: userData.fullName,
      bloodGroup: userData.bloodGroup,
      email: userData.email,
      phone: userData.phone,
      district: userData.district,
      upazila: userData.upazila,
      profilePicture: userData.profilePicture,
      lastDonation: userData.lastDonationDate,
      donationCount: userData.donationCount,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender,
      weight: userData.weight,
      bio: userData.bio,
      isVerified: userData.isVerified,
      rating: userData.rating,
      address: userData.address
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error(err); // Log the error for debugging
});

// --- VERCEL SERVERLESS EXPORT ---
// This export is for Vercel's serverless environment.
// It creates a handler that Vercel can call for each request.
export default async (req: any, res: any) => {
  // Register all the routes from the `routes.ts` file
  await registerRoutes(app);
  
  // For serverless, we don't need to serve static files here.
  // Vercel handles static files from the `outputDirectory` defined in vercel.json.
  // We just pass the request to the Express app.
  app(req, res);
};

// --- LOCAL DEVELOPMENT SERVER ---
// This block will only run when you are in development mode.
if (process.env.NODE_ENV === "development") {
  (async () => {
    const server = await registerRoutes(app);
    
    if (!server) {
      console.error('Failed to create server. Exiting...');
      process.exit(1);
    }
    
    await setupVite(app, server);
    
    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`🚀 Local development server running on http://localhost:${port}`);
    });
  })();
}
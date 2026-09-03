import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { initialPortfolioData } from './src/data/initialData';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'portfolio_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password hashing utility using PBKDF2
function hashPassword(password: string, salt?: string): { salt: string; hash: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, actualSalt, 100000, 64, 'sha512').toString('hex');
  return { salt: actualSalt, hash };
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
}

// Initialize Database structure
interface DBStructure {
  portfolio: typeof initialPortfolioData;
  adminUser: {
    email: string;
    name: string;
    role: 'admin';
    passwordHash: string;
    passwordSalt: string;
  };
  messages: Array<{
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    date: string;
    isRead: boolean;
  }>;
  media?: Array<{
    id: string;
    filename: string;
    url: string;
    size?: number;
    mimeType?: string;
    date: string;
  }>;
}

function loadDB(): DBStructure {
  const initialAdminPass = '3247900';
  const { salt, hash } = hashPassword(initialAdminPass);

  let data: DBStructure;
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      data = JSON.parse(raw);
    } catch (err) {
      console.error('Error reading database file, creating fresh DB:', err);
      data = {
        portfolio: initialPortfolioData,
        adminUser: {
          email: 'jecinterowino88@gmail.com',
          name: 'Jacinta Akinyi Owino',
          role: 'admin',
          passwordHash: hash,
          passwordSalt: salt,
        },
        messages: [],
      };
    }
  } else {
    data = {
      portfolio: initialPortfolioData,
      adminUser: {
        email: 'jecinterowino88@gmail.com',
        name: 'Jacinta Akinyi Owino',
        role: 'admin',
        passwordHash: hash,
        passwordSalt: salt,
      },
      messages: [],
    };
  }

  // Sanitize: Permanently remove any legacy default images
  if (data.portfolio && data.portfolio.profile) {
    if (data.portfolio.profile.avatarUrl && (
      data.portfolio.profile.avatarUrl.includes('/src/assets/images') ||
      data.portfolio.profile.avatarUrl.includes('jacinta_profile_portrait')
    )) {
      data.portfolio.profile.avatarUrl = '';
    }
  }

  // Clear legacy default gallery items if present
  if (data.portfolio && Array.isArray(data.portfolio.gallery)) {
    data.portfolio.gallery = data.portfolio.gallery.filter((item: any) => {
      if (!item.url) return false;
      if (item.url.includes('/src/assets/images')) return false;
      if (item.url.includes('unsplash.com') || item.url.includes('mixkit.co')) return false;
      return true;
    });
  }

  // Clear legacy default blog post images
  if (data.portfolio && Array.isArray(data.portfolio.blog)) {
    data.portfolio.blog.forEach((post: any) => {
      if (post.imageUrl && (
        post.imageUrl.includes('/src/assets/images') ||
        post.imageUrl.includes('unsplash.com')
      )) {
        post.imageUrl = '';
      }
    });
  }

  // Clear legacy default testimonial avatars
  if (data.portfolio && Array.isArray(data.portfolio.testimonials)) {
    data.portfolio.testimonials.forEach((test: any) => {
      if (test.avatarUrl && (
        test.avatarUrl.includes('/src/assets/images') ||
        test.avatarUrl.includes('unsplash.com')
      )) {
        test.avatarUrl = '';
      }
    });
  }

  // Ensure admin password hash is updated for 3247900
  if (data.adminUser) {
    data.adminUser.passwordSalt = salt;
    data.adminUser.passwordHash = hash;
  }

  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}

function saveDB(data: DBStructure) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

let db = loadDB();

// Active session store (token -> session)
interface Session {
  token: string;
  email: string;
  role: 'admin';
  expiresAt: number;
}
const activeSessions = new Map<string, Session>();

// In-memory rate limiting for login
const loginAttempts = new Map<string, { count: number; blockedUntil: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);
  if (!attempt) return true;
  if (attempt.blockedUntil > now) return false;
  if (now - attempt.blockedUntil > 0 && attempt.blockedUntil !== 0) {
    // block expired
    loginAttempts.delete(ip);
    return true;
  }
  return attempt.count < 6;
}

function recordFailedLogin(ip: string) {
  const now = Date.now();
  const attempt = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 };
  attempt.count += 1;
  if (attempt.count >= 5) {
    attempt.blockedUntil = now + 15 * 60 * 1000; // Block for 15 minutes
  }
  loginAttempts.set(ip, attempt);
}

function clearRateLimit(ip: string) {
  loginAttempts.delete(ip);
}

// Authentication middleware
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
    return;
  }
  // Refresh session activity
  session.expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24h
  next();
}

async function startServer() {
  const app = express();

  // Basic security headers & parsing
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Ensure permanent uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve uploaded media permanently for all visitors, browsers, and devices
  app.use('/uploads', express.static(uploadsDir, { maxAge: '30d' }));
  app.get('/uploads/:filename', (req: Request, res: Response) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('Image not found');
    }
  });

  // ----------------------------------------------------
  // API Routes
  // ----------------------------------------------------

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 1. Get public portfolio data
  app.get('/api/portfolio', (_req: Request, res: Response) => {
    res.json(db.portfolio);
  });

  // 2. Increment visitor counter
  app.post('/api/visitor', (_req: Request, res: Response) => {
    db.portfolio.visitorCount = (db.portfolio.visitorCount || 0) + 1;
    saveDB(db);
    res.json({ visitorCount: db.portfolio.visitorCount });
  });

  // 3. Admin Authentication Login (Password only: 3247900 - No email needed)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      res.status(429).json({ error: 'Too many failed attempts. Please try again after 15 minutes.' });
      return;
    }

    const { password } = req.body;
    if (!password) {
      res.status(400).json({ error: 'Password is required' });
      return;
    }

    // Direct passcode match (3237900 or 3247900) or cryptographic hash match
    const trimmedPass = String(password).trim();
    const isPasswordValid = 
      trimmedPass === '3237900' || 
      trimmedPass === '3247900' || 
      verifyPassword(trimmedPass, db.adminUser.passwordSalt, db.adminUser.passwordHash);

    if (!isPasswordValid) {
      recordFailedLogin(ip);
      res.status(401).json({ error: 'Incorrect passcode.' });
      return;
    }

    clearRateLimit(ip);

    // Generate cryptographic session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    activeSessions.set(token, {
      token,
      email: db.adminUser.email || 'admin@maseno.ac.ke',
      role: 'admin',
      expiresAt,
    });

    res.json({
      success: true,
      token,
      user: {
        email: db.adminUser.email || 'admin@maseno.ac.ke',
        name: db.adminUser.name || 'Jacinta Akinyi Owino',
        role: 'admin',
      },
    });
  });

  // 4. Verify current session
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ authenticated: false });
      return;
    }
    const token = authHeader.split(' ')[1];
    const session = activeSessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      res.status(401).json({ authenticated: false });
      return;
    }
    res.json({
      authenticated: true,
      user: {
        email: db.adminUser.email,
        name: db.adminUser.name,
        role: db.adminUser.role,
      },
    });
  });

  // 5. Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      activeSessions.delete(token);
    }
    res.json({ success: true });
  });

  // 6. Change Password (Admin only)
  app.post('/api/auth/change-password', requireAdmin, (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'Valid current password and new password (min 6 chars) required' });
      return;
    }

    const isValid = verifyPassword(String(currentPassword), db.adminUser.passwordSalt, db.adminUser.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Current password incorrect' });
      return;
    }

    const { salt, hash } = hashPassword(String(newPassword));
    db.adminUser.passwordSalt = salt;
    db.adminUser.passwordHash = hash;
    saveDB(db);

    res.json({ success: true, message: 'Password updated successfully' });
  });

  // 7. Update Portfolio Section (Admin only)
  app.put('/api/admin/section/:section', requireAdmin, (req: Request, res: Response) => {
    const { section } = req.params;
    const data = req.body;

    const allowedSections = [
      'profile',
      'academic',
      'teachingPractice',
      'skills',
      'gallery',
      'blog',
      'testimonials',
      'timeline',
      'documents',
      'siteSettings',
    ];

    if (!allowedSections.includes(section)) {
      res.status(400).json({ error: `Invalid section: ${section}` });
      return;
    }

    // @ts-ignore dynamic index
    db.portfolio[section] = data;
    saveDB(db);

    res.json({ success: true, section, data });
  });

  // 8. Contact Form submission (Public)
  app.post('/api/contact', (req: Request, res: Response) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email, and message are required' });
      return;
    }

    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: String(name).trim().slice(0, 100),
      email: String(email).trim().slice(0, 150),
      subject: String(subject || 'Inquiry regarding ECDE Teaching').trim().slice(0, 150),
      message: String(message).trim().slice(0, 3000),
      date: new Date().toISOString(),
      isRead: false,
    };

    db.messages.unshift(newMessage);
    saveDB(db);

    res.json({ success: true, message: 'Thank you! Your message has been delivered to Jacinta Akinyi Owino.' });
  });

  // 9. Admin view messages
  app.get('/api/admin/messages', requireAdmin, (_req: Request, res: Response) => {
    res.json(db.messages);
  });

  // 10. Admin mark message read
  app.put('/api/admin/messages/:id/read', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const msg = db.messages.find((m) => m.id === id);
    if (msg) {
      msg.isRead = true;
      saveDB(db);
    }
    res.json({ success: true });
  });

  // 11. Admin delete message
  app.delete('/api/admin/messages/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    db.messages = db.messages.filter((m) => m.id !== id);
    saveDB(db);
    res.json({ success: true });
  });

  // 12. Media/File upload endpoint with permanent persistence
  app.post('/api/admin/upload', requireAdmin, (req: Request, res: Response) => {
    const { filename, fileData, fileType, width, height, compressedSize } = req.body;
    if (!fileData) {
      res.status(400).json({ error: 'No file data provided' });
      return;
    }

    try {
      // Validate base64 or data URL
      const isDataUrl = typeof fileData === 'string' && fileData.startsWith('data:');
      let base64Content = fileData;
      let extension = '.webp';
      let mimeType = fileType || 'image/webp';

      if (isDataUrl) {
        const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          base64Content = matches[2];
          if (mimeType.includes('png')) extension = '.png';
          else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = '.jpg';
          else if (mimeType.includes('webp')) extension = '.webp';
          else if (mimeType.includes('pdf')) extension = '.pdf';
          else if (mimeType.includes('mp4')) extension = '.mp4';
        }
      }

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const cleanName = typeof filename === 'string'
        ? filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30)
        : 'upload';
      const safeName = `${cleanName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${extension}`;
      const filePath = path.join(uploadsDir, safeName);

      const buffer = Buffer.from(base64Content, 'base64');
      fs.writeFileSync(filePath, buffer);

      const mediaItem = {
        id: `media-${Date.now()}`,
        filename: safeName,
        url: `/uploads/${safeName}`,
        size: compressedSize || buffer.length,
        mimeType,
        date: new Date().toISOString(),
      };

      if (!db.media) db.media = [];
      db.media.unshift(mediaItem);
      saveDB(db);

      console.log(`[Storage]: Saved permanent upload ${safeName} (${buffer.length} bytes)`);

      res.json({
        success: true,
        url: `/uploads/${safeName}`,
        filename: safeName,
        size: buffer.length,
        mediaItem,
      });
    } catch (err: any) {
      console.error('File upload error:', err);
      res.status(500).json({ error: 'Failed to save uploaded file: ' + (err?.message || String(err)) });
    }
  });

  // Media Library endpoint
  app.get('/api/admin/media', requireAdmin, (_req: Request, res: Response) => {
    res.json(db.media || []);
  });

  // Delete media item
  app.delete('/api/admin/media/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    if (!db.media) {
      res.json({ success: true });
      return;
    }
    const item = db.media.find((m) => m.id === id);
    if (item) {
      try {
        const filePath = path.join(process.cwd(), 'public', 'uploads', item.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        console.warn('Could not delete physical file:', e);
      }
      db.media = db.media.filter((m) => m.id !== id);
      saveDB(db);
    }
    res.json({ success: true });
  });

  // 13. Backup & Restore
  app.get('/api/admin/backup', requireAdmin, (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="jacinta_portfolio_backup_${new Date().toISOString().split('T')[0]}.json"`);
    res.send(JSON.stringify(db, null, 2));
  });

  app.post('/api/admin/restore', requireAdmin, (req: Request, res: Response) => {
    const backupData = req.body;
    if (!backupData || !backupData.portfolio) {
      res.status(400).json({ error: 'Invalid backup file structure' });
      return;
    }

    db.portfolio = backupData.portfolio;
    if (backupData.messages) db.messages = backupData.messages;
    saveDB(db);

    res.json({ success: true, message: 'Database successfully restored from backup' });
  });

  // 14. Reset to Initial Defaults
  app.post('/api/admin/reset-defaults', requireAdmin, (_req: Request, res: Response) => {
    db.portfolio = JSON.parse(JSON.stringify(initialPortfolioData));
    saveDB(db);
    res.json({ success: true, message: 'Portfolio reset to authentic defaults.' });
  });

  // ----------------------------------------------------
  // Vite Integration (SPA Middleware / Static Serving)
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Jacinta Akinyi Owino E-Portfolio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

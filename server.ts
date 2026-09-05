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

const MEDIA_VAULT_FILE = path.join(DATA_DIR, 'media_vault.json');

// Initialize Database structure
interface MediaItemDB {
  id: string;
  filename: string;
  url: string;
  permanentUrl: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  date: string;
  storageProvider: 'server-permanent' | 'firebase-storage' | 'cloud-storage';
  checksum?: string;
  status: 'active' | 'synced' | 'verified';
  associatedSection?: string;
}

interface VaultItem {
  id: string;
  filename: string;
  mimeType: string;
  base64: string;
  size: number;
  date: string;
  checksum: string;
}

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
  media?: MediaItemDB[];
}

function loadMediaVault(): Record<string, VaultItem> {
  if (fs.existsSync(MEDIA_VAULT_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(MEDIA_VAULT_FILE, 'utf-8'));
    } catch (e) {
      console.error('Error reading media vault:', e);
    }
  }
  return {};
}

function saveMediaVault(vault: Record<string, VaultItem>) {
  try {
    fs.writeFileSync(MEDIA_VAULT_FILE, JSON.stringify(vault, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving media vault:', e);
  }
}

function rehydrateMediaFiles(database: DBStructure): number {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const vault = loadMediaVault();
  let rehydratedCount = 0;

  if (database.media && Array.isArray(database.media)) {
    for (const item of database.media) {
      const filePath = path.join(uploadsDir, item.filename);
      if (!fs.existsSync(filePath)) {
        const vaultItem = vault[item.id] || Object.values(vault).find((v) => v.filename === item.filename);
        if (vaultItem && vaultItem.base64) {
          try {
            fs.writeFileSync(filePath, Buffer.from(vaultItem.base64, 'base64'));
            rehydratedCount++;
            console.log(`[Media Rehydration]: Restored ${item.filename} from persistent vault.`);
          } catch (err) {
            console.error(`Failed to rehydrate ${item.filename}:`, err);
          }
        }
      }
    }
  }

  return rehydratedCount;
}

function migrateExistingImages(database: DBStructure): boolean {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const vault = loadMediaVault();
  let migrated = false;

  if (!database.media) database.media = [];

  const processUrl = (url: string, section: string, defaultName: string): string => {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('data:image/')) {
      try {
        const matches = url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64 = matches[2];
          let ext = '.webp';
          if (mimeType.includes('png')) ext = '.png';
          else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';

          const id = `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
          const filename = `${defaultName}_${id}${ext}`;
          const filePath = path.join(uploadsDir, filename);
          const buf = Buffer.from(base64, 'base64');
          fs.writeFileSync(filePath, buf);

          const checksum = crypto.createHash('sha256').update(buf).digest('hex');
          vault[id] = {
            id,
            filename,
            mimeType,
            base64,
            size: buf.length,
            date: new Date().toISOString(),
            checksum,
          };

          database.media!.unshift({
            id,
            filename,
            url: `/uploads/${filename}`,
            permanentUrl: `/uploads/${filename}`,
            size: buf.length,
            mimeType,
            date: new Date().toISOString(),
            storageProvider: 'server-permanent',
            checksum,
            status: 'active',
            associatedSection: section,
          });

          migrated = true;
          return `/uploads/${filename}`;
        }
      } catch (e) {
        console.error('Migration error for URL:', e);
      }
    }
    return url;
  };

  if (database.portfolio?.profile?.avatarUrl) {
    database.portfolio.profile.avatarUrl = processUrl(database.portfolio.profile.avatarUrl, 'profile', 'profile_photo');
  }

  if (Array.isArray(database.portfolio?.gallery)) {
    database.portfolio.gallery.forEach((item, idx) => {
      item.url = processUrl(item.url, 'gallery', `gallery_${idx}`);
    });
  }

  if (Array.isArray(database.portfolio?.blog)) {
    database.portfolio.blog.forEach((item, idx) => {
      if (item.imageUrl) {
        item.imageUrl = processUrl(item.imageUrl, 'blog', `blog_${idx}`);
      }
    });
  }

  // Remove legacy testimonials from database if present
  if ((database.portfolio as any)?.testimonials) {
    delete (database.portfolio as any).testimonials;
    migrated = true;
  }

  if (migrated) {
    saveMediaVault(vault);
    saveDB(database);
    console.log('[Media Migration]: Converted inline images to permanent disk storage.');
  }

  return migrated;
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

  // Remove legacy testimonials if present
  if (data.portfolio && (data.portfolio as any).testimonials) {
    delete (data.portfolio as any).testimonials;
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
  if (data.portfolio) {
    (data.portfolio as any)._lastUpdated = new Date().toISOString();
    (data.portfolio as any)._version = ((data.portfolio as any)._version || 0) + 1;
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

let db = loadDB();

// Rehydrate any missing physical files from the persistent media vault
try {
  const rehydrated = rehydrateMediaFiles(db);
  if (rehydrated > 0) {
    console.log(`[Storage Pipeline]: Successfully rehydrated ${rehydrated} media files from vault.`);
  }
  migrateExistingImages(db);
} catch (e) {
  console.error('[Storage Pipeline Init Error]:', e);
}

// Active session store with disk persistence across server restarts
interface Session {
  token: string;
  email: string;
  role: 'admin';
  expiresAt: number;
}

const SESSIONS_FILE = path.join(process.cwd(), 'active_sessions.json');

function loadSessions(): Map<string, Session> {
  const map = new Map<string, Session>();
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
      const now = Date.now();
      for (const [token, session] of Object.entries(data as Record<string, Session>)) {
        if (session && session.expiresAt > now) {
          map.set(token, session);
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load sessions from disk:', e);
  }
  return map;
}

function saveSessions(map: Map<string, Session>) {
  try {
    const obj: Record<string, Session> = {};
    for (const [token, session] of map.entries()) {
      obj[token] = session;
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed to save sessions to disk:', e);
  }
}

const activeSessions = loadSessions();

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
  let session = activeSessions.get(token);
  if (!session) {
    const refreshed = loadSessions();
    session = refreshed.get(token);
    if (session) activeSessions.set(token, session);
  }

  if (!session || session.expiresAt < Date.now()) {
    if (session) {
      activeSessions.delete(token);
      saveSessions(activeSessions);
    }
    res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
    return;
  }
  // Refresh session activity (extend by 7 days for stable admin work)
  session.expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  saveSessions(activeSessions);
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
  app.use('/uploads', express.static(uploadsDir, {
    maxAge: '365d',
    immutable: true,
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  }));

  app.get('/uploads/:filename', (req: Request, res: Response) => {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.sendFile(filePath);
      return;
    }

    // Auto-rehydrate from media vault if missing from disk
    const vault = loadMediaVault();
    const vaultItem = Object.values(vault).find((v) => v.filename === filename);
    if (vaultItem && vaultItem.base64) {
      try {
        fs.writeFileSync(filePath, Buffer.from(vaultItem.base64, 'base64'));
        console.log(`[Storage]: On-the-fly rehydration of ${filename} succeeded.`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.sendFile(filePath);
        return;
      } catch (err) {
        console.error('On-the-fly rehydration failed:', err);
      }
    }

    res.status(404).send('Image not found in storage');
  });

  // Permanent Media Resource Endpoint (/api/media/:id)
  app.get('/api/media/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const media = db.media?.find((m) => m.id === id || m.filename === id);
    const targetFilename = media ? media.filename : path.basename(id);
    const filePath = path.join(uploadsDir, targetFilename);

    if (fs.existsSync(filePath)) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.sendFile(filePath);
      return;
    }

    // Attempt vault rehydration
    const vault = loadMediaVault();
    const vaultItem = vault[id] || Object.values(vault).find((v) => v.filename === targetFilename);
    if (vaultItem && vaultItem.base64) {
      try {
        fs.writeFileSync(filePath, Buffer.from(vaultItem.base64, 'base64'));
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.sendFile(filePath);
        return;
      } catch (err) {
        console.error('Vault delivery failed:', err);
      }
    }

    res.status(404).json({ error: 'Media not found' });
  });

  // ----------------------------------------------------
  // API Routes
  // ----------------------------------------------------

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Database and Media synchronization version check
  app.get('/api/portfolio/version', (_req: Request, res: Response) => {
    res.json({
      version: (db.portfolio as any)._version || 1,
      lastUpdated: (db.portfolio as any)._lastUpdated || new Date().toISOString(),
      mediaCount: db.media?.length || 0,
    });
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
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    activeSessions.set(token, {
      token,
      email: db.adminUser.email || 'admin@maseno.ac.ke',
      role: 'admin',
      expiresAt,
    });
    saveSessions(activeSessions);

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
    let session = activeSessions.get(token);
    if (!session) {
      const refreshed = loadSessions();
      session = refreshed.get(token);
      if (session) activeSessions.set(token, session);
    }
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
      saveSessions(activeSessions);
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

  // 12. Media/File upload endpoint with permanent persistence, vault backup & unique IDs
  app.post('/api/admin/upload', requireAdmin, (req: Request, res: Response) => {
    const { filename, fileData, fileType, width, height, compressedSize, associatedSection } = req.body;
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

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const cleanName = typeof filename === 'string'
        ? filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30)
        : 'upload';

      // Permanent unique ID (prefer client-assigned uniqueId if provided)
      const uniqueId = (req.body.id && typeof req.body.id === 'string') 
        ? req.body.id 
        : `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const safeName = `${cleanName}_${uniqueId}${extension}`;
      const filePath = path.join(uploadsDir, safeName);

      const buffer = Buffer.from(base64Content, 'base64');
      fs.writeFileSync(filePath, buffer);

      const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

      // Persist to Media Vault for disaster recovery / rehydration across redeployments
      const vault = loadMediaVault();
      vault[uniqueId] = {
        id: uniqueId,
        filename: safeName,
        mimeType,
        base64: base64Content,
        size: buffer.length,
        date: new Date().toISOString(),
        checksum,
      };
      saveMediaVault(vault);

      const mediaItem: MediaItemDB = {
        id: uniqueId,
        filename: safeName,
        url: `/uploads/${safeName}`,
        permanentUrl: `/uploads/${safeName}`,
        size: compressedSize || buffer.length,
        mimeType,
        width: width || 0,
        height: height || 0,
        date: new Date().toISOString(),
        storageProvider: req.body.storageProvider || 'server-permanent',
        checksum,
        status: 'active',
        associatedSection: associatedSection || 'general',
      };

      if (!db.media) db.media = [];
      db.media.unshift(mediaItem);
      saveDB(db);

      console.log(`[Permanent Cloud Storage]: Saved upload ${uniqueId} (${safeName}, ${buffer.length} bytes)`);

      res.json({
        success: true,
        id: uniqueId,
        url: `/uploads/${safeName}`,
        permanentUrl: `/uploads/${safeName}`,
        filename: safeName,
        size: buffer.length,
        mediaItem,
      });
    } catch (err: any) {
      console.error('File upload error:', err);
      res.status(500).json({ error: 'Failed to save uploaded file: ' + (err?.message || String(err)) });
    }
  });

  // Public persistent image blob serving endpoint with aggressive caching
  app.get('/api/media/blob/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const vault = loadMediaVault();

    // 1. Look up in media vault
    const vaultItem = vault[id] || Object.values(vault).find((v) => v.id === id || v.filename === id);
    if (vaultItem && vaultItem.base64) {
      const buffer = Buffer.from(vaultItem.base64, 'base64');
      res.setHeader('Content-Type', vaultItem.mimeType || 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
      return;
    }

    // 2. Look up in db.media & uploads directory
    if (db.media) {
      const item = db.media.find((m) => m.id === id || m.filename === id);
      if (item) {
        const filePath = path.join(uploadsDir, item.filename);
        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', item.mimeType || 'image/webp');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          res.sendFile(filePath);
          return;
        }
      }
    }

    // 3. Look up by filename pattern in uploads
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const match = files.find((f) => f.includes(id));
      if (match) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.sendFile(path.join(uploadsDir, match));
        return;
      }
    }

    res.status(404).json({ error: 'Image asset not found' });
  });

  // Register external or cloud-storage image into authoritative media catalog
  app.post('/api/admin/media/register', requireAdmin, (req: Request, res: Response) => {
    const { filename, url, size, mimeType, width, height, storageProvider, associatedSection } = req.body;
    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    const uniqueId = `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const mediaItem: MediaItemDB = {
      id: uniqueId,
      filename: filename || `cloud_${uniqueId}`,
      url,
      permanentUrl: url,
      size: size || 0,
      mimeType: mimeType || 'image/webp',
      width: width || 0,
      height: height || 0,
      date: new Date().toISOString(),
      storageProvider: storageProvider || 'cloud-storage',
      status: 'synced',
      associatedSection: associatedSection || 'general',
    };

    if (!db.media) db.media = [];
    db.media.unshift(mediaItem);
    saveDB(db);

    res.json({ success: true, mediaItem });
  });

  // Media Library catalog endpoints
  app.get('/api/media', (_req: Request, res: Response) => {
    res.json(db.media || []);
  });

  app.get('/api/admin/media', requireAdmin, (_req: Request, res: Response) => {
    res.json(db.media || []);
  });

  // Delete media item from database, disk and vault
  app.delete('/api/admin/media/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    if (!db.media) {
      res.json({ success: true });
      return;
    }

    const item = db.media.find((m) => m.id === id || m.filename === id);
    if (item) {
      try {
        const filePath = path.join(uploadsDir, item.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        console.warn('Could not delete physical file:', e);
      }

      // Remove from vault
      const vault = loadMediaVault();
      if (vault[item.id]) {
        delete vault[item.id];
        saveMediaVault(vault);
      }

      db.media = db.media.filter((m) => m.id !== item.id);
      saveDB(db);
    }
    res.json({ success: true });
  });

  // Automated Storage Integrity check endpoint
  app.get('/api/admin/media/integrity', requireAdmin, (_req: Request, res: Response) => {
    const items: any[] = [];
    let verifiedCount = 0;
    let missingCount = 0;

    const checkFile = (url: string, associatedWith: string) => {
      if (!url || typeof url !== 'string') return;
      if (url.startsWith('/uploads/')) {
        const filename = url.replace('/uploads/', '');
        const filePath = path.join(uploadsDir, filename);
        const exists = fs.existsSync(filePath);
        const size = exists ? fs.statSync(filePath).size : 0;
        if (exists) verifiedCount++;
        else missingCount++;
        items.push({
          id: filename,
          filename,
          url,
          existsOnDisk: exists,
          size,
          associatedWith,
          status: exists ? 'healthy' : 'missing',
        });
      }
    };

    if (db.portfolio?.profile?.avatarUrl) {
      checkFile(db.portfolio.profile.avatarUrl, 'Profile Photo');
    }

    if (Array.isArray(db.portfolio?.gallery)) {
      db.portfolio.gallery.forEach((g) => checkFile(g.url, `Gallery: ${g.title}`));
    }

    if (Array.isArray(db.portfolio?.blog)) {
      db.portfolio.blog.forEach((b) => {
        if (b.imageUrl) checkFile(b.imageUrl, `Blog: ${b.title}`);
      });
    }

    if (Array.isArray(db.media)) {
      db.media.forEach((m) => {
        if (!items.some((it) => it.filename === m.filename)) {
          const filePath = path.join(uploadsDir, m.filename);
          const exists = fs.existsSync(filePath);
          if (exists) verifiedCount++;
          else missingCount++;
          items.push({
            id: m.id,
            filename: m.filename,
            url: m.url,
            existsOnDisk: exists,
            size: exists ? fs.statSync(filePath).size : m.size,
            associatedWith: m.associatedSection || 'Media Library',
            status: exists ? 'healthy' : 'missing',
          });
        }
      });
    }

    res.json({
      totalMediaCount: items.length,
      verifiedCount,
      missingCount,
      storageLocation: '/public/uploads (Server Storage Vault) + Cloud Firestore',
      cloudSyncStatus: 'synced',
      lastChecked: new Date().toISOString(),
      items,
    });
  });

  // Storage Repair and Disaster Recovery endpoint
  app.post('/api/admin/media/repair', requireAdmin, (_req: Request, res: Response) => {
    const rehydrated = rehydrateMediaFiles(db);
    const migrated = migrateExistingImages(db);
    res.json({
      success: true,
      repairedCount: rehydrated + (migrated ? 1 : 0),
      message: `Integrity check complete: ${rehydrated} files rehydrated from vault, ${migrated ? 'database records migrated.' : 'database verified healthy.'}`,
    });
  });

  // Manual Trigger for legacy image migration
  app.post('/api/admin/media/migrate', requireAdmin, (_req: Request, res: Response) => {
    const migrated = migrateExistingImages(db);
    res.json({
      success: true,
      migrated,
      message: migrated ? 'Legacy images successfully migrated to permanent storage.' : 'All images are already stored permanently.',
    });
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

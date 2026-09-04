export interface Profile {
  name: string;
  title: string;
  course: string;
  institution: string;
  admissionNumber: string;
  avatarUrl: string;
  shortBio: string;
  fullBio: string;
  careerObjective: string;
  philosophy: string;
  email: string;
  phone: string;
  location: string;
  yearsOfStudy: string;
  expectedGraduation: string;
  socialLinks: {
    linkedin?: string;
    whatsapp?: string;
    twitter?: string;
    researchgate?: string;
  };
}

export interface AcademicAchievement {
  id: string;
  title: string;
  year: string;
  description: string;
  issuer: string;
}

export interface AcademicCertificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  category: string;
  credentialUrl?: string;
  description: string;
}

export interface AcademicInfo {
  institution: string;
  course: string;
  department: string;
  admissionNumber: string;
  achievements: AcademicAchievement[];
  certificates: AcademicCertificate[];
  coreUnits: string[];
}

export interface TeachingPractice {
  institutionName: string;
  location: string;
  duration: string;
  period: string;
  briefHistory: string;
  summary: string;
  activitiesPerformed: string[];
  sanitationWork: {
    title: string;
    description: string;
    items: string[];
  };
  lessonsTaught: {
    subject: string;
    level: string;
    description: string;
    keyLearnings: string[];
  }[];
  communityEngagement: string[];
  supervisorFeedback: {
    rating: string;
    remarks: string;
    evaluator: string;
  };
}

export interface Skill {
  id: string;
  name: string;
  category: 'Pedagogy' | 'Child Development' | 'Administration' | 'Community' | 'Hygiene';
  proficiency: number; // 0 - 100
  description: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video';
  url: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  category: 'Teaching Practice' | 'Classroom' | 'Sanitation & Hygiene' | 'Community' | 'Maseno Campus' | 'Certificates';
  album: string;
  date: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: 'Weekly Reflection' | 'Attachment Report' | 'Teaching Experience' | 'Academic Article';
  summary: string;
  content: string; // Markdown or rich text
  author: string;
  date: string;
  readingTime: string;
  tags: string[];
  isPublished: boolean;
  scheduledDate?: string;
  imageUrl?: string;
}

export interface TimelineItem {
  id: string;
  year: string;
  title: string;
  institutionOrPlace: string;
  description: string;
  type: 'academic' | 'practical' | 'award';
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'Lesson Plan' | 'Attachment Log' | 'Academic Report' | 'Curriculum Guide' | 'Sanitation Plan';
  fileSize: string;
  uploadDate: string;
  description: string;
  downloadUrl: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  isRead: boolean;
}

export interface SiteSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  siteTitle: string;
  logoText: string;
  footerText: string;
  enableVisitorCounter: boolean;
  seoDescription: string;
  seoKeywords: string;
  firebaseSyncEnabled?: boolean;
  customFirebaseConfig?: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
}

export interface PortfolioData {
  profile: Profile;
  academic: AcademicInfo;
  teachingPractice: TeachingPractice;
  skills: Skill[];
  gallery: GalleryItem[];
  blog: BlogPost[];
  timeline: TimelineItem[];
  documents: DocumentItem[];
  siteSettings: SiteSettings;
  visitorCount: number;
}

export interface AuthUser {
  email: string;
  name: string;
  role: 'admin';
  token: string;
}

export interface MediaItem {
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
  associatedSection?: 'profile' | 'gallery' | 'blog' | 'document' | 'general';
}

export interface StorageIntegrityReport {
  totalMediaCount: number;
  verifiedCount: number;
  missingCount: number;
  storageLocation: string;
  cloudSyncStatus: 'synced' | 'local_only' | 'pending';
  lastChecked: string;
  items: Array<{
    id: string;
    filename: string;
    url: string;
    existsOnDisk: boolean;
    size: number;
    associatedWith: string;
    status: 'healthy' | 'missing' | 'orphaned';
  }>;
}

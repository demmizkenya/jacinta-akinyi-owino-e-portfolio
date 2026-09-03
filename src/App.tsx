import React, { useState, useEffect } from 'react';
import { initialPortfolioData } from './data/initialData';
import { PortfolioData, AuthUser, GalleryItem, BlogPost } from './types';

// Components
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { AcademicSection } from './components/AcademicSection';
import { TeachingPracticeSection } from './components/TeachingPracticeSection';
import { SkillsSection } from './components/SkillsSection';
import { GallerySection } from './components/GallerySection';
import { BlogSection } from './components/BlogSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { TimelineSection } from './components/TimelineSection';
import { DocumentsSection } from './components/DocumentsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';

// Modals
import { LightboxModal } from './components/LightboxModal';
import { BlogModal } from './components/BlogModal';
import { CVModal } from './components/CVModal';
import { SearchModal } from './components/SearchModal';
import { LoginModal } from './components/LoginModal';
import { AdminPortal } from './components/AdminPortal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import {
  syncPortfolioToFirestore,
  fetchPortfolioFromFirestore,
  subscribePortfolioFromFirestore,
} from './lib/firebase';

export default function App() {
  const [data, setData] = useState<PortfolioData>(() => {
    const cached = localStorage.getItem('jacinta_portfolio_data');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return initialPortfolioData;
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [visitorCount, setVisitorCount] = useState<number>(1428);

  // Modal States
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isCVModalOpen, setIsCVModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState<boolean>(false);

  // Auth User
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  // Initial Load: Fetch portfolio from backend, increment visitor counter, verify token
  useEffect(() => {
    // Check saved theme preference
    const savedTheme = localStorage.getItem('jacinta_portfolio_theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Direct authoritative fetch from database / backend server
    const fetchAuthoritativePortfolio = async () => {
      // 1. First fetch directly from backend API / database (authoritative source)
      try {
        const res = await fetch('/api/portfolio');
        if (res.ok) {
          const fetchedData = await res.json();
          setData(fetchedData);
          localStorage.setItem('jacinta_portfolio_data', JSON.stringify(fetchedData));
          if (fetchedData.visitorCount) {
            setVisitorCount(fetchedData.visitorCount);
          }
          console.log('[Authoritative Sync]: Retrieved latest portfolio state directly from database.');
          return;
        }
      } catch (err) {
        console.warn('Backend API temporarily unreachable. Checking cloud Firestore...');
      }

      // 2. Check Firestore for latest documents
      try {
        const cloudData = await fetchPortfolioFromFirestore();
        if (cloudData) {
          console.log('[App]: Retrieved portfolio data from Firestore cloud database');
          setData((prev) => ({ ...prev, ...cloudData }));
          localStorage.setItem('jacinta_portfolio_data', JSON.stringify(cloudData));
          return;
        }
      } catch (fbErr) {
        console.warn('[App]: Firestore cloud fetch skipped:', fbErr);
      }

      // 3. Fallback to cached copy only if completely offline
      const cached = localStorage.getItem('jacinta_portfolio_data');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setData(parsed);
          if (parsed.visitorCount) {
            setVisitorCount(parsed.visitorCount);
          }
        } catch {}
      }
    };

    // Listen to real-time changes from Firestore so any image upload or edit syncs to all visitors instantly
    const unsubscribeFirestore = subscribePortfolioFromFirestore((cloudData) => {
      if (cloudData) {
        setData((prev) => ({ ...prev, ...cloudData }));
        localStorage.setItem('jacinta_portfolio_data', JSON.stringify(cloudData));
      }
    });

    // Automatic background synchronization: polls version every 8 seconds so any admin changes appear globally
    let knownVersion = 0;
    const syncInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/portfolio/version');
        if (res.ok) {
          const info = await res.json();
          if (info.version) {
            if (knownVersion !== 0 && info.version > knownVersion) {
              console.log(`[Auto-Sync]: New administrator upload detected (v${info.version}). Synchronizing view...`);
              const pRes = await fetch('/api/portfolio');
              if (pRes.ok) {
                const freshData = await pRes.json();
                setData(freshData);
                localStorage.setItem('jacinta_portfolio_data', JSON.stringify(freshData));
              }
            }
            knownVersion = info.version;
          }
        }
      } catch {
        // Silent catch for background poll
      }
    }, 8000);

    // Increment visitor counter on server
    const incrementVisitor = async () => {
      try {
        const res = await fetch('/api/visitor', { method: 'POST' });
        if (res.ok) {
          const resData = await res.json();
          setVisitorCount(resData.visitorCount);
        }
      } catch (err) {
        setVisitorCount((prev) => prev + 1);
      }
    };

    // Verify stored admin token
    const verifyToken = async () => {
      const token = localStorage.getItem('jacinta_portfolio_admin_token');
      const savedAuth = localStorage.getItem('jacinta_portfolio_admin_auth');
      if (token) {
        if (savedAuth) {
          try {
            setAuthUser(JSON.parse(savedAuth));
          } catch {}
        }
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const userData = await res.json();
            setAuthUser({
              email: userData.user.email,
              name: userData.user.name,
              role: 'admin',
              token: token,
            });
          }
        } catch (err) {
          console.warn('Auth token server verification skipped, active session preserved.');
        }
      }
    };

    fetchAuthoritativePortfolio();
    incrementVisitor();
    verifyToken();

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      clearInterval(syncInterval);
    };
  }, []);

  // Sync portfolio updates to local storage, backend server, and Firestore in real-time
  const handleUpdateData = (newData: PortfolioData) => {
    setData(newData);
    localStorage.setItem('jacinta_portfolio_data', JSON.stringify(newData));

    // Permanent Cloud Database Sync (Firestore)
    syncPortfolioToFirestore(newData).catch((e) => {
      console.warn('[Firestore Sync Warning]:', e);
    });

    // Backend Server Database Sync
    const token = localStorage.getItem('jacinta_portfolio_admin_token') || '';
    fetch('/api/portfolio', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(newData),
    }).catch((e) => {
      console.warn('[Server Sync Warning]:', e);
    });
  };

  // Theme Toggle Handler
  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('jacinta_portfolio_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('jacinta_portfolio_theme', 'light');
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    setIsAdminPortalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('jacinta_portfolio_admin_token');
    setAuthUser(null);
    setIsAdminPortalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-slate-100 antialiased selection:bg-[#F5EEF7] selection:text-[#7A1C6D]">
      
      {/* Navigation Bar */}
      <Navbar
        siteSettings={data.siteSettings}
        profile={data.profile}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenCV={() => setIsCVModalOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
        isAdminLoggedIn={!!authUser}
      />

      {/* Main Content Sections */}
      <main>
        {/* 1. Hero Section */}
        <HeroSection
          profile={data.profile}
          academic={data.academic}
          onOpenCV={() => setIsCVModalOpen(true)}
        />

        {/* 2. About Me Section */}
        <AboutSection
          profile={data.profile}
          onOpenCV={() => setIsCVModalOpen(true)}
        />

        {/* 3. Academic Background & Maseno Credentials */}
        <AcademicSection academic={data.academic} />

        {/* 4. Teaching Practice & Environmental Sanitation at Bar Ogwal */}
        <TeachingPracticeSection teachingPractice={data.teachingPractice} />

        {/* 5. Professional Skills Matrix */}
        <SkillsSection skills={data.skills} />

        {/* 6. Practicum Gallery & Video Evidence */}
        <GallerySection
          gallery={data.gallery}
          onOpenLightbox={(item) => setLightboxItem(item)}
        />

        {/* 7. Blog & Weekly Reflections */}
        <BlogSection
          blog={data.blog}
          onSelectPost={(post) => setSelectedPost(post)}
        />

        {/* 8. Endorsements & Supervisor Testimonials */}
        <TestimonialsSection testimonials={data.testimonials} />

        {/* 9. Professional Academic Timeline */}
        <TimelineSection timeline={data.timeline} />

        {/* 10. Academic Document Repository */}
        <DocumentsSection
          documents={data.documents}
          onOpenCV={() => setIsCVModalOpen(true)}
        />

        {/* 11. Contact Form & Interactive Map */}
        <ContactSection profile={data.profile} />
      </main>

      {/* Footer */}
      <Footer
        siteSettings={data.siteSettings}
        profile={data.profile}
        visitorCount={visitorCount}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
        isAdminLoggedIn={!!authUser}
      />

      {/* Modals */}
      <LightboxModal
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
      />

      <BlogModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />

      <CVModal
        isOpen={isCVModalOpen}
        onClose={() => setIsCVModalOpen(false)}
        data={data}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        data={data}
        onSelectPost={(post) => setSelectedPost(post)}
        onSelectGallery={(item) => setLightboxItem(item)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* CMS Admin Portal */}
      {authUser && (
        <AdminPortal
          isOpen={isAdminPortalOpen}
          onClose={() => setIsAdminPortalOpen(false)}
          data={data}
          onUpdateData={handleUpdateData}
          authUser={authUser}
          onLogout={handleLogout}
        />
      )}

      {/* Floating WhatsApp Quick Contact */}
      <FloatingWhatsApp phoneNumber="+254 707 076972" />

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Search, 
  FileText, 
  Lock, 
  UserCheck
} from 'lucide-react';
import { SiteSettings, Profile } from '../types';

interface NavbarProps {
  siteSettings: SiteSettings;
  profile?: Profile;
  darkMode?: boolean;
  isDarkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
  onToggleTheme?: () => void;
  onOpenSearch: () => void;
  onOpenCV: () => void;
  onOpenLogin: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  activeSection?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  siteSettings,
  profile,
  darkMode,
  isDarkMode,
  setDarkMode,
  onToggleTheme,
  onOpenSearch,
  onOpenCV,
  onOpenLogin,
  onOpenAdmin,
  isAdminLoggedIn,
  activeSection = 'home',
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDark = isDarkMode ?? darkMode ?? false;
  const toggleTheme = () => {
    if (onToggleTheme) {
      onToggleTheme();
    } else if (setDarkMode) {
      setDarkMode(!isDark);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Academics', href: '#academics' },
    { name: 'Teaching Practice', href: '#teaching-practice' },
    { name: 'Skills', href: '#skills' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Reflections', href: '#reflections' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-200 ${
        scrolled
          ? 'bg-white/95 dark:bg-[#0F0F12]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800 shadow-sm'
          : 'bg-white/80 dark:bg-[#0F0F12]/80 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & University badge */}
          <a
            href="#home"
            className="flex items-center gap-3 group focus:outline-none"
            id="nav-brand-logo"
          >
            <div className="w-10 h-10 rounded-lg bg-[#7A1C6D] text-white flex items-center justify-center font-bold font-serif text-base tracking-wide shadow-sm">
              JO
            </div>
            <div>
              <div className="font-serif font-bold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>{siteSettings.logoText || (profile ? profile.name : 'Jacinta Akinyi Owino')}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F5EEF7] dark:bg-[#241323] text-[#7A1C6D] dark:text-[#D8A0D0]">
                  ECDE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Maseno University Scholar
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                    isActive
                      ? 'text-[#7A1C6D] dark:text-[#D8A0D0] bg-[#F5EEF7] dark:bg-[#241323]'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#7A1C6D] dark:hover:text-[#D8A0D0] hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </nav>

          {/* Action buttons (Search, CV, Theme, Admin) */}
          <div className="hidden sm:flex items-center space-x-2">
            
            {/* Search Button */}
            <button
              id="nav-search-button"
              onClick={onOpenSearch}
              title="Search Portfolio"
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Dark/Light mode toggle */}
            <button
              id="theme-toggle-button"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Download/View CV Button */}
            <button
              id="nav-cv-button"
              onClick={onOpenCV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-zinc-700 hover:border-[#7A1C6D] hover:text-[#7A1C6D] dark:hover:border-[#7A1C6D] dark:hover:text-[#D8A0D0] transition-colors shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View CV</span>
            </button>

            {/* Admin Portal Button */}
            {isAdminLoggedIn ? (
              <button
                id="nav-admin-dashboard-btn"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#7A1C6D] hover:bg-[#66155B] text-white shadow-sm transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Admin CMS</span>
              </button>
            ) : (
              <button
                id="nav-admin-login-btn"
                onClick={onOpenLogin}
                title="Admin Login (CMS)"
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex sm:hidden items-center space-x-1">
            <button
              id="mobile-search-button"
              onClick={onOpenSearch}
              className="p-2 text-slate-600 dark:text-slate-300"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              id="mobile-theme-toggle"
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="lg:hidden bg-white dark:bg-[#121216] border-b border-slate-200 dark:border-zinc-800 px-4 pt-2 pb-6 space-y-2 shadow-lg"
        >
          <div className="grid grid-cols-2 gap-1 py-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-[#7A1C6D]"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCV();
              }}
              className="w-full py-2.5 px-4 text-center rounded-lg bg-white dark:bg-zinc-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-zinc-700 font-medium text-sm flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-[#7A1C6D]" />
              <span>Download / View Official CV</span>
            </button>

            {isAdminLoggedIn ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full py-2.5 px-4 text-center rounded-lg bg-[#7A1C6D] hover:bg-[#66155B] text-white font-medium text-sm flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Open Admin CMS Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full py-2 px-4 text-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium text-xs flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Admin CMS Sign-In</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

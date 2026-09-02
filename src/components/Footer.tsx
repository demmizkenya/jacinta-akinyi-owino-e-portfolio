import React from 'react';
import { 
  GraduationCap, 
  ArrowUp, 
  Lock, 
  Eye, 
  UserCheck
} from 'lucide-react';
import { SiteSettings, Profile } from '../types';

interface FooterProps {
  siteSettings: SiteSettings;
  profile: Profile;
  visitorCount: number;
  onOpenLogin: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  siteSettings,
  profile,
  visitorCount,
  onOpenLogin,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0F0F12] text-white pt-16 pb-12 border-t border-zinc-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-zinc-800">
          
          {/* Brand & Academic Profile (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#7A1C6D] text-white flex items-center justify-center font-bold font-serif text-base shadow-sm">
                JO
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-white">
                  {profile.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {profile.course} • {profile.institution}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Dedicated Early Childhood Educator and pedagogical researcher specializing in child development, Competency-Based Curriculum (CBC), and school environmental sanitation.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-slate-300 font-mono">
              <GraduationCap className="w-3.5 h-3.5 text-[#D8A0D0]" />
              <span>Admission No: {profile.admissionNumber}</span>
            </div>
          </div>

          {/* Navigation Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Portfolio Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#home" className="hover:text-white transition-colors">Home & Overview</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">Educator Bio & Creed</a></li>
              <li><a href="#academics" className="hover:text-white transition-colors">Academic Credentials</a></li>
              <li><a href="#teaching-practice" className="hover:text-white transition-colors">Teaching Practice</a></li>
              <li><a href="#skills" className="hover:text-white transition-colors">Competency Matrix</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Practicum Gallery</a></li>
              <li><a href="#reflections" className="hover:text-white transition-colors">Reflections & Journal</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact Form</a></li>
            </ul>
          </div>

          {/* Verification & System Status (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Institutional Affiliation
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bar Ogwal Primary and Junior School (East Kisumu) & Maseno University School of Education.
            </p>

            {/* Visitor Counter Card */}
            {siteSettings.enableVisitorCounter && (
              <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-zinc-800 text-[#D8A0D0] flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Verified Visitors</span>
                    <span className="text-base font-serif font-bold text-white tracking-wide">
                      {visitorCount ? visitorCount.toLocaleString() : '1,428'}
                    </span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
            )}

            {/* Admin CMS Access */}
            <div className="pt-1">
              {isAdminLoggedIn ? (
                <button
                  onClick={onOpenAdmin}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#7A1C6D] hover:bg-[#66155B] text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Admin CMS Dashboard Active</span>
                </button>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Administrator CMS Sign-In</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            {siteSettings.footerText || `© ${new Date().getFullYear()} Jacinta Akinyi Owino. Maseno University.`}
          </p>

          <div className="flex items-center gap-6">
            <span>
              Academic Distinction • School of Education
            </span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-white transition-colors"
              title="Back to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

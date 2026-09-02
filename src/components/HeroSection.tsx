import React from 'react';
import { 
  ArrowRight, 
  Mail, 
  Download, 
  GraduationCap, 
  MapPin, 
  Award, 
  CheckCircle2, 
  BookOpen
} from 'lucide-react';
import { Profile, AcademicInfo, SiteSettings } from '../types';

interface HeroSectionProps {
  profile: Profile;
  academic?: AcademicInfo;
  siteSettings?: SiteSettings;
  onOpenCV: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  academic,
  onOpenCV,
}) => {
  return (
    <section
      id="home"
      className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 bg-white dark:bg-[#0F0F12] border-b border-slate-200/80 dark:border-zinc-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center">
          
          {/* Left Column: Text, Credentials & CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Institution Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F5EEF7] dark:bg-[#241323] border border-slate-200/60 dark:border-zinc-800 text-xs font-semibold text-[#7A1C6D] dark:text-[#D8A0D0]">
              <GraduationCap className="w-4 h-4 text-[#7A1C6D] dark:text-[#D8A0D0]" />
              <span>{profile.institution}</span>
              <span className="text-slate-300 dark:text-zinc-700">•</span>
              <span className="text-slate-600 dark:text-slate-300">School of Education</span>
              <span className="hidden sm:inline text-slate-300 dark:text-zinc-700">•</span>
              <span className="hidden sm:inline text-slate-500 dark:text-slate-400 font-mono">
                Adm: {profile.admissionNumber}
              </span>
            </div>

            {/* Main Heading / Name */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                {profile.name}
              </h1>
              <p className="text-lg sm:text-xl font-medium text-[#7A1C6D] dark:text-[#D8A0D0]">
                {profile.course}
              </p>
            </div>

            {/* Short Professional Introduction */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              {profile.shortBio}
            </p>

            {/* Academic Credential Highlights */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#7A1C6D] dark:text-[#D8A0D0]" />
                Bar Ogwal Practicum (6 Wks)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#7A1C6D] dark:text-[#D8A0D0]" />
                Environmental Hygiene Champion
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#7A1C6D] dark:text-[#D8A0D0]" />
                Competency-Based Curriculum (CBC)
              </span>
            </div>

            {/* Call-to-action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-3">
              <a
                id="hero-cta-portfolio"
                href="#teaching-practice"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#7A1C6D] hover:bg-[#66155B] text-white font-medium text-sm transition-colors duration-150 shadow-sm"
              >
                <span>View Teaching Practice</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                id="hero-cta-contact"
                href="#contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 font-medium text-sm transition-colors duration-150"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Me</span>
              </a>

              <button
                id="hero-cta-cv"
                onClick={onOpenCV}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors duration-150"
              >
                <Download className="w-4 h-4" />
                <span>Download CV</span>
              </button>
            </div>

            {/* Academic Metrics Row */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-zinc-800 text-left">
              <div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white">
                  6 Wks
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Field Teaching Practice
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-[#7A1C6D] dark:text-[#D8A0D0]">
                  94%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Grade A Attachment Rating
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white">
                  100%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  CBC Framework Aligned
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Clean Professional Portrait (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm">
              <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                <div className="aspect-[4/5] overflow-hidden rounded-xl bg-slate-200 dark:bg-zinc-800 relative">
                  <img
                    id="hero-profile-photo"
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="pt-3 px-1 text-center sm:text-left flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold font-serif text-slate-900 dark:text-white">{profile.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Maseno University • B.Ed (ECDE)</p>
                  </div>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white dark:bg-zinc-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-zinc-700">
                    {profile.admissionNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

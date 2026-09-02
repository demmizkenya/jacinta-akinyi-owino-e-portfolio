import React from 'react';
import { 
  Heart, 
  Target, 
  GraduationCap, 
  CheckCircle2, 
  BookOpen,
  FileText
} from 'lucide-react';
import { Profile } from '../types';

interface AboutSectionProps {
  profile: Profile;
  onOpenCV?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ profile, onOpenCV }) => {
  const coreInterests = [
    {
      title: "Foundational Phonics & Early Literacy",
      desc: "Developing multi-sensory letter-sound associations, tactile flashcards, and bilingual storytelling in English and Kiswahili.",
      icon: BookOpen,
    },
    {
      title: "Holistic Child Psychology",
      desc: "Understanding individual developmental milestones, socio-emotional regulation, and supportive play-based cognitive frameworks.",
      icon: Heart,
    },
    {
      title: "School Hygiene & Environmental Health",
      desc: "Pioneering WASH (Water, Sanitation, and Hygiene) initiatives, handwashing drills, clean water access, and school greening.",
      icon: CheckCircle2,
    },
    {
      title: "Competency-Based Curriculum (CBC)",
      desc: "Creating formative assessment rubrics, individual learner portfolios, and child-centered practical discovery stations.",
      icon: Target,
    },
  ];

  return (
    <section id="about" className="py-24 sm:py-28 bg-slate-50/60 dark:bg-[#0C0C0E] border-b border-slate-200/80 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider mb-2">
            Educator Profile & Philosophy
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
            About Jacinta Akinyi Owino
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg leading-relaxed">
            A dedicated early childhood educator and pedagogical researcher at Maseno University, focused on child-centered foundational learning, learner well-being, and safe school environments.
          </p>
        </div>

        {/* Top Grid: Academic Profile & Educational Philosophy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
          
          {/* Academic Background (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="w-10 h-10 rounded-lg bg-[#F5EEF7] dark:bg-[#241323] text-[#7A1C6D] dark:text-[#D8A0D0] flex items-center justify-center font-medium">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                    Academic Background & Specialization
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Maseno University • School of Education
                  </p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                {profile.fullBio}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Programme</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{profile.course}</span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Institution</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{profile.institution}</span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Base Location</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{profile.location}</span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Admission Number</span>
                  <span className="text-sm font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] font-mono">{profile.admissionNumber}</span>
                </div>
              </div>
            </div>

            {/* Career Objectives */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-zinc-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-[#F5EEF7] dark:bg-[#241323] text-[#7A1C6D] dark:text-[#D8A0D0] flex items-center justify-center shrink-0 mt-0.5">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Career Objective
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {profile.careerObjective}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Educational Philosophy Card (5 cols) - Clean Card without gradients or floating shapes */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-semibold bg-[#F5EEF7] dark:bg-[#241323] text-[#7A1C6D] dark:text-[#D8A0D0]">
                <span>Pedagogical Creed</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white leading-snug">
                "The foundation built in early childhood shapes a lifetime of curiosity and character."
              </h3>

              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic border-l-2 border-[#7A1C6D] pl-3 py-0.5">
                "{profile.philosophy}"
              </p>

              <div className="pt-2 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7A1C6D] dark:text-[#D8A0D0] shrink-0" />
                  <span>Holistic Child Centeredness (Social, Emotional, Cognitive)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7A1C6D] dark:text-[#D8A0D0] shrink-0" />
                  <span>Experiential & Play-Based Learning Manipulatives</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7A1C6D] dark:text-[#D8A0D0] shrink-0" />
                  <span>Environmental Health, Nutrition, and Safe Schools</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="font-serif font-bold text-sm text-slate-900 dark:text-white">{profile.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Maseno University Class of 2025</p>
              </div>
              {onOpenCV && (
                <button
                  onClick={onOpenCV}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] hover:underline"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Full Bio</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Bottom: Professional Interests Grid */}
        <div>
          <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-6">
            Professional Competency Focus Areas
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreInterests.map((interest, idx) => {
              const IconComp = interest.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors duration-150"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#F5EEF7] dark:bg-[#241323] text-[#7A1C6D] dark:text-[#D8A0D0] flex items-center justify-center mb-4">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white mb-2">
                    {interest.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {interest.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

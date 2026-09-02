import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  MapPin, 
  Award, 
  CheckCircle2, 
  Droplets, 
  BookOpen, 
  UserCheck, 
  Users 
} from 'lucide-react';
import { TeachingPractice } from '../types';

interface TeachingPracticeSectionProps {
  teachingPractice: TeachingPractice;
}

export const TeachingPracticeSection: React.FC<TeachingPracticeSectionProps> = ({
  teachingPractice,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sanitation' | 'lessons' | 'feedback'>('overview');

  return (
    <section id="teaching-practice" className="py-24 sm:py-28 bg-slate-50/60 dark:bg-[#0C0C0E] border-b border-slate-200/80 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider mb-2">
            Fieldwork & School Practicum
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
            Teaching Practice at Bar Ogwal Primary
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg leading-relaxed">
            Hands-on instructional leadership, Competency-Based Curriculum (CBC) delivery, and school environmental sanitation at Bar Ogwal Primary and Junior School.
          </p>
        </div>

        {/* Practicum Overview Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-sm mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* School Details (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-semibold bg-[#F5EEF7] dark:bg-[#241323] text-[#7A1C6D] dark:text-[#D8A0D0]">
                <span>Official Practicum School</span>
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white">
                {teachingPractice.institutionName}
              </h3>
              
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#7A1C6D] dark:text-[#D8A0D0]" />
                  {teachingPractice.location}
                </span>
                <span className="text-slate-300 dark:text-zinc-700">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#7A1C6D] dark:text-[#D8A0D0]" />
                  {teachingPractice.period}
                </span>
                <span className="text-slate-300 dark:text-zinc-700">•</span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#7A1C6D] dark:text-[#D8A0D0]" />
                  {teachingPractice.duration}
                </span>
              </div>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                {teachingPractice.summary}
              </p>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                  Institutional Background
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {teachingPractice.briefHistory}
                </p>
              </div>
            </div>

            {/* Performance Badge (4 cols) */}
            <div className="lg:col-span-4 bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-4">
              <span className="text-xs font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider block">
                Official Practicum Rating
              </span>
              
              <div>
                <div className="text-3xl sm:text-4xl font-serif font-bold text-[#7A1C6D] dark:text-[#D8A0D0]">
                  {teachingPractice.supervisorFeedback.rating}
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
                  Evaluated by: {teachingPractice.supervisorFeedback.evaluator}
                </p>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 italic border-l-2 border-[#7A1C6D] pl-3 py-1">
                "{teachingPractice.supervisorFeedback.remarks}"
              </p>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-700 text-xs text-slate-500 dark:text-slate-400">
                Maseno University Department of Educational Psychology & ECDE standards.
              </div>
            </div>

          </div>
        </div>

        {/* Tab Navigation for Detailed Sections */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-150 ${
              activeTab === 'overview'
                ? 'bg-[#7A1C6D] text-white shadow-sm'
                : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700'
            }`}
          >
            Core Responsibilities
          </button>
          <button
            onClick={() => setActiveTab('sanitation')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-150 ${
              activeTab === 'sanitation'
                ? 'bg-[#7A1C6D] text-white shadow-sm'
                : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700'
            }`}
          >
            Sanitation & Hygiene Campaign
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-150 ${
              activeTab === 'lessons'
                ? 'bg-[#7A1C6D] text-white shadow-sm'
                : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700'
            }`}
          >
            Lessons Taught & Outcomes
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-150 ${
              activeTab === 'feedback'
                ? 'bg-[#7A1C6D] text-white shadow-sm'
                : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700'
            }`}
          >
            Community & Parent Engagement
          </button>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'overview' && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <h4 className="text-lg font-serif font-bold text-slate-900 dark:text-white mb-4">
              Practicum Responsibilities & Instructional Activities
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teachingPractice.activitiesPerformed.map((activity, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#7A1C6D] dark:text-[#D8A0D0] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sanitation' && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-semibold bg-[#F5EEF7] dark:bg-[#241323] text-[#7A1C6D] dark:text-[#D8A0D0] mb-2">
                <Droplets className="w-3.5 h-3.5" />
                <span>Environmental Sanitation Project</span>
              </div>
              <h4 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                {teachingPractice.sanitationWork.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {teachingPractice.sanitationWork.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {teachingPractice.sanitationWork.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#7A1C6D] dark:text-[#D8A0D0] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-snug">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachingPractice.lessonsTaught.map((lesson, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#F5EEF7] dark:bg-[#241323] text-[#7A1C6D] dark:text-[#D8A0D0]">
                      {lesson.level}
                    </span>
                    <h5 className="font-serif font-bold text-base text-slate-900 dark:text-white mt-3 mb-2">
                      {lesson.subject}
                    </h5>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {lesson.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                      Learner Outcomes:
                    </span>
                    <div className="space-y-1.5">
                      {lesson.keyLearnings.map((k, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#7A1C6D] dark:text-[#D8A0D0] shrink-0 mt-0.5" />
                          <span>{k}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <h4 className="text-lg font-serif font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#7A1C6D] dark:text-[#D8A0D0]" />
              <span>Community & Parental Engagement Initiatives</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teachingPractice.communityEngagement.map((comm, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#7A1C6D] dark:text-[#D8A0D0] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {comm}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

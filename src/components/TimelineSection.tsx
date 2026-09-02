import React from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Calendar, 
  Building2, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { TimelineItem } from '../types';

interface TimelineSectionProps {
  timeline: TimelineItem[];
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({ timeline }) => {
  return (
    <section id="timeline" className="py-24 sm:py-28 bg-white dark:bg-[#0F0F12] border-b border-slate-200/80 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider mb-2">
            Chronological Milestones
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
            Academic & Professional Journey
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg leading-relaxed">
            Key steps from primary education through university matriculation and field teaching practice.
          </p>
        </div>

        {/* Timeline List */}
        <div className="max-w-4xl mx-auto">
          <div className="relative pl-6 sm:pl-8 border-l border-slate-200 dark:border-zinc-800 space-y-10">
            {timeline.map((event) => (
              <div key={event.id} className="relative group">
                
                {/* Minimal Timeline Marker Dot */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-[#0F0F12] border-2 border-[#7A1C6D] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7A1C6D]" />
                </div>

                {/* Event Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider">
                      {event.year}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {event.institutionOrPlace || (event as any).institution}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white mb-2">
                    {event.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    {event.description}
                  </p>

                  {(event as any).highlights && (event as any).highlights.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap gap-2">
                      {(event as any).highlights.map((hl: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[#7A1C6D] dark:text-[#D8A0D0]" />
                          {hl}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

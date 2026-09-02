import React, { useState } from 'react';
import { 
  Quote, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  CheckCircle2 
} from 'lucide-react';
import { Testimonial } from '../types';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const current = testimonials[currentIndex] || testimonials[0];

  return (
    <section id="testimonials" className="py-24 sm:py-28 bg-slate-50/60 dark:bg-[#0C0C0E] border-b border-slate-200/80 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider mb-2">
            Professional Endorsements
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
            Academic & Practicum Feedback
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg leading-relaxed">
            Evaluations from head teachers, university mentors, and fellow educators during field attachments in Kisumu County.
          </p>
        </div>

        {/* Featured Testimonial Card */}
        {current && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 sm:p-12 border border-slate-200 dark:border-zinc-800 shadow-sm mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <blockquote className="text-lg sm:text-xl font-serif text-slate-800 dark:text-slate-200 leading-relaxed italic">
                  "{current.content}"
                </blockquote>

                <div>
                  <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    {current.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#7A1C6D] dark:text-[#D8A0D0] font-medium">
                    {current.role}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {current.organization} • {current.relationship}
                  </p>
                </div>
              </div>

              {/* Navigation Controls (4 cols) */}
              <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={prev}
                    aria-label="Previous Testimonial"
                    className="p-3 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 px-2">
                    {currentIndex + 1} / {testimonials.length}
                  </span>
                  <button
                    onClick={next}
                    aria-label="Next Testimonial"
                    className="p-3 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Verified Institutional Evaluation
                </span>
              </div>

            </div>
          </div>
        )}

        {/* All Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setCurrentIndex(idx)}
              className={`cursor-pointer p-6 rounded-xl border transition-colors duration-150 flex flex-col justify-between ${
                currentIndex === idx
                  ? 'bg-white dark:bg-zinc-900 border-[#7A1C6D] dark:border-[#7A1C6D] shadow-sm'
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-4 leading-relaxed mb-4">
                  "{item.content}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
                <h5 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                  {item.name}
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {item.role}, {item.organization}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

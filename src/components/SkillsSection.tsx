import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Award, 
  BookOpen, 
  HeartHandshake, 
  Droplets, 
  FolderCheck 
} from 'lucide-react';
import { Skill } from '../types';

interface SkillsSectionProps {
  skills: Skill[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Pedagogy',
    'Child Development',
    'Administration',
    'Community',
    'Hygiene'
  ];

  const filteredSkills = selectedCategory === 'All'
    ? skills
    : skills.filter(s => s.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <section id="skills" className="py-24 sm:py-28 bg-white dark:bg-[#0F0F12] border-b border-slate-200/80 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <p className="text-xs font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider mb-2">
            Pedagogical & Technical Competencies
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
            Professional Skill Matrix
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg leading-relaxed">
            Evaluated competencies across Competency-Based Curriculum (CBC) delivery, child psychology, classroom leadership, and community sanitation.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 ${
                selectedCategory === cat
                  ? 'bg-[#7A1C6D] text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#F5EEF7] dark:bg-[#241323] text-[#7A1C6D] dark:text-[#D8A0D0]">
                    {skill.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    {skill.proficiency}%
                  </span>
                </div>

                <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white mb-2">
                  {skill.name}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {skill.description}
                </p>
              </div>

              {/* Progress Bar (Single solid primary color, no gradient) */}
              <div className="pt-2">
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-[#7A1C6D] rounded-full transition-all duration-300"
                    style={{ width: `${skill.proficiency}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

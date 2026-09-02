import React, { useState } from 'react';
import { Search, X, BookOpen, Layers, Award, ArrowRight } from 'lucide-react';
import { PortfolioData, BlogPost, GalleryItem } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PortfolioData;
  onSelectPost: (post: BlogPost) => void;
  onSelectGallery: (item: GalleryItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  data,
  onSelectPost,
  onSelectGallery,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const matchingPosts = cleanQuery
    ? data.blog.filter(
        (p) =>
          p.title.toLowerCase().includes(cleanQuery) ||
          p.summary.toLowerCase().includes(cleanQuery) ||
          p.tags.some((t) => t.toLowerCase().includes(cleanQuery))
      )
    : [];

  const matchingGallery = cleanQuery
    ? data.gallery.filter(
        (g) =>
          g.title.toLowerCase().includes(cleanQuery) ||
          g.description.toLowerCase().includes(cleanQuery) ||
          g.category.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingSkills = cleanQuery
    ? data.skills.filter(
        (s) =>
          s.name.toLowerCase().includes(cleanQuery) ||
          s.description.toLowerCase().includes(cleanQuery)
      )
    : [];

  const totalResults = matchingPosts.length + matchingGallery.length + matchingSkills.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#18181B] rounded-xl max-w-2xl w-full border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#7A1C6D] dark:text-[#D8A0D0]" />
          <input
            type="text"
            autoFocus
            placeholder="Search reflections, skills, teaching practice, gallery..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm sm:text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-md"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-6">
          {!cleanQuery ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <p>Type keywords such as "sanitation", "mathematics", "Bar Ogwal", "hygiene", or "CBC".</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <p>No results found for "{query}".</p>
            </div>
          ) : (
            <>
              {/* Blog Posts */}
              {matchingPosts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Reflections & Articles ({matchingPosts.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {matchingPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => {
                          onClose();
                          onSelectPost(post);
                        }}
                        className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/60 hover:bg-[#F5EEF7] dark:hover:bg-[#241323] cursor-pointer transition-colors flex items-center justify-between border border-slate-100 dark:border-zinc-700/60"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                            {post.title}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {post.summary}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#7A1C6D] dark:text-[#D8A0D0] shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery Items */}
              {matchingGallery.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Gallery & Media ({matchingGallery.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {matchingGallery.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onClose();
                          onSelectGallery(item);
                        }}
                        className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/60 hover:bg-[#F5EEF7] dark:hover:bg-[#241323] cursor-pointer transition-colors flex items-center justify-between border border-slate-100 dark:border-zinc-700/60"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.url || (item as any).imageUrl}
                            alt={item.title}
                            className="w-10 h-10 rounded-lg object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {item.category} • {item.album}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#7A1C6D] dark:text-[#D8A0D0] shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {matchingSkills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>Skills ({matchingSkills.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {matchingSkills.map((skill) => (
                      <div
                        key={skill.id}
                        className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700/60 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {skill.name} ({skill.proficiency}%)
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {skill.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 px-6 bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 text-right">
          <span className="text-[11px] text-slate-400">Press ESC or click outside to dismiss</span>
        </div>
      </div>
    </div>
  );
};

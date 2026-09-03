import React from 'react';
import { X, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { BlogPost } from '../types';
import { SafeImage } from './SafeImage';

interface BlogModalProps {
  post: BlogPost | null;
  onClose: () => void;
}

export const BlogModal: React.FC<BlogModalProps> = ({ post, onClose }) => {
  if (!post) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-[#18181B] rounded-xl max-w-3xl w-full my-8 border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Reflections</span>
          </button>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Post Image Header (if exists) */}
        {post.imageUrl && (
          <div className="w-full h-64 sm:h-80 overflow-hidden bg-slate-100 dark:bg-zinc-800">
            <SafeImage
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Post Body Container */}
        <div className="p-6 sm:p-10 space-y-6">
          
          {/* Metadata */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#F5EEF7] dark:bg-[#241323] text-[#7A1C6D] dark:text-[#D8A0D0]">
                {post.category}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {post.date}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-slate-900 dark:text-white leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-[#7A1C6D] text-white flex items-center justify-center font-bold font-serif text-xs">
                JO
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">{post.author}</span>
                <span className="text-slate-500 dark:text-slate-400">Maseno University • B.Ed (ECDE)</span>
              </div>
            </div>
          </div>

          {/* Formatted Content */}
          <div className="max-w-none text-slate-700 dark:text-slate-300 leading-relaxed space-y-4 text-sm sm:text-base border-t border-slate-100 dark:border-zinc-800 pt-6">
            {post.content.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-xl font-serif font-bold text-slate-900 dark:text-white pt-2">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('#### ')) {
                return (
                  <h4 key={idx} className="text-lg font-serif font-bold text-[#7A1C6D] dark:text-[#D8A0D0] pt-1">
                    {paragraph.replace('#### ', '')}
                  </h4>
                );
              }
              if (paragraph.startsWith('*') && paragraph.endsWith('*')) {
                return (
                  <p key={idx} className="italic text-slate-600 dark:text-slate-400 border-l-2 border-[#7A1C6D] pl-3 py-1 bg-slate-50 dark:bg-zinc-800/60 rounded-r-lg">
                    {paragraph.replace(/\*/g, '')}
                  </p>
                );
              }
              return (
                <p key={idx} className="leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Tags */}
          <div className="pt-6 border-t border-slate-100 dark:border-zinc-800">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Topic Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

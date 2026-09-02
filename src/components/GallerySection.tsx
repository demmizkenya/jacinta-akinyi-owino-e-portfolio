import React, { useState } from 'react';
import { 
  Eye, 
  Play, 
  Calendar, 
  FolderCheck,
  Maximize2
} from 'lucide-react';
import { GalleryItem } from '../types';

interface GallerySectionProps {
  gallery: GalleryItem[];
  onOpenLightbox: (item: GalleryItem) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  gallery,
  onOpenLightbox,
}) => {
  const [selectedAlbum, setSelectedAlbum] = useState<string>('All');

  const categories = [
    'All',
    'Teaching Practice',
    'Classroom',
    'Sanitation & Hygiene',
    'Maseno Campus',
    'Certificates'
  ];

  const filteredItems = selectedAlbum === 'All'
    ? gallery
    : gallery.filter(item => item.category.toLowerCase() === selectedAlbum.toLowerCase());

  return (
    <section id="gallery" className="py-24 sm:py-28 bg-slate-50/60 dark:bg-[#0C0C0E] border-b border-slate-200/80 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <p className="text-xs font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider mb-2">
            Visual Documentation & Field Evidence
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
            Practicum & Academic Gallery
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg leading-relaxed">
            Photographic and video records of classroom teaching, low-cost manipulative workshops, student hygiene drills, and Maseno University events.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedAlbum(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 ${
                selectedAlbum === cat
                  ? 'bg-[#7A1C6D] text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const mediaUrl = item.url || (item as any).imageUrl;
            const isVideo = item.type === 'video';

            return (
              <div
                key={item.id}
                onClick={() => onOpenLightbox(item)}
                className="group bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer transition-colors duration-150 flex flex-col"
              >
                {/* Media Container */}
                <div className="relative aspect-[4/3] bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <img
                    src={mediaUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />

                  {isVideo && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/70 text-white text-[10px] font-semibold flex items-center gap-1">
                      <Play className="w-3 h-3 fill-current" />
                      <span>Video</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-2.5 rounded-lg bg-white/90 text-slate-900 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      <Maximize2 className="w-4 h-4" />
                      <span>View Full Image</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.date}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white mb-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Album: {item.album}</span>
                    <span className="text-[#7A1C6D] dark:text-[#D8A0D0] font-medium inline-flex items-center gap-1">
                      Inspect
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

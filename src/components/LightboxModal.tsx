import React from 'react';
import { X, Calendar, Layers, ExternalLink, Play } from 'lucide-react';
import { GalleryItem } from '../types';
import { SafeImage } from './SafeImage';

interface LightboxModalProps {
  item: GalleryItem | null;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const isVideo = item.type === 'video';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-[#1A0C24] rounded-3xl max-w-4xl w-full overflow-hidden border border-[#C8A2C8]/30 shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#2D153B]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F4ECF6] dark:bg-[#32173F] text-[#8A0F7D] dark:text-[#C8A2C8]">
              {item.category}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Album: {item.album}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#2C1438] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Player / Image */}
        <div className="flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] max-h-[58vh]">
          {isVideo ? (
            <video
              src={item.url}
              controls
              autoPlay
              className="max-h-full max-w-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <SafeImage
              src={item.url}
              alt={item.title}
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>

        {/* Metadata description bar */}
        <div className="p-6 bg-white dark:bg-[#1A0C24] space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
              {item.title}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {item.date}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {item.description}
          </p>
        </div>

      </div>
    </div>
  );
};

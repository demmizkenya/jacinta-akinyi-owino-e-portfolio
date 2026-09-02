import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  X
} from 'lucide-react';
import { DocumentItem } from '../types';

interface DocumentsSectionProps {
  documents: DocumentItem[];
  onOpenCV?: () => void;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  documents,
  onOpenCV,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Documents' },
    { id: 'curriculum', label: 'CV & Curriculum' },
    { id: 'attachment log', label: 'Practicum & Logs' },
    { id: 'lesson plan', label: 'Schemes & Lesson Plans' },
    { id: 'sanitation plan', label: 'WASH & Hygiene Reports' },
  ];

  const filteredDocs = activeCategory === 'all'
    ? documents
    : documents.filter(d => d.category.toLowerCase().includes(activeCategory.toLowerCase()));

  const handleDownload = (doc: DocumentItem) => {
    const fileUrl = doc.downloadUrl || (doc as any).fileUrl || '';
    if (fileUrl.startsWith('#cv') && onOpenCV) {
      onOpenCV();
      return;
    }
    const element = document.createElement('a');
    const file = new Blob([`${doc.title}\n\nCandidate: Jacinta Akinyi Owino\nMaseno University - Bachelor of Education (ECDE)\n\n${doc.description}\n\nCategory: ${doc.category}\nDate: ${doc.uploadDate || (doc as any).dateUploaded || '2024'}\nStatus: Verified Academic Document`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <section id="documents" className="py-24 sm:py-28 bg-slate-50/60 dark:bg-[#0C0C0E] border-b border-slate-200/80 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <p className="text-xs font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider mb-2">
            Academic Repository & Documentation
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
            Academic Documents & Practicum Files
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg leading-relaxed">
            Downloadable curriculum vitae, teaching practice logbooks, verified schemes of work, and water sanitation project reports.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 ${
                activeCategory === cat.id
                  ? 'bg-[#7A1C6D] text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F5EEF7] dark:bg-[#241323] text-[#7A1C6D] dark:text-[#D8A0D0] flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    {doc.fileSize} • PDF
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider block mb-1">
                  {doc.category}
                </span>

                <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white mb-2 leading-snug">
                  {doc.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {doc.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={() => handleDownload(doc)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7A1C6D] hover:bg-[#66155B] text-white text-xs font-medium transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Preview Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F5EEF7] dark:bg-[#241323] text-[#7A1C6D] dark:text-[#D8A0D0] flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider">
                      {selectedDoc.category}
                    </span>
                    <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                      Document Details
                    </h4>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-5 space-y-4">
                <div>
                  <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                    {selectedDoc.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>Uploaded: {selectedDoc.uploadDate || (selectedDoc as any).dateUploaded || '2024'}</span>
                    <span>•</span>
                    <span>Format: PDF</span>
                    <span>•</span>
                    <span>Size: {selectedDoc.fileSize}</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-zinc-800/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200/80 dark:border-zinc-700/60">
                  {selectedDoc.description}
                </div>

                <div className="p-3 rounded-lg bg-[#F5EEF7] dark:bg-[#241323] border border-slate-200/60 dark:border-zinc-700/40 text-xs text-[#7A1C6D] dark:text-[#D8A0D0]">
                  Official Academic Document • Maseno University School of Education
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200 font-medium text-xs hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDownload(selectedDoc);
                    setSelectedDoc(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#7A1C6D] hover:bg-[#66155B] text-white font-medium text-xs transition-colors"
                >
                  Download File
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

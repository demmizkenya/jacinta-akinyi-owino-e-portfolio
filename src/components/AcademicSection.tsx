import React, { useState } from 'react';
import { 
  GraduationCap, 
  Award, 
  FileCheck2, 
  Download, 
  BookOpen, 
  Calendar, 
  Building2,
  X
} from 'lucide-react';
import { AcademicInfo, AcademicCertificate } from '../types';

interface AcademicSectionProps {
  academic: AcademicInfo;
  onOpenCV?: () => void;
}

export const AcademicSection: React.FC<AcademicSectionProps> = ({
  academic,
  onOpenCV,
}) => {
  const [selectedCert, setSelectedCert] = useState<AcademicCertificate | null>(null);

  return (
    <section id="academics" className="py-24 sm:py-28 bg-white dark:bg-[#0F0F12] border-b border-slate-200/80 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider mb-2">
            Academic Credentials & Accreditations
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
            Academic Information
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg leading-relaxed">
            Institutional credentials, recognized coursework, and pedagogical certifications from Maseno University's School of Education.
          </p>
        </div>

        {/* Institutional Identity Card */}
        <div className="bg-slate-50/70 dark:bg-zinc-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-sm mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            <div className="md:col-span-2 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>Premier Public University in Kenya</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white">
                {academic.institution}
              </h3>
              <p className="text-base font-medium text-slate-800 dark:text-slate-200">
                {academic.course}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {academic.department}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-mono text-xs text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 font-sans">Official Admission No:</span>
                <span className="font-bold text-[#7A1C6D] dark:text-[#D8A0D0]">{academic.admissionNumber}</span>
              </div>
            </div>

            {/* Action Column */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 justify-center">
              {onOpenCV && (
                <button
                  id="academic-download-cv-btn"
                  onClick={onOpenCV}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#7A1C6D] hover:bg-[#66155B] text-white font-medium text-sm shadow-sm transition-colors duration-150"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Curriculum Vitae</span>
                </button>
              )}
              <a
                href="#teaching-practice"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 font-medium text-sm transition-colors duration-150 text-center"
              >
                <span>View Attachment Logbook</span>
              </a>
            </div>

          </div>
        </div>

        {/* Academic Achievements Section */}
        <div className="mb-16">
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2.5">
            <Award className="w-5 h-5 text-[#7A1C6D] dark:text-[#D8A0D0]" />
            <span>Academic Achievements & Honors</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {academic.achievements.map((ach) => (
              <div
                key={ach.id}
                className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#F5EEF7] dark:bg-[#241323] text-[#7A1C6D] dark:text-[#D8A0D0]">
                      {ach.year}
                    </span>
                    <Award className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="font-serif font-bold text-lg text-slate-900 dark:text-white mb-1.5">
                    {ach.title}
                  </h4>
                  <p className="text-xs font-medium text-[#7A1C6D] dark:text-[#D8A0D0] mb-3">
                    {ach.issuer}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Professional Certifications Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <FileCheck2 className="w-5 h-5 text-[#7A1C6D] dark:text-[#D8A0D0]" />
              <span>Certificates & Pedagogical Accreditations</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-0">
              Verified credentials from recognized Kenyan education authorities
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {academic.certificates.map((cert) => (
              <div
                key={cert.id}
                onClick={() => setSelectedCert(cert)}
                className="cursor-pointer bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-[#7A1C6D] dark:hover:border-[#7A1C6D] shadow-sm transition-colors duration-150 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#F5EEF7] dark:bg-[#241323] text-[#7A1C6D] dark:text-[#D8A0D0] flex items-center justify-center mb-3">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider block mb-1">
                    {cert.category}
                  </span>
                  <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white mb-2 line-clamp-2">
                    {cert.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    Issued by: <span className="font-medium text-slate-700 dark:text-slate-300">{cert.issuer}</span>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                    {cert.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {cert.date}
                  </span>
                  <span className="text-[#7A1C6D] dark:text-[#D8A0D0] font-semibold">
                    View Details
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificate Detail Modal */}
        {selectedCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F5EEF7] dark:bg-[#241323] text-[#7A1C6D] dark:text-[#D8A0D0] flex items-center justify-center">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider">
                      {selectedCert.category}
                    </span>
                    <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                      Verified Certificate
                    </h4>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-5 space-y-4">
                <div>
                  <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                    {selectedCert.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                    Issuing Body: {selectedCert.issuer}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-zinc-800/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200/80 dark:border-zinc-700/60">
                  {selectedCert.description}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/40">
                    <span className="text-slate-400 block font-medium">Candidate</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Jacinta Akinyi Owino</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/40">
                    <span className="text-slate-400 block font-medium">Date Accredited</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCert.date}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  onClick={() => setSelectedCert(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200 font-medium text-xs hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
                {onOpenCV && (
                  <button
                    onClick={() => {
                      setSelectedCert(null);
                      onOpenCV();
                    }}
                    className="px-4 py-2 rounded-lg bg-[#7A1C6D] hover:bg-[#66155B] text-white font-medium text-xs transition-colors"
                  >
                    View Academic CV
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  CheckCircle,
  Building2,
  Calendar
} from 'lucide-react';
import { PortfolioData } from '../types';

interface CVModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PortfolioData;
}

export const CVModal: React.FC<CVModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const { profile, academic, teachingPractice, skills } = data;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-[#18181B] rounded-xl max-w-4xl w-full my-6 border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7A1C6D]" />
            <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Official Curriculum Vitae • Jacinta Akinyi Owino
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#7A1C6D] hover:bg-[#66155B] text-white text-xs font-medium shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable CV Content */}
        <div id="printable-cv" className="overflow-y-auto p-6 sm:p-12 bg-white text-slate-900 space-y-8 font-sans">
          
          {/* Header */}
          <div className="border-b-2 border-[#8A0F7D] pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#8A0F7D] uppercase tracking-wide">
                {profile.name}
              </h1>
              <p className="text-sm font-semibold text-slate-700 mt-1">
                {profile.title}
              </p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Maseno University Student Reg / Admission No: {profile.admissionNumber}
              </p>
            </div>

            <div className="text-xs text-slate-600 space-y-1 text-left sm:text-right">
              <p className="flex sm:justify-end items-center gap-1">
                <span>{profile.email}</span>
                <Mail className="w-3 h-3 text-[#8A0F7D]" />
              </p>
              <p className="flex sm:justify-end items-center gap-1">
                <span>{profile.phone}</span>
                <Phone className="w-3 h-3 text-[#8A0F7D]" />
              </p>
              <p className="flex sm:justify-end items-center gap-1">
                <span>{profile.location}</span>
                <MapPin className="w-3 h-3 text-[#8A0F7D]" />
              </p>
            </div>
          </div>

          {/* Professional Profile Statement */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8A0F7D] border-b border-slate-200 pb-1 mb-2">
              Professional Profile & Career Objective
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed">
              {profile.careerObjective}
            </p>
          </div>

          {/* Educational Background */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8A0F7D] border-b border-slate-200 pb-1 mb-3">
              Education & Academic Qualifications
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {academic.institution} – School of Education
                  </h3>
                  <p className="text-slate-700 font-medium">{academic.course}</p>
                  <p className="text-slate-500 mt-0.5">Admission Number: {academic.admissionNumber}</p>
                </div>
                <div className="text-right text-slate-500 font-medium">
                  {profile.yearsOfStudy} (Expected Dec 2025)
                </div>
              </div>

              {/* Core Units Highlights */}
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-[11px] text-slate-700 uppercase block mb-1">
                  Selected Course Units:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600">
                  {academic.coreUnits.map((unit, i) => (
                    <span key={i}>• {unit}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Teaching Practice / Attachment Experience */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8A0F7D] border-b border-slate-200 pb-1 mb-3">
              Teaching Practice & Field Experience
            </h2>

            <div className="text-xs space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {teachingPractice.institutionName}
                  </h3>
                  <p className="text-slate-700 font-medium">
                    Practicum Teacher (PP2 & Grade 1 CBC Implementation) • {teachingPractice.location}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#8A0F7D] block">{teachingPractice.supervisorFeedback.rating}</span>
                  <span className="text-slate-500">{teachingPractice.period}</span>
                </div>
              </div>

              <p className="text-slate-700 leading-relaxed">
                {teachingPractice.summary}
              </p>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Core Responsibilities & Achievements:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {teachingPractice.activitiesPerformed.slice(0, 4).map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <span className="font-bold text-[#8A0F7D] block mb-1">
                  Environmental Hygiene Leadership:
                </span>
                <p className="text-slate-700">
                  Installed 4 tippy-tap handwashing stations, trained pupils in 7-step WHO handwashing drills, and led campus sanitation squads.
                </p>
              </div>
            </div>
          </div>

          {/* Key Competencies & Skills */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A1C6D] border-b border-slate-200 pb-1 mb-2">
              Key Pedagogical & Professional Competencies
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between pr-4">
                  <span>• {skill.name}</span>
                  <span className="font-semibold text-slate-500">{skill.level}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications & Accreditations */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8A0F7D] border-b border-slate-200 pb-1 mb-2">
              Certificates & Continuous Professional Development
            </h2>
            <div className="space-y-2 text-xs">
              {academic.certificates.map((cert) => (
                <div key={cert.id} className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-900">{cert.title}</span>
                    <span className="text-slate-500 block">{cert.issuer}</span>
                  </div>
                  <span className="text-slate-500">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Referees */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8A0F7D] border-b border-slate-200 pb-1 mb-3">
              Academic & Professional Referees
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700">
              <div className="p-3 border border-slate-200 rounded-xl">
                <p className="font-bold text-slate-900">Mr. Silas Odhiambo</p>
                <p className="text-slate-600">Head Teacher</p>
                <p className="text-slate-500">Bar Ogwal Primary and Junior School</p>
                <p className="text-slate-500 text-[11px] mt-1">East Kisumu, Kenya</p>
              </div>
              <div className="p-3 border border-slate-200 rounded-xl">
                <p className="font-bold text-slate-900">Dr. Pamela Ouma</p>
                <p className="text-slate-600">Senior Lecturer in ECDE</p>
                <p className="text-slate-500">School of Education, Maseno University</p>
                <p className="text-slate-500 text-[11px] mt-1">Kisumu, Kenya</p>
              </div>
              <div className="p-3 border border-slate-200 rounded-xl">
                <p className="font-bold text-slate-900">Mrs. Beatrice Achieng'</p>
                <p className="text-slate-600">Senior Mentor Teacher (PP2 Lead)</p>
                <p className="text-slate-500">Bar Ogwal Primary and Junior School</p>
                <p className="text-slate-500 text-[11px] mt-1">East Kisumu, Kenya</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { Profile } from '../types';

interface ContactSectionProps {
  profile: Profile;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ profile }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      setFeedbackMessage('Please fill in all required fields.');
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setFeedbackMessage(data.message || 'Message delivered successfully! Jacinta will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setFeedbackMessage(data.error || 'Failed to deliver message. Please try emailing directly.');
      }
    } catch (err) {
      setStatus('error');
      setFeedbackMessage('Network error. Please email directly to jecinterowino88@gmail.com.');
    }
  };

  return (
    <section id="contact" className="py-24 sm:py-28 bg-white dark:bg-[#0F0F12] border-b border-slate-200/80 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider mb-2">
            Professional Communication
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
            Contact Jacinta Akinyi Owino
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg leading-relaxed">
            Reach out for early childhood teaching appointments, academic consultations, or community hygiene initiatives.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Left Column: Direct Contact Details & Links (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
              <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                Contact Details
              </h3>

              <div className="space-y-4">
                
                {/* Email Item */}
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-start gap-3.5 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#F5EEF7] dark:bg-[#241323] text-[#7A1C6D] dark:text-[#D8A0D0] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Direct Email</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#7A1C6D] transition-colors">
                      {profile.email}
                    </span>
                  </div>
                </a>

                {/* Phone Item */}
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-start gap-3.5 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#F5EEF7] dark:bg-[#241323] text-[#7A1C6D] dark:text-[#D8A0D0] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Telephone / Mobile</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#7A1C6D] transition-colors">
                      {profile.phone}
                    </span>
                  </div>
                </a>

                {/* Location Item */}
                <div className="flex items-start gap-3.5 p-3 rounded-lg">
                  <div className="w-9 h-9 rounded-lg bg-[#F5EEF7] dark:bg-[#241323] text-[#7A1C6D] dark:text-[#D8A0D0] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Institutional Base</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                      Maseno University School of Education
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      East Kisumu & Maseno Campus, Kisumu County, Kenya
                    </span>
                  </div>
                </div>

              </div>

              {/* Social Media Links */}
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-3">
                  Professional Networks
                </span>
                <div className="flex flex-wrap gap-2">
                  {profile.socialLinks.whatsapp && (
                    <a
                      href={profile.socialLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      WhatsApp Chat
                    </a>
                  )}
                  {profile.socialLinks.linkedin && (
                    <a
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      LinkedIn Profile
                    </a>
                  )}
                  {profile.socialLinks.researchgate && (
                    <a
                      href={profile.socialLinks.researchgate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      ResearchGate
                    </a>
                  )}
                </div>
              </div>

            </div>

            {/* Clean Institutional Notice (No gradients) */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#F5EEF7] dark:bg-[#241323] text-[#7A1C6D] dark:text-[#D8A0D0] flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-serif font-bold text-sm text-slate-900 dark:text-white">Maseno University Registry</p>
                <p className="text-slate-500 dark:text-slate-400">Department of Educational Psychology & ECDE</p>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5 font-mono">Student Reg: {profile.admissionNumber}</p>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 sm:p-10 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-1">
              Send an In-App Message
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
              Inquiries regarding primary school postings, curriculum consultations, or research collaboration.
            </p>

            {status === 'success' && (
              <div className="mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Message Delivered</p>
                  <p className="mt-0.5">{feedbackMessage}</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Notice</p>
                  <p className="mt-0.5">{feedbackMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. Odhiambo Peter"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-[#7A1C6D] focus:outline-none text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. administrator@school.ke"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-[#7A1C6D] focus:outline-none text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Subject / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. ECDE Teacher Position / Practicum Consultation"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-[#7A1C6D] focus:outline-none text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Your Message *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write your inquiry or message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-[#7A1C6D] focus:outline-none text-slate-900 dark:text-white text-sm leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#7A1C6D] hover:bg-[#66155B] text-white font-medium text-sm shadow-sm transition-colors duration-150 disabled:opacity-50"
              >
                {status === 'submitting' ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message to Jacinta</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Google Maps Integration */}
        <div className="bg-slate-50 dark:bg-zinc-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider block">
                Geographic Location
              </span>
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                Maseno University & East Kisumu, Kenya
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-0">
              Kisumu-Busia Road, Maseno / Bar Ogwal Primary, East Kisumu
            </span>
          </div>

          <div className="w-full h-72 rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700">
            <iframe
              title="Maseno University & East Kisumu Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src="https://maps.google.com/maps?q=Maseno%20University,%20Kisumu,%20Kenya&t=&z=13&ie=UTF8&iwloc=&output=embed"
              className="filter contrast-95 opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

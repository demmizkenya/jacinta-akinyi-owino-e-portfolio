import React, { useState } from 'react';
import { MessageCircle, PhoneCall } from 'lucide-react';

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  phoneNumber = '+254707076972',
  defaultMessage = 'Hello Jacinta, I visited your professional e-portfolio and would like to connect.',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Clean phone number for WhatsApp URL (digits only)
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

  return (
    <div
      id="floating-whatsapp-container"
      className="fixed bottom-6 left-6 z-40 flex items-center group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Pulse Rings */}
      <span className="absolute -inset-1.5 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" />
      <span className="absolute -inset-2.5 rounded-full bg-[#25D366]/20 animate-pulse pointer-events-none" />

      {/* Main Floating Button */}
      <a
        id="floating-whatsapp-btn"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Jacinta on WhatsApp (+254 707 076972)"
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      >
        {/* WhatsApp Chat Icon */}
        <MessageCircle className="w-7 h-7 fill-white/20 stroke-white stroke-[2.2]" />

        {/* Online Indicator Dot */}
        <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-300 border-2 border-white rounded-full shadow-sm" />
      </a>

      {/* Floating Tooltip / Label */}
      <div
        className={`ml-3 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 dark:bg-zinc-900/95 text-white backdrop-blur-md shadow-xl border border-white/10 text-xs font-medium pointer-events-none transition-all duration-300 ${
          isHovered
            ? 'opacity-100 translate-x-0 scale-100'
            : 'opacity-0 -translate-x-2 scale-95'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
        <span className="whitespace-nowrap">
          Chat on WhatsApp <span className="text-emerald-400 font-mono font-semibold">+254 707 076972</span>
        </span>
      </div>
    </div>
  );
};

import React from 'react';

interface OnboardingIllustrationProps {
  type: 'welcome' | 'success' | 'avatar-placeholder';
}

export const OnboardingIllustration: React.FC<OnboardingIllustrationProps> = ({ type }) => {
  if (type === 'welcome') {
    return (
      <div className="w-full h-40 flex items-center justify-center py-2 relative overflow-hidden">
        {/* Decorative background grid/dots */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <svg
          viewBox="0 0 200 130"
          className="w-full h-full max-w-[220px] transition-transform duration-700 hover:scale-[1.03]"
          aria-hidden="true"
        >
          {/* Floor and plant backdrop */}
          <ellipse cx="100" cy="118" rx="80" ry="10" fill="#f1f5f9" />
          
          {/* Subtle leaves in back */}
          <path d="M40 115 C20 100 25 75 45 80 C40 90 42 105 40 115 Z" fill="#bfdbfe" opacity="0.6" />
          <path d="M160 115 C180 100 175 75 155 80 C160 90 158 105 160 115 Z" fill="#bfdbfe" opacity="0.6" />
          
          {/* Ground shadows for characters */}
          <ellipse cx="90" cy="115" rx="14" ry="4" fill="#cbd5e1" opacity="0.5" />
          
          {/* Main welcoming character (EVE style female as in image) */}
          {/* Legs */}
          <path d="M86 95 L86 115" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />
          <path d="M94 95 L94 115" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />
          <path d="M84 115 L88 115" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />
          <path d="M92 115 L96 115" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />
          
          {/* Body/Torso */}
          <path d="M80 65 L100 65 L96 95 L84 95 Z" fill="#2563eb" />
          
          {/* Head & Neck */}
          <rect x="88" y="52" width="4" height="13" fill="#fbcfe8" rx="2" />
          <circle cx="90" cy="46" r="10" fill="#fbcfe8" />
          
          {/* Hair (Sleek dark blue hair, matching image) */}
          <path d="M80 43 C80 32 100 32 100 43 C101 49 98 56 97 59 C93 59 91 52 90 52 C89 52 87 59 83 59 C82 56 79 49 80 43 Z" fill="#1e1b4b" />
          
          {/* Left Arm (Resting) */}
          <path d="M80 65 Q74 76 81 83" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
          
          {/* Right Arm (Waving elegantly!) */}
          {/* Connecting point: shoulder 100,65. Elongating to a welcoming wave */}
          <path d="M100 65 Q115 50 112 36" fill="none" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" />
          {/* Wave hand */}
          <circle cx="112" cy="35" r="3.5" fill="#fbcfe8" />
          
          {/* Little "Hello!" speech bubble above */}
          <rect x="108" y="5" width="42" height="18" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" rx="8" />
          <polygon points="120,23 125,23 122,28" fill="#ffffff" stroke="#2563eb" strokeWidth="1" />
          {/* Small bridge on bubble wedge cover */}
          <line x1="120.5" y1="22.5" x2="124.5" y2="22.5" stroke="#ffffff" strokeWidth="2.5" />
          <text x="114" y="17" fill="#1e3a8a" fontFamily="sans-serif" fontSize="8" fontWeight="bold">Hello!</text>
          
          {/* Animated vibe sparks */}
          <path d="M68 40 L64 36" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M124 55 L129 57" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="68" cy="50" r="1.5" fill="#38bdf8" />
          <circle cx="116" cy="74" r="2" fill="#38bdf8" />
        </svg>
      </div>
    );
  }

  if (type === 'success') {
    return (
      <div className="w-full h-42 flex items-center justify-center relative py-2 overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:14px_14px]" />
        
        <svg
          viewBox="0 0 200 130"
          className="w-full h-full max-w-[220px]"
          aria-hidden="true"
        >
          {/* Base shadow */}
          <ellipse cx="100" cy="116" rx="70" ry="12" fill="#f1f5f9" />
          <ellipse cx="100" cy="116" rx="40" ry="6" fill="#cbd5e1" opacity="0.6" />
          
          {/* Big trophy cup for completing onboarding */}
          {/* Handles */}
          <path d="M72 65 C55 65 55 90 72 90" fill="none" stroke="#f59e0b" strokeWidth="3" />
          <path d="M128 65 C145 65 145 90 128 90" fill="none" stroke="#f59e0b" strokeWidth="3" />
          
          {/* Main Gold Cup */}
          <path d="M75 50 H125 L120 95 C115 105 85 105 80 95 Z" fill="#fbbf24" />
          <ellipse cx="100" cy="50" rx="25" ry="6" fill="#f59e0b" />
          <ellipse cx="100" cy="53" rx="22" ry="4" fill="#d97706" />
          
          {/* Pedestal stem */}
          <rect x="94" y="98" width="12" height="12" fill="#d97706" />
          <polygon points="80,114 120,114 114,108 86,108" fill="#92400e" />
          <rect x="80" y="112" width="40" height="4" fill="#475569" rx="1" />
          
          {/* Big shiny star inside cup */}
          <path d="M100 60 L103 68 L111 68 L104 73 L107 81 L100 76 L93 81 L96 73 L89 68 L97 68 Z" fill="#ffffff" />
          
          {/* Star sparkle effects floating */}
          <path d="M50 30 L50 40 M45 35 L55 35" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
          </path>
          <path d="M150 40 L150 50 M145 45 L155 45" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
            <animate attributeName="opacity" values="1;0.3;1" dur="2.5s" repeatCount="indefinite" />
          </path>
          
          {/* Colorful celebration confetti */}
          <circle cx="65" cy="50" r="3" fill="#3b82f6" />
          <circle cx="135" cy="45" r="2.5" fill="#ec4899" />
          <rect x="82" y="32" width="4" height="2" fill="#10b981" transform="rotate(30, 82, 32)" />
          <rect x="115" y="35" width="5" height="2" fill="#8b5cf6" transform="rotate(-15, 115, 35)" />
        </svg>
      </div>
    );
  }

  // Fallback / Avatar rendering placeholder
  return (
    <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 rounded-full flex items-center justify-center text-indigo-500 font-bold">
      EVE
    </div>
  );
};

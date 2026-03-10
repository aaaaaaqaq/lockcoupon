'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
}

export default function Toast({ message, visible, onClose }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onClose, 3000);
      return () => clearTimeout(t);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] animate-slide-up">
      <div className="bg-[#1a1a1a] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-[14px] font-medium">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="9" fill="#2d9e4a"/>
          <path d="M5 9l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {message}
      </div>
    </div>
  );
}

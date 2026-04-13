'use client';

import { useState } from 'react';

interface StoreLogoProps {
  logoUrl: string | null;
  logoColor: string | null;
  logoLetter: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-10 h-10 text-[16px]',
  md: 'w-12 h-12 md:w-14 md:h-14 text-[20px] md:text-[24px]',
  lg: 'w-[72px] h-[72px] text-[32px]',
};

export default function StoreLogo({ logoUrl, logoColor, logoLetter, name, size = 'md', className = '' }: StoreLogoProps) {
  const [primaryError, setPrimaryError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  const sizeClass = sizes[size];
  const letter = logoLetter || name[0]?.toUpperCase() || '?';
  const color = logoColor || '#C0392B';

  // Try Clearbit as a fallback when the provided logoUrl fails
  const clearbitUrl = `https://logo.clearbit.com/${name.toLowerCase().replace(/\s+/g, '')}.com`;

  if (logoUrl && !primaryError) {
    return (
      <img
        src={logoUrl}
        alt={`Logo ${name}`}
        loading="lazy"
        className={`${sizeClass} rounded-xl object-contain ${className}`}
        onError={() => setPrimaryError(true)}
      />
    );
  }

  if (!fallbackError) {
    return (
      <img
        src={clearbitUrl}
        alt={`Logo ${name}`}
        loading="lazy"
        className={`${sizeClass} rounded-xl object-contain ${className}`}
        onError={() => setFallbackError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-xl flex items-center justify-center text-white font-bold shadow-sm ${className}`}
      style={{ backgroundColor: color }}
      aria-label={`Logo ${name}`}
    >
      {letter}
    </div>
  );
}

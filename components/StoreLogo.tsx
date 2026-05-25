'use client';

import { useState } from 'react';
import Image from 'next/image';

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
  const [imgError, setImgError] = useState(false);

  const sizeClass = sizes[size];
  const letter = logoLetter || name[0]?.toUpperCase() || '?';
  const color = logoColor || '#C0392B';

  // Filter out known-broken Google favicon URLs
  const isGoogleFavicon = logoUrl?.includes('google.com/s2/favicons') || logoUrl?.includes('t1.gstatic.com') || logoUrl?.includes('t2.gstatic.com');
  const effectiveUrl = (logoUrl && !isGoogleFavicon) ? logoUrl : null;

  const imgSize = size === 'sm' ? 40 : size === 'lg' ? 72 : 48;

  if (effectiveUrl && !imgError) {
    return (
      <Image
        src={effectiveUrl}
        alt={`Logo ${name}`}
        width={imgSize}
        height={imgSize}
        className={`${sizeClass} rounded-xl object-contain ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-xl flex items-center justify-center text-white font-bold shadow-sm ${className}`}
      style={{ backgroundColor: color }}
      role="img"
      aria-label={`Logo ${name}`}
    >
      {letter}
    </div>
  );
}

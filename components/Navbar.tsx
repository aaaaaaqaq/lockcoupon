'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 h-[60px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center text-[22px] font-extrabold tracking-tight">
          <span className="text-text-main">Bon</span>
          <span className="text-primary">Plan</span>
          <span className="text-text-main">.ma</span>
        </Link>

        {/* Nav Links — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] text-muted font-medium">
          <Link href="/" className="hover:text-text-main transition-colors">Accueil</Link>
          <Link href="/" className="hover:text-text-main transition-colors">Boutiques</Link>
          <Link href="/" className="hover:text-text-main transition-colors">Cashback</Link>
          <Link href="/" className="hover:text-text-main transition-colors">Bon Plans</Link>
        </nav>

        {/* CTA */}
        <button className="bg-primary hover:bg-primary-dark text-white text-[14px] font-semibold px-5 py-2 rounded-lg transition-colors">
          S&apos;inscrire
        </button>
      </div>
    </header>
  );
}

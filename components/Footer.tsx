import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-[#1a1a1a] mt-10">
      <div className="max-w-[1200px] mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <rect x="5" y="1" width="6" height="4" rx="2" stroke="white" strokeWidth="1.5" fill="none"/>
                  <rect x="3" y="5" width="10" height="10" rx="2" fill="white"/>
                  <rect x="7" y="8" width="2" height="4" rx="1" fill="#C0392B"/>
                </svg>
              </div>
              <span className="text-[18px] font-extrabold">
                <span className="text-white">lock</span>
                <span className="text-primary">coupon</span>
              </span>
            </div>
            <p className="text-white/40 text-[13px] leading-relaxed">
              Les meilleurs codes promo vérifiés pour économiser sur vos achats en ligne.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-bold text-[14px] mb-3">Navigation</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-white/50 hover:text-white text-[13px] transition-colors">Accueil</Link>
              <Link href="/" className="block text-white/50 hover:text-white text-[13px] transition-colors">Boutiques</Link>
              <Link href="/" className="block text-white/50 hover:text-white text-[13px] transition-colors">Cashback</Link>
              <Link href="/" className="block text-white/50 hover:text-white text-[13px] transition-colors">Bon Plans</Link>
            </div>
          </div>

          {/* Informations */}
          <div>
            <h3 className="text-white font-bold text-[14px] mb-3">Informations</h3>
            <div className="space-y-2">
              <Link href="/a-propos" className="block text-white/50 hover:text-white text-[13px] transition-colors">À propos</Link>
              <Link href="/contact" className="block text-white/50 hover:text-white text-[13px] transition-colors">Contact</Link>
              <Link href="/politique-de-confidentialite" className="block text-white/50 hover:text-white text-[13px] transition-colors">Politique de confidentialité</Link>
              <Link href="/conditions-utilisation" className="block text-white/50 hover:text-white text-[13px] transition-colors">Conditions d&apos;utilisation</Link>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold text-[14px] mb-3">Newsletter</h3>
            <p className="text-white/40 text-[13px] mb-3">Recevez nos bons plans chaque semaine.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 bg-white/10 border border-white/10 text-white rounded-lg px-3 py-2 text-[13px] outline-none placeholder:text-white/30 focus:border-primary"
              />
              <button className="bg-primary hover:bg-primary-dark text-white text-[12px] font-bold px-3 py-2 rounded-lg transition-colors shrink-0">
                OK
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-[12px]">
            © {new Date().getFullYear()} LockCoupon.com — Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-white/30 text-[12px]">
            <Link href="/politique-de-confidentialite" className="hover:text-white/60 transition-colors">Confidentialité</Link>
            <Link href="/conditions-utilisation" className="hover:text-white/60 transition-colors">CGU</Link>
            <Link href="/contact" className="hover:text-white/60 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

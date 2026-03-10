'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('Veuillez entrer un email valide');
      setStatus('error');
      return;
    }
    setStatus('loading');
    const { error } = await supabase.from('subscribers').insert({ email });
    if (error) {
      if (error.code === '23505') {
        setErrorMsg('Cet email est déjà inscrit !');
      } else {
        setErrorMsg('Une erreur est survenue. Réessayez.');
      }
      setStatus('error');
    } else {
      setStatus('success');
      setEmail('');
    }
  };

  return (
    <>
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center text-[22px] font-extrabold tracking-tight">
            <span className="text-text-main">Lock</span>
            <span className="text-primary">Coupon</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[15px] text-muted font-medium">
            <Link href="/" className="hover:text-text-main transition-colors">Accueil</Link>
            <Link href="/" className="hover:text-text-main transition-colors">Boutiques</Link>
            <Link href="/" className="hover:text-text-main transition-colors">Cashback</Link>
            <Link href="/" className="hover:text-text-main transition-colors">Bon Plans</Link>
          </nav>

          <button
            onClick={() => { setShowModal(true); setStatus('idle'); setErrorMsg(''); }}
            className="bg-primary hover:bg-primary-dark text-white text-[14px] font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            S&apos;inscrire
          </button>
        </div>
      </header>

      {/* Newsletter Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden animate-scale-in">
            <div className="bg-primary px-6 py-5 text-center">
              <div className="text-[28px] mb-1">📬</div>
              <h2 className="text-white text-[20px] font-bold">Restez informé !</h2>
              <p className="text-white/70 text-[14px] mt-1">Recevez les meilleurs codes promo directement dans votre boîte mail.</p>
            </div>

            <div className="p-6">
              {status === 'success' ? (
                <div className="text-center py-4">
                  <div className="text-[40px] mb-3">✅</div>
                  <h3 className="text-text-main text-[18px] font-bold mb-1">Merci !</h3>
                  <p className="text-muted text-[14px]">Vous êtes maintenant inscrit à notre newsletter.</p>
                  <button
                    onClick={() => setShowModal(false)}
                    className="mt-5 bg-primary hover:bg-primary-dark text-white font-bold text-[14px] px-6 py-2.5 rounded-lg transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-text-main text-[13px] font-semibold mb-1.5">Votre email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                      placeholder="exemple@email.com"
                      className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary transition-colors"
                    />
                    {status === 'error' && (
                      <p className="text-red-500 text-[12px] mt-1.5">{errorMsg}</p>
                    )}
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={status === 'loading'}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-[15px] py-3 rounded-lg transition-colors disabled:opacity-60"
                  >
                    {status === 'loading' ? 'Inscription...' : "S'inscrire gratuitement"}
                  </button>
                  <p className="text-muted text-[11px] text-center mt-3">Pas de spam. Désabonnement en 1 clic.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

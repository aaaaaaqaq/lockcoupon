'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .upsert({ email, subscribed_at: new Date().toISOString() }, { onConflict: 'email' });

      if (error) throw error;
      setStatus('success');
      setMessage('Merci ! Vous êtes inscrit(e).');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Une erreur est survenue. Réessayez.');
    }
  }

  return (
    <div>
      <h3 className="text-white font-bold text-[14px] mb-3">Newsletter</h3>
      <p className="text-white/40 text-[13px] mb-3">Recevez nos bons plans chaque semaine.</p>
      {status === 'success' ? (
        <p className="text-green-400 text-[13px]">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            required
            className="flex-1 bg-white/10 border border-white/10 text-white rounded-lg px-3 py-2 text-[13px] outline-none placeholder:text-white/30 focus:border-primary"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-primary hover:bg-primary-dark text-white text-[12px] font-bold px-3 py-2 rounded-lg transition-colors shrink-0 disabled:opacity-60"
          >
            {status === 'loading' ? '…' : 'OK'}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="text-red-400 text-[12px] mt-1">{message}</p>
      )}
    </div>
  );
}

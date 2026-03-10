'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Store, Coupon } from '@/lib/supabase';

const ADMIN_PASSWORD = 'lockcoupon2026';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'coupons' | 'stores' | 'subscribers'>('coupons');
  const [stores, setStores] = useState<Store[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [subscribers, setSubscribers] = useState<{ id: string; email: string; created_at: string }[]>([]);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  // Coupon form
  const [couponForm, setCouponForm] = useState({
    store_id: '', title: '', code: '', discount_value: '', discount_type: 'percent',
    type: 'code', expiry_date: '', affiliate_url: '', is_best: false, is_exclusive: false, is_verified: true,
  });

  // Store form
  const [storeForm, setStoreForm] = useState({
    name: '', slug: '', logo_color: '#C0392B', logo_letter: '', description: '',
  });

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 3000);
  };

  const loadData = useCallback(async () => {
    const { data: s } = await supabase.from('stores').select('*').order('name');
    const { data: c } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    const { data: sub } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
    if (s) setStores(s);
    if (c) setCoupons(c);
    if (sub) setSubscribers(sub);
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
    } else {
      showMsg('Mot de passe incorrect', 'error');
    }
  };

  const addStore = async () => {
    if (!storeForm.name || !storeForm.slug) {
      showMsg('Nom et slug sont requis', 'error');
      return;
    }
    const { error } = await supabase.from('stores').insert({
      name: storeForm.name,
      slug: storeForm.slug.toLowerCase().replace(/\s+/g, '-'),
      logo_color: storeForm.logo_color,
      logo_letter: storeForm.logo_letter || storeForm.name[0].toUpperCase(),
      description: storeForm.description,
    });
    if (error) {
      showMsg('Erreur: ' + error.message, 'error');
    } else {
      showMsg('Boutique ajoutée !', 'success');
      setStoreForm({ name: '', slug: '', logo_color: '#C0392B', logo_letter: '', description: '' });
      loadData();
    }
  };

  const addCoupon = async () => {
    if (!couponForm.store_id || !couponForm.title) {
      showMsg('Boutique et titre sont requis', 'error');
      return;
    }
    const { error } = await supabase.from('coupons').insert({
      store_id: couponForm.store_id,
      title: couponForm.title,
      code: couponForm.code || null,
      discount_value: couponForm.discount_value || null,
      discount_type: couponForm.discount_type,
      type: couponForm.type,
      expiry_date: couponForm.expiry_date || null,
      affiliate_url: couponForm.affiliate_url || null,
      is_best: couponForm.is_best,
      is_exclusive: couponForm.is_exclusive,
      is_verified: couponForm.is_verified,
    });
    if (error) {
      showMsg('Erreur: ' + error.message, 'error');
    } else {
      showMsg('Coupon ajouté !', 'success');
      setCouponForm({
        store_id: couponForm.store_id, title: '', code: '', discount_value: '', discount_type: 'percent',
        type: 'code', expiry_date: '', affiliate_url: '', is_best: false, is_exclusive: false, is_verified: true,
      });
      loadData();
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Supprimer ce coupon ?')) return;
    await supabase.from('coupons').delete().eq('id', id);
    showMsg('Coupon supprimé', 'success');
    loadData();
  };

  const deleteStore = async (id: string) => {
    if (!confirm('Supprimer cette boutique et tous ses coupons ?')) return;
    await supabase.from('coupons').delete().eq('store_id', id);
    await supabase.from('stores').delete().eq('id', id);
    showMsg('Boutique supprimée', 'success');
    loadData();
  };

  // ─── Login Screen ──────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-[380px] overflow-hidden">
          <div className="bg-[#1a1a1a] px-6 py-8 text-center">
            <div className="text-[28px] font-extrabold">
              <span className="text-white">Lock</span>
              <span className="text-primary">Coupon</span>
            </div>
            <p className="text-white/50 text-[14px] mt-2">Panneau d&apos;administration</p>
          </div>
          <div className="p-6">
            <label className="block text-text-main text-[13px] font-semibold mb-1.5">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Entrez le mot de passe"
              className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary mb-4"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-[15px] py-3 rounded-lg transition-colors"
            >
              Connexion
            </button>
            {msg && <p className={`text-[13px] mt-3 text-center ${msgType === 'error' ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>}
          </div>
        </div>
      </div>
    );
  }

  // ─── Admin Dashboard ───────────────────────────
  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <div className="bg-[#1a1a1a] sticky top-0 z-50">
        <div className="max-w-[1000px] mx-auto px-4 h-[56px] flex items-center justify-between">
          <div className="text-[20px] font-extrabold">
            <span className="text-white">Lock</span>
            <span className="text-primary">Coupon</span>
            <span className="text-white/40 text-[14px] ml-2 font-normal">Admin</span>
          </div>
          <button onClick={() => setAuthed(false)} className="text-white/50 hover:text-white text-[13px] transition-colors">
            Déconnexion
          </button>
        </div>
      </div>

      {/* Toast */}
      {msg && (
        <div className="fixed top-4 right-4 z-[200] animate-slide-up">
          <div className={`px-5 py-3 rounded-xl shadow-lg text-white text-[14px] font-medium ${msgType === 'error' ? 'bg-red-500' : 'bg-green-600'}`}>
            {msg}
          </div>
        </div>
      )}

      <div className="max-w-[1000px] mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'coupons' as const, label: '🏷️ Coupons', count: coupons.length },
            { key: 'stores' as const, label: '🏪 Boutiques', count: stores.length },
            { key: 'subscribers' as const, label: '📬 Abonnés', count: subscribers.length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-[14px] font-semibold transition-all ${
                tab === t.key ? 'bg-primary text-white' : 'bg-white text-muted hover:bg-gray-100'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* ─── COUPONS TAB ─────────────────────── */}
        {tab === 'coupons' && (
          <div className="space-y-6">
            {/* Add form */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-text-main text-[18px] font-bold mb-5">➕ Ajouter un coupon</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-text-main mb-1">Boutique *</label>
                  <select
                    value={couponForm.store_id}
                    onChange={(e) => setCouponForm({ ...couponForm, store_id: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-primary"
                  >
                    <option value="">Sélectionner...</option>
                    {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-text-main mb-1">Code promo</label>
                  <input
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                    placeholder="ex: SAVE20"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-semibold text-text-main mb-1">Titre *</label>
                  <input
                    value={couponForm.title}
                    onChange={(e) => setCouponForm({ ...couponForm, title: e.target.value })}
                    placeholder="ex: 30% de réduction sur tout le site"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-text-main mb-1">Valeur</label>
                  <input
                    value={couponForm.discount_value}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                    placeholder="ex: 30"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-text-main mb-1">Type de réduction</label>
                  <select
                    value={couponForm.discount_type}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-primary"
                  >
                    <option value="percent">Pourcentage (%)</option>
                    <option value="euro">Euro (€)</option>
                    <option value="free">Gratuit / Free</option>
                    <option value="cashback">Cashback</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-text-main mb-1">Catégorie</label>
                  <select
                    value={couponForm.type}
                    onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-primary"
                  >
                    <option value="code">Code Promo</option>
                    <option value="cashback">Cashback</option>
                    <option value="bon">Bon Plan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-text-main mb-1">Date d&apos;expiration</label>
                  <input
                    type="date"
                    value={couponForm.expiry_date}
                    onChange={(e) => setCouponForm({ ...couponForm, expiry_date: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-semibold text-text-main mb-1">🔗 Lien d&apos;affiliation</label>
                  <input
                    value={couponForm.affiliate_url}
                    onChange={(e) => setCouponForm({ ...couponForm, affiliate_url: e.target.value })}
                    placeholder="https://www.exemple.com/?ref=votre-id"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-primary"
                  />
                </div>
                <div className="md:col-span-2 flex flex-wrap gap-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={couponForm.is_best} onChange={(e) => setCouponForm({ ...couponForm, is_best: e.target.checked })} className="w-4 h-4 accent-primary" />
                    <span className="text-[13px] font-medium">⭐ Meilleure offre</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={couponForm.is_exclusive} onChange={(e) => setCouponForm({ ...couponForm, is_exclusive: e.target.checked })} className="w-4 h-4 accent-primary" />
                    <span className="text-[13px] font-medium">🔒 Exclusif</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={couponForm.is_verified} onChange={(e) => setCouponForm({ ...couponForm, is_verified: e.target.checked })} className="w-4 h-4 accent-primary" />
                    <span className="text-[13px] font-medium">✅ Vérifié</span>
                  </label>
                </div>
              </div>
              <button onClick={addCoupon} className="mt-5 bg-primary hover:bg-primary-dark text-white font-bold text-[14px] px-6 py-2.5 rounded-lg transition-colors">
                Ajouter le coupon
              </button>
            </div>

            {/* Coupons list */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-text-main text-[16px] font-bold">Coupons existants ({coupons.length})</h2>
              </div>
              <div className="divide-y divide-border">
                {coupons.map((c) => {
                  const store = stores.find((s) => s.id === c.store_id);
                  return (
                    <div key={c.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-primary text-[12px] font-bold">{store?.name || '?'}</span>
                          {c.is_best && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">BEST</span>}
                          {c.is_exclusive && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">EXCL</span>}
                          {c.code && <span className="text-[11px] bg-gray-100 text-muted px-2 py-0.5 rounded font-mono">{c.code}</span>}
                        </div>
                        <p className="text-text-main text-[14px] font-medium truncate">{c.title}</p>
                      </div>
                      <span className="text-primary font-bold text-[16px] shrink-0">
                        {c.discount_value}{c.discount_type === 'percent' ? '%' : c.discount_type === 'euro' ? '€' : ''}
                      </span>
                      <button onClick={() => deleteCoupon(c.id)} className="text-red-400 hover:text-red-600 text-[18px] shrink-0">🗑️</button>
                    </div>
                  );
                })}
                {coupons.length === 0 && (
                  <div className="px-6 py-8 text-center text-muted text-[14px]">Aucun coupon encore.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── STORES TAB ──────────────────────── */}
        {tab === 'stores' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-text-main text-[18px] font-bold mb-5">➕ Ajouter une boutique</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-text-main mb-1">Nom *</label>
                  <input
                    value={storeForm.name}
                    onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-'), logo_letter: e.target.value[0]?.toUpperCase() || '' })}
                    placeholder="ex: Shein"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-text-main mb-1">Slug (URL)</label>
                  <input
                    value={storeForm.slug}
                    onChange={(e) => setStoreForm({ ...storeForm, slug: e.target.value })}
                    placeholder="ex: shein"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-text-main mb-1">Couleur du logo</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={storeForm.logo_color}
                      onChange={(e) => setStoreForm({ ...storeForm, logo_color: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                    />
                    <input
                      value={storeForm.logo_color}
                      onChange={(e) => setStoreForm({ ...storeForm, logo_color: e.target.value })}
                      className="flex-1 border border-border rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-text-main mb-1">Lettre du logo</label>
                  <input
                    value={storeForm.logo_letter}
                    onChange={(e) => setStoreForm({ ...storeForm, logo_letter: e.target.value.slice(0, 2).toUpperCase() })}
                    placeholder="ex: S"
                    maxLength={2}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-semibold text-text-main mb-1">Description</label>
                  <input
                    value={storeForm.description}
                    onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                    placeholder="ex: Mode et accessoires tendance"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-primary"
                  />
                </div>
              </div>
              <button onClick={addStore} className="mt-5 bg-primary hover:bg-primary-dark text-white font-bold text-[14px] px-6 py-2.5 rounded-lg transition-colors">
                Ajouter la boutique
              </button>
            </div>

            {/* Stores list */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-text-main text-[16px] font-bold">Boutiques existantes ({stores.length})</h2>
              </div>
              <div className="divide-y divide-border">
                {stores.map((s) => {
                  const count = coupons.filter((c) => c.store_id === s.id).length;
                  return (
                    <div key={s.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-[16px] shrink-0"
                        style={{ backgroundColor: s.logo_color || '#C0392B' }}
                      >
                        {s.logo_letter || s.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-text-main text-[14px] font-semibold">{s.name}</p>
                        <p className="text-muted text-[12px]">/{s.slug} · {count} coupons</p>
                      </div>
                      <button onClick={() => deleteStore(s.id)} className="text-red-400 hover:text-red-600 text-[18px] shrink-0">🗑️</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── SUBSCRIBERS TAB ─────────────────── */}
        {tab === 'subscribers' && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-text-main text-[16px] font-bold">Abonnés newsletter ({subscribers.length})</h2>
            </div>
            <div className="divide-y divide-border">
              {subscribers.map((s) => (
                <div key={s.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <span className="text-text-main text-[14px]">{s.email}</span>
                  <span className="text-muted text-[12px]">{new Date(s.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              ))}
              {subscribers.length === 0 && (
                <div className="px-6 py-8 text-center text-muted text-[14px]">Aucun abonné encore.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

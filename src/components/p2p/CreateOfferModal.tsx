'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Modal, Input, Select, Button, Alert } from '@/components/ui';
import { CURRENCIES, PAYMENT_METHODS } from '@/lib/format';
import { CreateOfferForm, OfferType, PaymentMethod } from '@/types/p2p';

interface Props { open: boolean; onClose: () => void; onSuccess: () => void; }

const DEFAULT: CreateOfferForm = {
  type: 'SELL', from_currency: 'USDT', rate: 4500,
  min_amount: 1, max_amount: 100, payment_methods: [], payment_details: '',
};

export const CreateOfferModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [form, setForm]     = useState<CreateOfferForm>(DEFAULT);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const set = (key: keyof CreateOfferForm, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const togglePayment = (m: PaymentMethod) =>
    set('payment_methods',
      form.payment_methods.includes(m)
        ? form.payment_methods.filter(x => x !== m)
        : [...form.payment_methods, m]
    );

  const handleSubmit = async () => {
    setError(null);
    if (form.payment_methods.length === 0) { setError('Select at least one payment method.'); return; }
    if (form.min_amount <= 0 || form.max_amount < form.min_amount) { setError('Invalid amount range.'); return; }
    if (!form.payment_details.trim()) { setError('Enter your payment details (MM number or bank info).'); return; }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not authenticated.'); setLoading(false); return; }

    const { error: err } = await supabase.from('p2p_offers').insert({
      user_id:         user.id,
      type:            form.type,
      from_currency:   form.from_currency,
      to_currency:     'MGA',
      rate:            form.rate,
      min_amount:      form.min_amount,
      max_amount:      form.max_amount,
      payment_methods: form.payment_methods,
      payment_details: form.payment_details,
      status:          'ACTIVE',
    });

    setLoading(false);
    if (err) { setError(err.message); return; }
    setForm(DEFAULT);
    onSuccess();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="📢 Créer une offre P2P">
      <div className="flex flex-col gap-4">
        {/* Type toggle */}
        <div className="flex rounded-xl overflow-hidden border border-white/10">
          {(['SELL', 'BUY'] as OfferType[]).map(t => (
            <button key={t} onClick={() => set('type', t)}
              className={`flex-1 py-2.5 text-sm font-bold transition-colors ${form.type === t ? (t === 'SELL' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white') : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              {t === 'SELL' ? '📤 Je vends' : '📥 J\'achète'}
            </button>
          ))}
        </div>

        {/* Currency + Rate */}
        <div className="grid grid-cols-2 gap-3">
          <Select label="Crypto" value={form.from_currency} onChange={e => set('from_currency', e.target.value)}>
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </Select>
          <Input label="Taux (MGA/1 unité)" type="number" value={form.rate}
            onChange={e => set('rate', +e.target.value)} placeholder="ex: 4500" />
        </div>

        {/* Amount range */}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Min (unités crypto)" type="number" value={form.min_amount}
            onChange={e => set('min_amount', +e.target.value)} />
          <Input label="Max (unités crypto)" type="number" value={form.max_amount}
            onChange={e => set('max_amount', +e.target.value)} />
        </div>

        {/* Payment methods */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Méthodes de paiement acceptées
          </label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map(m => (
              <button key={m} onClick={() => togglePayment(m as PaymentMethod)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${form.payment_methods.includes(m) ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Payment details */}
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">
            Vos coordonnées de paiement
          </label>
          <textarea value={form.payment_details} onChange={e => set('payment_details', e.target.value)}
            placeholder="Ex: MVola — 034 12 345 67 / Orange — 032 87 654 32 / Nom Banque — RIB..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 outline-none focus:border-yellow-400 resize-none" />
        </div>

        {/* Preview rate */}
        <div className="bg-white/5 rounded-xl p-3 text-xs text-gray-300 flex justify-between">
          <span>Limite: {form.min_amount} – {form.max_amount} {form.from_currency}</span>
          <span className="text-yellow-400 font-bold">1 {form.from_currency} = {form.rate.toLocaleString('fr-FR')} Ar</span>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        <div className="flex gap-3 pt-1">
          <Button variant="ghost" onClick={onClose} className="flex-1">Annuler</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading} className="flex-1">
            Publier l'offre
          </Button>
        </div>
      </div>
    </Modal>
  );
};

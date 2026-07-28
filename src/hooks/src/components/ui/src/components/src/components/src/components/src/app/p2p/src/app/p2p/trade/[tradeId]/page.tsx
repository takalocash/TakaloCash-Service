'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTrade } from '@/hooks/useP2P';
import { TradeSteps } from '@/components/p2p/TradeSteps';
import { ChatBox } from '@/components/p2p/ChatBox';
import { Spinner, Alert } from '@/components/ui';

export default function TradePage() {
  const { tradeId } = useParams<{ tradeId: string }>();
    const router = useRouter();
      const [currentUserId, setUserId] = useState<string | null>(null);
        const { trade, loading, error, refetch } = useTrade(tradeId);

          useEffect(() => {
              supabase.auth.getUser().then(({ data }) => {
                    if (!data.user) { router.push('/login'); return; }
                          setUserId(data.user.id);
                              });
                                }, [router]);

                                  // Auth guard: only participants can view
                                    if (!loading && trade && currentUserId) {
                                        const isParticipant = currentUserId === trade.buyer_id || currentUserId === trade.seller_id;
                                            if (!isParticipant) return (
                                                  <main className="min-h-screen bg-[#0d0d1a] flex items-center justify-center text-white">
                                                          <Alert type="error">Accès refusé — vous n'êtes pas participant à ce trade.</Alert>
                                                                </main>
                                                                    );
                                                                      }

                                                                        if (loading || !currentUserId) return (
                                                                            <main className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
                                                                                  <Spinner size={48} />
                                                                                      </main>
                                                                                        );

                                                                                          if (error) return (
                                                                                              <main className="min-h-screen bg-[#0d0d1a] flex items-center justify-center p-8">
                                                                                                    <Alert type="error">{error}</Alert>
                                                                                                        </main>
                                                                                                          );

                                                                                                            if (!trade) return (
                                                                                                                <main className="min-h-screen bg-[#0d0d1a] flex items-center justify-center text-white">
                                                                                                                      Trade introuvable.
                                                                                                                          </main>
                                                                                                                            );

                                                                                                                              const isBuyer  = currentUserId === trade.buyer_id;
                                                                                                                                const isSeller = currentUserId === trade.seller_id;
                                                                                                                                  const other    = isBuyer ? trade.seller_profile : trade.buyer_profile;

                                                                                                                                    return (
                                                                                                                                        <main className="min-h-screen bg-[#0d0d1a] text-white p-4 md:p-6">
                                                                                                                                              <div className="max-w-6xl mx-auto">
                                                                                                                                                      {/* ── Breadcrumb ── */}
                                                                                                                                                              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                                                                                                                                                                        <button onClick={() => router.push('/p2p')} className="hover:text-yellow-400 transition-colors">
                                                                                                                                                                                    ← Marketplace
                                                                                                                                                                                              </button>
                                                                                                                                                                                                        <span>/</span>
                                                                                                                                                                                                                  <span className="text-gray-300">Trade #{trade.id.slice(0, 8).toUpperCase()}</span>
                                                                                                                                                                                                                          </div>

                                                                                                                                                                                                                                  {/* ── Counterparty banner ── */}
                                                                                                                                                                                                                                          <div className="flex items-center gap-3 mb-6 bg-white/5 border border-white/10 rounded-2xl px-5 py-3">
                                                                                                                                                                                                                                                    <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 font-bold">
                                                                                                                                                                                                                                                                {other?.display_name?.[0]?.toUpperCase() ?? '?'}
                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                    <div>
                                                                                                                                                                                                                                                                                                <p className="font-semibold text-white text-sm">{other?.display_name ?? 'Anonyme'}</p>
                                                                                                                                                                                                                                                                                                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                                                                                                                                                                                                                                                                                                          {other?.is_verified && <span className="text-blue-400">✓ Vérifié</span>}
                                                                                                                                                                                                                                                                                                                                        <span>{other?.reputation?.toFixed(1)}% réussite</span>
                                                                                                                                                                                                                                                                                                                                                      <span>{other?.trades_count} trades</span>
                                                                                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                      <div className="ml-auto text-xs text-gray-500">
                                                                                                                                                                                                                                                                                                                                                                                                  Vous êtes : <span className="font-semibold text-yellow-400">{isBuyer ? '🧑‍💼 Acheteur' : '🏪 Vendeur'}</span>
                                                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                                                    </div>

                                                                                                                                                                                                                                                                                                                                                                                                                            {/* ── Split layout ── */}
                                                                                                                                                                                                                                                                                                                                                                                                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-[calc(100vh-220px)]">
                                                                                                                                                                                                                                                                                                                                                                                                                                              {/* Left — Trade steps */}
                                                                                                                                                                                                                                                                                                                                                                                                                                                        <div className="overflow-y-auto">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <TradeSteps trade={trade} currentUserId={currentUserId} refetch={refetch} />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                              </div>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        {/* Right — Chat */}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  <ChatBox tradeId={tradeId} currentUserId={currentUserId} />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </main>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      }
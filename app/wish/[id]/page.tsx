import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import { getWishById } from '@/lib/supabase';
import { PERSONAS } from '@/lib/personas';
import { formatDate, truncateAddress } from '@/lib/utils';
import Link from 'next/link';
import type { Persona } from '@/typings/types';

export default async function WishPage({ params }: { params: { id: string } }) {
  const wish = await getWishById(params.id);

  if (!wish) {
    notFound();
  }

  const personaConfig = PERSONAS[wish.persona as keyof typeof PERSONAS];
  
  const getVerdict = (reply: string | null) => {
    if (!reply) return 'PENDING';
    if (reply.includes('GRANTED')) return 'GRANTED';
    if (reply.includes('COAL')) return 'COAL';
    if (reply.includes('DENIED')) return 'DENIED';
    return 'DELIBERATING';
  };
  
  const finalVerdict = wish.final_verdict || getVerdict(wish.ai_reply);
  const hasMultipleJudges = wish.judge_responses && Object.keys(wish.judge_responses).length > 0;

  return (
    <main>
      <Header />
      
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-6">
          <Link 
            href="/" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to courtroom
          </Link>
        </div>

        <div className="rounded-3xl bg-white/80 p-8 shadow-sm border border-gray-100 space-y-6">
          {/* Case Header */}
          <div className="text-center border-b border-gray-100 pb-6">
            <div className="inline-block px-4 py-2 bg-gray-100 rounded-full mb-3">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Case File</p>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Christmas Court Ruling
            </h1>
            <p className="text-sm text-gray-500">{formatDate(wish.created_at)}</p>
          </div>

          {/* Verdict Banner */}
          <div className={`text-center py-6 rounded-2xl ${
            finalVerdict === 'GRANTED' ? 'bg-green-50 border-2 border-green-200' :
            finalVerdict === 'COAL' ? 'bg-gray-800 border-2 border-gray-900' :
            finalVerdict === 'DENIED' ? 'bg-red-50 border-2 border-red-200' :
            'bg-blue-50 border-2 border-blue-200'
          }`}>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Final Verdict</p>
            <p className={`text-4xl font-bold ${
              finalVerdict === 'GRANTED' ? 'text-green-700' :
              finalVerdict === 'COAL' ? 'text-white' :
              finalVerdict === 'DENIED' ? 'text-red-700' :
              'text-blue-700'
            }`}>
              {finalVerdict}
            </p>
          </div>

          {/* Lead Judge */}
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <span className="text-4xl">{personaConfig?.emoji || '⚖️'}</span>
            <div>
              <p className="text-xs text-gray-500 uppercase">Lead Judge</p>
              <h2 className="text-xl font-semibold text-gray-900">
                {personaConfig?.name || wish.persona}
              </h2>
            </div>
          </div>

          {/* The Case */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
              📋 Submitted Wish
            </h2>
            <p className="text-lg text-gray-900 leading-relaxed bg-gray-50 p-4 rounded-xl">
              {wish.wish_text}
            </p>
          </div>

          {/* All Judge Rulings */}
          {hasMultipleJudges ? (
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                ⚖️ Complete Tribunal Deliberations
              </h2>
              <div className="space-y-4">
                {Object.entries(wish.judge_responses!).map(([judgeName, response]) => {
                  const judge = PERSONAS[judgeName as Persona];
                  const judgeVerdict = getVerdict(response);
                  return (
                    <div key={judgeName} className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{judge.emoji}</span>
                          <span className="font-semibold text-gray-900">{judge.name}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          judgeVerdict === 'GRANTED' ? 'bg-green-100 text-green-700' :
                          judgeVerdict === 'COAL' ? 'bg-gray-800 text-white' :
                          judgeVerdict === 'DENIED' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {judgeVerdict}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{response}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Fallback for old wishes with single judge */
            wish.ai_reply && (
              <div className="space-y-3 border-t border-gray-100 pt-6">
                <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                  ⚖️ Tribunal Decision
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">
                  {wish.ai_reply}
                </p>
              </div>
            )
          )}

          {/* Case Details */}
          {wish.wallet_address && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500 mb-1">Submitted by:</p>
              <Link
                href={`/profile/${wish.wallet_address}`}
                className="text-sm text-gray-700 hover:text-gray-900 font-mono"
              >
                {truncateAddress(wish.wallet_address, 8)}
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

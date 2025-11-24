import Header from '@/components/Header';
import { getWishes } from '@/lib/supabase';
import WishCard from '@/components/WishCard';

export default async function NaughtyListPage() {
  const wishes = await getWishes(100);

  return (
    <main>
      <Header />
      
      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-red-100 rounded-full mb-4">
            <p className="text-sm font-bold text-red-700 uppercase tracking-wide">⚖️ Case Archive</p>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            All Court Cases
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse the complete record of Christmas Court proceedings and tribunal verdicts
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{wishes.length}</p>
            <p className="text-sm text-gray-600 mt-1">Total Cases</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">5</p>
            <p className="text-sm text-gray-600 mt-1">Active Judges</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-700">2024</p>
            <p className="text-sm text-gray-600 mt-1">Season</p>
          </div>
        </div>

        <div className="space-y-4">
          {wishes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No cases yet. Court is in recess! ⚖️</p>
            </div>
          ) : (
            wishes.map((wish) => (
              <WishCard key={wish.id} wish={wish} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}

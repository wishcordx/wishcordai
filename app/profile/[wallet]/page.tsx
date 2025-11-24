import Header from '@/components/Header';
import { getWishesByWallet } from '@/lib/supabase';
import WishCard from '@/components/WishCard';
import { truncateAddress } from '@/lib/utils';

export default async function ProfilePage({ params }: { params: { wallet: string } }) {
  const wishes = await getWishesByWallet(params.wallet);

  return (
    <main>
      <Header />
      
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Wishes from
          </h1>
          <p className="text-xl text-gray-600 font-mono">
            {truncateAddress(params.wallet, 8)}
          </p>
        </div>

        <div className="space-y-4">
          {wishes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No wishes from this wallet yet.</p>
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

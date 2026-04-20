import React, { useEffect, useState } from 'react';

type Tier = {
  name: string;
  price: number;
  perks?: string[];
  auto_renew?: boolean;
};

type Creator = {
  id: string;
  name: string;
  handle: string;
  description: string;
  avatar: string;
  cover: string;
  subscribers: number;
  tiers: Tier[];
  wallet_address: string;
};

export default function CreatorPanel({
  account,
  onSaved,
}: {
  account: string;
  onSaved?: () => void;
}) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState('');
  const [cover, setCover] = useState('');

  useEffect(() => {
    setLoading(false);
  }, []);

  const initializeProfile = async () => {
    const newCreator = {
      id: account.slice(0, 8),
      wallet_address: account,
      name: name || 'New Creator',
      handle: handle || `@user_${account.slice(2, 6)}`,
      description: description || 'Hi, I am new here!',
      avatar: avatar || `https://picsum.photos/seed/${account}/200/200`,
      cover: cover || `https://picsum.photos/seed/cover${account}/1200/400`,
      subscribers: 0,
      tiers: [],
    };

    const res = await fetch('/api/creators/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCreator),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg);
    }

    setCreator(newCreator);
    onSaved?.();
    alert('Profile initialized!');
  };

  if (loading) {
    return <div className="p-8 text-sm text-gray-500">Loading creator panel...</div>;
  }

  if (!creator) {
    return (
      <div className="max-w-xl mx-auto py-10 text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-2xl font-bold mb-3">Initialize Profile</h2>
        <p className="text-gray-500 mb-6">
          Your wallet is connected, but you have not registered as a creator yet.
        </p>

        <div className="grid grid-cols-1 gap-3 text-left">
          <input className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100" placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100" placeholder="Handle" value={handle} onChange={(e) => setHandle(e.target.value)} />
          <textarea className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100" placeholder="Description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          <input className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100" placeholder="Avatar URL" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
          <input className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100" placeholder="Cover URL" value={cover} onChange={(e) => setCover(e.target.value)} />
        </div>

        <button
          onClick={initializeProfile}
          className="mt-6 bg-[#FF424D] text-white px-8 py-3 rounded-full font-bold hover:bg-[#E63B45] transition-all"
        >
          Initialize Profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
      <h2 className="text-2xl font-bold mb-2">Creator Dashboard</h2>
      <p className="text-gray-500">Wallet: {account}</p>
      <p className="mt-4 text-sm text-gray-600">Your creator profile is registered.</p>
      <pre className="mt-4 text-xs bg-gray-50 p-4 rounded-2xl overflow-auto">{JSON.stringify(creator, null, 2)}</pre>
    </div>
  );
}

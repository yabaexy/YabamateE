import { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import CreatorPanel from './CreatorPanel';
import { MOCK_CREATORS } from './constants';

type Creator = typeof MOCK_CREATORS[number] & { wallet_address?: string };

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function App() {
  const [view, setView] = useState<'explore' | 'creator'>('explore');
  const [account, setAccount] = useState<string>('');
  const [creators, setCreators] = useState<Creator[]>(MOCK_CREATORS as any);
  const [status, setStatus] = useState('Checking database...');
  const [search, setSearch] = useState('');

  const fetchCreators = async () => {
    try {
      const res = await fetch('/api/creators');
      const data = await res.json();
      if (Array.isArray(data?.creators)) {
        setCreators(data.creators);
        setStatus('Connected to Neon DB');
      } else {
        setStatus('Using mock data');
      }
    } catch (e) {
      setStatus('Backend error or Neon DB not configured');
    }
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask or another wallet is required.');
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    setAccount(accounts[0]);
    setView('creator');
  };

  const filteredCreators = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return creators;
    return creators.filter((c: any) =>
      String(c.name || '').toLowerCase().includes(q) ||
      String(c.handle || '').toLowerCase().includes(q) ||
      String(c.description || '').toLowerCase().includes(q)
    );
  }, [creators, search]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('explore')}
            className={view === 'explore' ? 'font-bold text-[#FF424D]' : 'text-gray-500'}
          >
            Explore
          </button>
          <button
            onClick={() => setView('creator')}
            className={view === 'creator' ? 'font-bold text-[#FF424D]' : 'text-gray-500'}
          >
            Creator Panel
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1 rounded-full border border-gray-100 bg-gray-50 text-gray-500">{status}</span>
          {account ? (
            <span className="text-sm font-mono bg-gray-50 px-3 py-2 rounded-full border border-gray-100">{account.slice(0, 6)}...{account.slice(-4)}</span>
          ) : (
            <button onClick={connectWallet} className="bg-[#FF424D] text-white px-5 py-2 rounded-full font-bold">
              Connect Wallet
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {view === 'creator' ? (
          account ? (
            <CreatorPanel account={account} onSaved={fetchCreators} />
          ) : (
            <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
              <h2 className="text-2xl font-bold mb-3">Wallet Connection Required</h2>
              <p className="text-gray-500 mb-6">Connect MetaMask to open the creator panel.</p>
              <button onClick={connectWallet} className="bg-[#FF424D] text-white px-6 py-3 rounded-full font-bold">
                Connect Wallet
              </button>
            </div>
          )
        ) : (
          <div>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black tracking-tight">Support your favorite creators</h1>
                <p className="text-gray-500 mt-2">Creator list is loaded from Neon when available.</p>
              </div>
              <div className="w-full md:w-80">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search creators..."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-white shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCreators.map((creator: any) => (
                <div key={creator.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
                  <div className="h-40 bg-gray-200 overflow-hidden">
                    <img src={creator.cover} alt={creator.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold">{creator.name}</h3>
                    <p className="text-sm text-[#FF424D] font-bold">{creator.handle}</p>
                    <p className="text-sm text-gray-500 mt-3 line-clamp-3">{creator.description}</p>
                    <button onClick={() => setView('creator')} className="mt-5 text-sm font-bold text-[#FF424D]">
                      Open Creator Panel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'motion/react';
import GamePortal from './components/games/GamePortal';
import EscrowView from './components/EscrowView';
import CreatorPanel from './components/CreatorPanel';
import { 
  Wallet, 
  Search, 
  Heart, 
  Users, 
  ShieldCheck, 
  ExternalLink, 
  ChevronRight, 
  Plus,
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  Gamepad2,
  Coins,
  ShieldAlert
} from 'lucide-react';
import { cn } from './lib/utils';
import { WYDA_CONTRACT_ADDRESS, WYDA_ABI, MOCK_CREATORS } from './constants';

export default function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [ympBalance, setYmpBalance] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<typeof MOCK_CREATORS[0] | null>(null);
  const [view, setView] = useState<'explore' | 'games' | 'escrow' | 'creator'>('explore');
  const [isConnecting, setIsConnecting] = useState(false);
  const [creators, setCreators] = useState<typeof MOCK_CREATORS>(MOCK_CREATORS);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string }>({ connected: false, message: "Checking database..." });

  useEffect(() => {
    fetchCreators();
    // Load YMP balance
    const saved = localStorage.getItem('yaba_ymp');
    if (saved) setYmpBalance(parseInt(saved, 10));
  }, []);

  const handleYmpUpdate = (newBalance: number) => {
    setYmpBalance(newBalance);
    localStorage.setItem('yaba_ymp', newBalance.toString());
  };

  const fetchCreators = async () => {
    try {
      const res = await fetch('/api/creators');
      const data = await res.json();
      if (data.creators && data.creators.length > 0) {
        setCreators(data.creators);
        setDbStatus({ connected: true, message: "Connected to Neon DB" });
      } else {
        setDbStatus({ connected: false, message: "Using mock data (Neon DB not configured or empty)" });
      }
    } catch (error) {
      console.error("Error fetching creators:", error);
      setDbStatus({ connected: false, message: "Backend error or Neon DB not configured" });
    }
  };

  const initDb = async () => {
    try {
      const res = await fetch('/api/init-db', { method: 'POST' });
      const data = await res.json();
      if (data.message) {
        alert("Database initialized successfully!");
        fetchCreators();
      } else {
        alert("Failed to initialize database: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      alert("Error connecting to backend");
    }
  };

  // Connect Wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsConnecting(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        updateBalance(accounts[0], provider);
      } catch (error) {
        console.error("User denied account access", error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("Please install MetaMask or another Web3 wallet.");
    }
  };

  const updateBalance = async (addr: string, provider: ethers.BrowserProvider) => {
    try {
      const contract = new ethers.Contract(WYDA_CONTRACT_ADDRESS, WYDA_ABI, provider);
      const bal = await contract.balanceOf(addr);
      const decimals = await contract.decimals();
      setBalance(ethers.formatUnits(bal, decimals));
    } catch (error) {
      console.error("Error fetching balance", error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance("0");
    setView('explore');
  };

  const ADMIN_WALLETS = [
    '0xf44d876365611149ebc396def8edd18a83be91c0',
    '0x8Cda9D8b30272A102e0e05A1392A795c267F14Bf',
    '0x2E9Bff8Bf288ec3AB1Dc540B777f9b48276a6286'
  ].map(w => w.toLowerCase());

  const isAdmin = account && ADMIN_WALLETS.includes(account.toLowerCase());

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setSelectedCreator(null); setView('explore'); }}>
            <div className="w-10 h-10 bg-[#FF424D] rounded-full flex items-center justify-center text-white font-bold text-xl">
              Y
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">Yaba Mate</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-500">
            <button 
              onClick={() => setView('explore')}
              className={cn("transition-colors hover:text-[#FF424D]", view === 'explore' ? 'text-[#FF424D]' : 'text-gray-400')}
            >
              Explore
            </button>
            <button 
                onClick={() => setView('games')}
                className={cn("transition-colors hover:text-[#FF424D] flex items-center gap-1.5", view === 'games' ? 'text-[#FF424D]' : 'text-gray-400')}
            >
              <Gamepad2 size={18} /> Mini Games
            </button>
            {account && (
              <button 
                  onClick={() => setView('creator')}
                  className={cn("transition-colors hover:text-[#FF424D] flex items-center gap-1.5", view === 'creator' ? 'text-[#FF424D]' : 'text-gray-400')}
              >
                <LayoutDashboard size={18} /> Creator Panel
              </button>
            )}
            {isAdmin && (
               <button 
                  onClick={() => setView('escrow')}
                  className={cn("transition-colors hover:text-[#FF424D] flex items-center gap-1.5", view === 'escrow' ? 'text-[#FF424D]' : 'text-gray-400')}
               >
                 <ShieldAlert size={18} /> Escrow
               </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end mr-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">YMP Points</span>
            <div className="flex items-center gap-1 text-[#FF424D] font-black">
                <Coins size={14} /> {ympBalance}
            </div>
            <div className="text-[8px] text-gray-400 mt-0.5">≈ {(ympBalance / 2000).toFixed(4)} YDA</div>
          </div>
          <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-2 gap-2 focus-within:ring-2 focus-within:ring-[#FF424D]/20 transition-all">
            <Search size={16} className={cn("transition-colors", searchQuery ? "text-[#FF424D]" : "text-gray-400")} />
            <input 
              type="text" 
              placeholder="Find a creator" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (view !== 'explore') setView('explore');
              }}
              className="bg-transparent border-none focus:outline-none text-sm w-32 md:w-48"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-[#FF424D]">
                <X size={14} />
              </button>
            )}
          </div>

          {account ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Balance</span>
                <span className="text-sm font-mono font-bold text-[#FF424D]">{parseFloat(balance).toFixed(2)} WYDA</span>
              </div>
              <div className="h-8 w-px bg-gray-200 hidden lg:block" />
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full pl-3 pr-1 py-1">
                <span className="text-xs font-mono font-medium text-gray-600">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <button 
                  onClick={disconnectWallet}
                  className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-[#FF424D] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#E63B45] transition-all shadow-sm flex items-center gap-2"
            >
              {isConnecting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Wallet size={18} />
              )}
              Connect Wallet
            </button>
          )}

          <button 
            className="md:hidden p-2 text-gray-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <AnimatePresence mode="wait">
          {view === 'games' ? (
            <motion.div
              key="games-portal"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Game Station</h1>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        Complete your daily quest by playing all available games. Each daily completion earns you 200 YMP!
                    </p>
                </div>
                <GamePortal currentBalance={ympBalance} onBalanceUpdate={handleYmpUpdate} />
            </motion.div>
          ) : view === 'escrow' && isAdmin ? (
             <EscrowView adminAddress={account!} />
          ) : view === 'creator' && account ? (
             <CreatorPanel account={account} onUpdate={fetchCreators} />
          ) : !selectedCreator ? (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                    The Ultimate Companion <br className="hidden md:block" /> for <span className="text-[#FF424D]">Yaba Mate</span>
                  </h1>
                  <p className="text-lg text-gray-500 max-w-2xl">
                    Whether you're supporting creators or playing mini-games, earn YMP and be part of the most vibrant ecosystem.
                  </p>
                  
                  {/* Search Bar for Explore Page */}
                  <div className="mt-8 relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search size={20} className={cn("transition-colors", searchQuery ? "text-[#FF424D]" : "text-gray-400")} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search creators by name or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[20px] shadow-sm focus:ring-4 focus:ring-[#FF424D]/5 focus:border-[#FF424D] transition-all text-base placeholder:text-gray-400"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-[#FF424D] transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center md:items-end gap-2">
                  <div className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                    dbStatus.connected ? "bg-green-50 text-green-600 border-green-100" : "bg-amber-50 text-amber-600 border-amber-100"
                  )}>
                    {dbStatus.message}
                  </div>
                  {!dbStatus.connected && (
                    <button 
                      onClick={initDb}
                      className="text-[10px] font-bold text-gray-400 hover:text-[#FF424D] underline transition-colors"
                    >
                      Initialize Neon DB
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {creators
                  .filter(c => 
                    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    c.description.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length > 0 ? (
                  creators
                    .filter(c => 
                      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      c.description.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((creator) => (
                      <motion.div
                        key={creator.id}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                        onClick={() => setSelectedCreator(creator)}
                      >
                        <div className="h-32 bg-gray-200 relative">
                          <img 
                            src={creator.cover} 
                            alt={creator.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute -bottom-10 left-6">
                            <img 
                              src={creator.avatar} 
                              alt={creator.name} 
                              className="w-20 h-20 rounded-2xl border-4 border-white object-cover shadow-md"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                        <div className="pt-12 p-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold group-hover:text-[#FF424D] transition-colors">{creator.name}</h3>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                              <Users size={12} /> {creator.subscribers}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-6">
                            {creator.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                              {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                                  <img src={`https://picsum.photos/seed/fan${i+creator.id}/32/32`} alt="fan" referrerPolicy="no-referrer" />
                                </div>
                              ))}
                            </div>
                            <button className="text-sm font-bold text-[#FF424D] flex items-center gap-1">
                              View Profile <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                ) : (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4">
                      <Search size={40} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No creators found</h3>
                    <p className="text-gray-500 max-w-sm">
                      We couldn't find any creators matching "{searchQuery}". Try a different name or description.
                    </p>
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="mt-6 text-[#FF424D] font-bold hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                )}

                {/* Create Profile Card */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center hover:border-[#FF424D] transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-[#FF424D]/10 group-hover:text-[#FF424D] transition-all mb-4">
                    <Plus size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Become a Creator</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Start accepting WYDA tokens from your community today.
                  </p>
                  <button className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-black transition-all">
                    Get Started
                  </button>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-5xl mx-auto"
            >
              <button 
                onClick={() => setSelectedCreator(null)}
                className="mb-8 text-sm font-bold text-gray-500 flex items-center gap-2 hover:text-[#FF424D] transition-colors"
              >
                <ChevronRight size={16} className="rotate-180" /> Back to Explore
              </button>

              <div className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-sm mb-12">
                <div className="h-64 md:h-80 bg-gray-200 relative">
                  <img 
                    src={selectedCreator.cover} 
                    alt={selectedCreator.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="px-8 md:px-12 pb-12 relative">
                  <div className="absolute -top-16 left-8 md:left-12">
                    <img 
                      src={selectedCreator.avatar} 
                      alt={selectedCreator.name} 
                      className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] border-8 border-white object-cover shadow-xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="pt-20 md:pt-28 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-1">{selectedCreator.name}</h1>
                      <p className="text-[#FF424D] font-bold mb-4">{selectedCreator.handle}</p>
                      <div className="flex items-center gap-6 text-sm font-bold text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Users size={16} /> {selectedCreator.subscribers} Patrons</span>
                        <span className="flex items-center gap-1.5"><Heart size={16} /> 4.2k Likes</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 md:flex-none px-8 py-3 bg-[#FF424D] text-white rounded-2xl font-bold hover:bg-[#E63B45] transition-all shadow-lg shadow-[#FF424D]/20">
                        Follow
                      </button>
                      <button className="p-3 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-200 transition-all">
                        <ExternalLink size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                      <h2 className="text-xl font-bold mb-4">About</h2>
                      <p className="text-gray-600 leading-relaxed mb-8">
                        {selectedCreator.description} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      </p>

                      <h2 className="text-xl font-bold mb-6">Recent Posts</h2>
                      <div className="space-y-6">
                        {[1, 2].map(i => (
                          <div key={i} className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                <img src={selectedCreator.avatar} alt="avatar" referrerPolicy="no-referrer" />
                              </div>
                              <div>
                                <p className="text-sm font-bold">New Project Update</p>
                                <p className="text-xs text-gray-400">2 days ago</p>
                              </div>
                            </div>
                            <div className="h-48 bg-gray-200 rounded-2xl mb-4 overflow-hidden">
                              <img src={`https://picsum.photos/seed/post${i+selectedCreator.id}/800/400`} alt="post" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="flex items-center gap-2 text-[#FF424D] bg-[#FF424D]/10 px-4 py-2 rounded-xl w-fit text-xs font-bold uppercase tracking-wider">
                              <ShieldCheck size={14} /> Patron Only Content
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h2 className="text-xl font-bold mb-6">Select a Membership</h2>
                      {selectedCreator.tiers.map((tier, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.02 }}
                          className="bg-white border-2 border-gray-100 rounded-3xl p-6 hover:border-[#FF424D] transition-all cursor-pointer relative overflow-hidden group"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-lg">{tier.name}</h3>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black">{tier.price}</span>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">WYDA / mo</span>
                              </div>
                            </div>
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-[#FF424D]/10 group-hover:text-[#FF424D] transition-all">
                              <ChevronRight size={20} />
                            </div>
                          </div>
                          <ul className="space-y-3 mb-6">
                            {tier.perks.map((perk, pIdx) => (
                              <li key={pIdx} className="text-sm text-gray-500 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#FF424D]" />
                                {perk}
                              </li>
                            ))}
                          </ul>
                          <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all">
                            Join Now
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-4 md:px-8 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF424D] rounded-full flex items-center justify-center text-white font-bold text-lg">
              Y
            </div>
            <span className="text-lg font-bold tracking-tight">Yaba Mate</span>
          </div>
          
          <div className="flex gap-8 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-[#FF424D] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#FF424D] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#FF424D] transition-colors">Help</a>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-widest">
            <ShieldCheck size={14} /> Secured by BSC
          </div>
        </div>
      </footer>
    </div>
  );
}

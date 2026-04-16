/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'motion/react';
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
  Coins,
  Sparkles
} from 'lucide-react';
import { cn } from './lib/utils';
import { WYDA_CONTRACT_ADDRESS, WYDA_ABI, MOCK_CREATORS } from './constants';
import MuseSystem from './components/MuseSystem';

export default function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<typeof MOCK_CREATORS[0] | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [creators, setCreators] = useState<typeof MOCK_CREATORS>(MOCK_CREATORS);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string }>({ connected: false, message: "Checking database..." });
  const [view, setView] = useState<'explore' | 'muse'>('explore');

  useEffect(() => {
    fetchCreators();
  }, []);

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

  const handleSponsor = async (amount: number) => {
    if (!account) {
      connectWallet();
      return;
    }

    try {
      // In a real app, we would perform a blockchain transaction here
      // const tx = await contract.transfer(creatorAddress, amount);
      // await tx.wait();

      const res = await fetch('/api/record-sponsorship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: account, amount })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully sponsored ${amount} WYDA! Your Muse gained EXP and stats!`);
        // Refresh balance
        const provider = new ethers.BrowserProvider(window.ethereum);
        updateBalance(account, provider);
      }
    } catch (error) {
      console.error("Sponsorship failed", error);
      alert("Sponsorship failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedCreator(null)}>
            <div className="w-10 h-10 bg-[#FF424D] rounded-full flex items-center justify-center text-white font-bold text-xl">
              W
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">WYDA Patreon</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            <button 
              onClick={() => { setView('explore'); setSelectedCreator(null); }}
              className={cn("hover:text-[#FF424D] transition-colors", view === 'explore' && "text-[#FF424D] font-bold")}
            >
              Explore
            </button>
            <button 
              onClick={() => setView('muse')}
              className={cn("hover:text-[#FF424D] transition-colors flex items-center gap-1.5", view === 'muse' && "text-[#FF424D] font-bold")}
            >
              <Sparkles size={16} /> YadaMuse
            </button>
            <button className="hover:text-[#FF424D] transition-colors">How it works</button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-2 gap-2">
            <Search size={16} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Find a creator" 
              className="bg-transparent border-none focus:outline-none text-sm w-32 md:w-48"
            />
          </div>

          {account ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setView('muse')}
                className="hidden lg:flex items-center gap-2 bg-pink-50 border border-pink-100 rounded-full px-3 py-1.5 hover:bg-pink-100 transition-all group"
              >
                <div className="w-6 h-6 rounded-full bg-pink-200 overflow-hidden">
                  <img src={`https://picsum.photos/seed/muse_thumb_${account}/32/32`} alt="muse" referrerPolicy="no-referrer" />
                </div>
                <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider group-hover:text-pink-700">My Muse</span>
              </button>
              <div className="h-8 w-px bg-gray-200 hidden lg:block" />
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
          {view === 'muse' && account ? (
            <motion.div
              key="muse-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="mb-12">
                <h1 className="text-4xl font-black tracking-tight mb-2">YadaMuse</h1>
                <p className="text-gray-500">Support creators and grow your own Muse.</p>
              </div>
              <MuseSystem address={account} />
            </motion.div>
          ) : view === 'muse' && !account ? (
            <motion.div
              key="muse-auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 bg-[#FF424D]/10 text-[#FF424D] rounded-3xl flex items-center justify-center mb-6">
                <Wallet size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Wallet Connection Required</h2>
              <p className="text-gray-500 mb-8 max-w-md">Please connect your wallet to access YadaMuse and start raising your character.</p>
              <button 
                onClick={connectWallet}
                className="bg-[#FF424D] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#E63B45] transition-all shadow-lg shadow-[#FF424D]/20"
              >
                Connect Wallet
              </button>
            </motion.div>
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
                    Support your favorite creators <br className="hidden md:block" /> with <span className="text-[#FF424D]">WYDA</span>
                  </h1>
                  <p className="text-lg text-gray-500 max-w-2xl">
                    A decentralized sponsorship platform where fans support creators directly using WYDA tokens on the Binance Smart Chain.
                  </p>
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
                {creators.map((creator) => (
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
                ))}

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
                          <button 
                            onClick={() => handleSponsor(tier.price)}
                            className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all"
                          >
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
              W
            </div>
            <span className="text-lg font-bold tracking-tight">WYDA Patreon</span>
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

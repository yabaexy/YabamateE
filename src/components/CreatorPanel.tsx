import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Plus, Trash2, RefreshCw, Save, X, LayoutDashboard } from 'lucide-react';
import { cn } from '../lib/utils';

interface Tier {
  name: string;
  price: number;
  perks: string[];
  auto_renew: boolean;
}

interface Creator {
  id: string;
  name: string;
  handle: string;
  description: string;
  avatar: string;
  cover: string;
  tiers: Tier[];
  wallet_address: string;
}

interface CreatorPanelProps {
  account: string;
  onUpdate: () => void;
}

const CreatorPanel: React.FC<CreatorPanelProps> = ({ account, onUpdate }) => {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Partial<Tier> | null>(null);

  useEffect(() => {
    fetchCreatorData();
  }, [account]);

  const fetchCreatorData = async () => {
    try {
      const res = await fetch('/api/creators');
      const data = await res.json();
      const me = data.creators?.find((c: any) => c.wallet_address?.toLowerCase() === account.toLowerCase());
      if (me) {
        setCreator(me);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedCreator: Creator) => {
    try {
      const res = await fetch('/api/creators/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCreator)
      });
      if (res.ok) {
        setCreator(updatedCreator);
        onUpdate();
        setEditingPlan(null);
      }
    } catch (err) {
      alert("Failed to save changes");
    }
  };

  const addPlan = () => {
    setEditingPlan({ name: '', price: 10, perks: [], auto_renew: false });
  };

  const deletePlan = (idx: number) => {
    if (!creator) return;
    const newTiers = [...creator.tiers];
    newTiers.splice(idx, 1);
    handleSave({ ...creator, tiers: newTiers });
  };

  const toggleAutoRenew = (idx: number) => {
    if (!creator) return;
    const newTiers = [...creator.tiers];
    newTiers[idx].auto_renew = !newTiers[idx].auto_renew;
    handleSave({ ...creator, tiers: newTiers });
  };

  if (loading) return <div className="p-20 text-center text-gray-400">Loading your panel...</div>;

  if (!creator) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center text-gray-400 mx-auto mb-6">
          <LayoutDashboard size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-4">Not Registered Yet</h2>
        <p className="text-gray-500 mb-8">You haven't registered as a creator with this wallet. Would you like to set up your profile?</p>
        <button 
          onClick={() => {
              const newCreator: Creator = {
                  id: account.slice(0, 8),
                  name: "New Creator",
                  handle: "@user_" + account.slice(2, 6),
                  description: "Hi, I am new here!",
                  avatar: `https://picsum.photos/seed/${account}/200/200`,
                  cover: `https://picsum.photos/seed/cover${account}/1200/400`,
                  tiers: [],
                  wallet_address: account
              };
              handleSave(newCreator);
          }}
          className="bg-[#FF424D] text-white px-8 py-3 rounded-full font-bold hover:bg-[#E63B45] transition-all"
        >
          Initialize Profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black mb-2">Creator Dashboard</h1>
          <p className="text-gray-500">Manage your profile, plans, and wallet settlement.</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-2xl">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Settlement Address</div>
                <div className="text-xs font-mono font-bold text-gray-700">{creator.wallet_address}</div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Settings size={20} className="text-[#FF424D]" /> Profile Settings
                </h2>
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
                            <input 
                                type="text" 
                                value={creator.name}
                                onChange={(e) => setCreator({...creator, name: e.target.value})}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#FF424D]/20 transition-all font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Handle</label>
                            <input 
                                type="text" 
                                value={creator.handle}
                                onChange={(e) => setCreator({...creator, handle: e.target.value})}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#FF424D]/20 transition-all font-bold text-gray-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                        <textarea 
                            rows={4}
                            value={creator.description}
                            onChange={(e) => setCreator({...creator, description: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#FF424D]/20 transition-all text-sm leading-relaxed"
                        />
                    </div>
                    <button 
                        onClick={() => handleSave(creator)}
                        className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all"
                    >
                        <Save size={18} /> Save Profile
                    </button>
                </div>
            </section>
        </div>

        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-bold">Membership Plans</h2>
                <button 
                    onClick={addPlan}
                    className="p-2 bg-[#FF424D] text-white rounded-lg hover:bg-[#E63B45] transition-all"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="space-y-4">
                {creator.tiers.map((tier, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm group">
                        <div className="flex justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{tier.name}</h3>
                                <p className="text-2xl font-black text-[#FF424D]">{tier.price} <span className="text-xs text-gray-400 font-bold uppercase">WYDA</span></p>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => deletePlan(idx)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-50">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <RefreshCw size={14} className={tier.auto_renew ? 'text-green-500 animate-spin-slow' : ''} />
                                Auto Renewal: <span className={tier.auto_renew ? 'text-green-500' : ''}>{tier.auto_renew ? 'ON' : 'OFF'}</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={tier.auto_renew} onChange={() => toggleAutoRenew(idx)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF424D]"></div>
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <AnimatePresence>
          {editingPlan && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-[40px] p-8 w-full max-w-md shadow-2xl"
                  >
                      <div className="flex justify-between items-center mb-8">
                          <h3 className="text-2xl font-black">New Plan</h3>
                          <button onClick={() => setEditingPlan(null)} className="text-gray-400 hover:text-gray-900"><X size={24} /></button>
                      </div>
                      
                      <div className="space-y-6">
                          <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Plan Name</label>
                              <input 
                                type="text"
                                placeholder="Gold Member, VIP, etc."
                                value={editingPlan.name}
                                onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#FF424D]/20"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Price (WYDA)</label>
                              <input 
                                type="number"
                                value={editingPlan.price}
                                onChange={(e) => setEditingPlan({...editingPlan, price: parseInt(e.target.value)})}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#FF424D]/20"
                              />
                          </div>
                          <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-bold text-gray-600 uppercase tracking-widest">Auto Renewal</span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" checked={editingPlan.auto_renew} onChange={(e) => setEditingPlan({...editingPlan, auto_renew: e.target.checked})} className="sr-only peer" />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF424D]"></div>
                              </label>
                          </div>
                          
                          <button 
                            onClick={() => {
                                if (!creator || !editingPlan.name) return;
                                const newPlan = {
                                    name: editingPlan.name,
                                    price: editingPlan.price || 0,
                                    perks: ["Exclusive content", "Direct messaging"],
                                    auto_renew: !!editingPlan.auto_renew
                                };
                                handleSave({ ...creator, tiers: [...creator.tiers, newPlan] });
                            }}
                            className="w-full py-4 bg-[#FF424D] text-white rounded-2xl font-black shadow-lg shadow-[#FF424D]/20 hover:bg-[#E63B45] transition-all"
                          >
                              Create Plan
                          </button>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default CreatorPanel;

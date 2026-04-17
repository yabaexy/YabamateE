import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Settings, 
  LayoutDashboard, 
  Save, 
  RefreshCcw,
  CheckCircle2,
  AlertCircle 
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Tier {
  id: string;
  name: string;
  price: number;
  features: string[];
  auto_renew: boolean;
}

export default function CreatorDashboard({ address }: { address: string }) {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [address]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/creator/profile?address=${address}`);
      const data = await res.json();
      if (data.creator) {
        setProfile(data.creator);
        setTiers(data.creator.tiers || []);
      }
    } catch (e) {
      console.error("Failed to fetch profile", e);
    } finally {
      setIsLoading(false);
    }
  };

  const addTier = () => {
    const newTier: Tier = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Tier',
      price: 10,
      features: ['Basic feature'],
      auto_renew: false
    };
    setTiers([...tiers, newTier]);
  };

  const removeTier = (id: string) => {
    setTiers(tiers.filter(t => t.id !== id));
  };

  const updateTier = (id: string, updates: Partial<Tier>) => {
    setTiers(tiers.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/creator/update-tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, tiers })
      });
      const data = await res.json();
      if (data.success) {
        alert("Plans updated successfully!");
      }
    } catch (e) {
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="py-20 text-center">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard size={24} className="text-[#FF424D]" />
            Creator Dashboard
          </h2>
          <p className="text-gray-500 text-sm">Manage your subscription tiers and growth settings.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={addTier}
            className="bg-white border border-gray-100 flex items-center gap-2 px-6 py-3 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all text-sm"
          >
            <Plus size={18} /> Add New Plan
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#FF424D] text-white flex items-center gap-2 px-6 py-3 rounded-2xl font-bold shadow-lg shadow-[#FF424D]/20 hover:bg-[#E63B45] transition-all text-sm disabled:opacity-50"
          >
            {isSaving ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {tiers.map((tier) => (
            <motion.div
              layout
              key={tier.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <input 
                  type="text" 
                  value={tier.name}
                  onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                  className="bg-transparent font-bold text-lg focus:outline-none border-b border-transparent focus:border-[#FF424D] w-2/3"
                />
                <button 
                  onClick={() => removeTier(tier.id)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Price (WYDA)</span>
                  <input 
                    type="number" 
                    value={tier.price}
                    onChange={(e) => updateTier(tier.id, { price: parseInt(e.target.value) })}
                    className="w-20 bg-gray-50 rounded-lg px-2 py-1 font-bold text-[#FF424D] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <RefreshCcw size={14} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-600">Auto-Renewal</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={tier.auto_renew}
                      onChange={(e) => updateTier(tier.id, { auto_renew: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF424D]"></div>
                  </label>
                </div>
              </div>

              <div className="text-xs text-gray-400 italic">
                {tier.auto_renew ? "Players' subscriptions will auto-renew." : "Players must manual renew each month."}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {tiers.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-[40px] text-gray-400">
            Click "Add New Plan" to start creating membership tiers.
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm">
          <AlertCircle size={24} />
        </div>
        <div>
          <h4 className="font-bold text-blue-900">Tier Management Info</h4>
          <p className="text-sm text-blue-700">Changes to pricing will only affect new subscribers. Existing subscribers keep their original price.</p>
        </div>
      </div>
    </div>
  );
}

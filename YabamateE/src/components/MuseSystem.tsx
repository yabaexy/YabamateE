import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  Trophy, 
  Calendar, 
  Zap, 
  Heart, 
  Sparkles, 
  Edit2,
  CheckCircle2,
  Lock,
  Shirt
} from 'lucide-react';
import { cn } from '../lib/utils';

interface MuseData {
  name: string;
  level: number;
  exp: number;
  charm: number;
  talent: number;
  fanbase: number;
  skin_id: string;
}

interface UserStats {
  ymp: number;
  daily_sponsorships: number;
  daily_amount: number;
  weekly_amount: number;
  total_amount: number;
  games_played: Record<string, boolean>;
}

export default function MuseSystem({ address }: { address: string }) {
  const [muse, setMuse] = useState<MuseData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'missions' | 'skins'>('status');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (address) {
      fetchMuseData();
    }
  }, [address]);

  const fetchMuseData = async () => {
    try {
      const res = await fetch(`/api/muse/${address}`);
      const data = await res.json();
      if (data.muse) {
        setMuse(data.muse);
        setNewName(data.muse.name);
      } else {
        await fetch('/api/muse/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, name: 'My Muse' })
        });
        fetchMuseData();
      }
      if (data.stats) setStats(data.stats);
    } catch (error) {
      console.error("Error fetching muse data", error);
    }
  };

  const updateName = async () => {
    try {
      await fetch('/api/muse/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, name: newName })
      });
      setMuse(prev => prev ? { ...prev, name: newName } : null);
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating name", error);
    }
  };

  if (!muse) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-12 h-12 border-4 border-[#FF424D] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const getCharacterImage = () => {
    let age = "child";
    if (muse.level > 50) age = "adult";
    else if (muse.level > 30) age = "teen";

    return `https://picsum.photos/seed/muse_${age}_${muse.skin_id}/600/800`;
  };

  const missions = [
    { id: 1, title: "Sponsor 3+ times", reward: 450, progress: stats?.daily_sponsorships || 0, total: 3, type: 'daily' },
    { id: 2, title: "Donate 250+ WYDA", reward: 650, progress: stats?.daily_amount || 0, total: 250, type: 'daily' },
    { id: 3, title: "Visit 5 Muse pages", reward: 350, progress: 2, total: 5, type: 'daily' },
    { id: 4, title: "Weekly 1,800+ WYDA", reward: 9000, progress: stats?.weekly_amount || 0, total: 1800, type: 'weekly' },
    { id: 5, title: "Sponsor 10+ creators", reward: 7500, progress: 4, total: 10, type: 'weekly' },
    { id: 6, title: "Play all 4 mini-games", reward: 200, progress: stats ? Object.values(stats.games_played || {}).filter(v => v === true).length : 0, total: 4, type: 'daily' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-xl relative aspect-[3/4] group">
          <img 
            src={getCharacterImage()} 
            alt="Muse" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />

          <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF424D] rounded-lg flex items-center justify-center text-white font-bold">
                {muse.level}
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Level</p>
                <p className="text-sm font-black text-gray-900">Rising Star</p>
              </div>
            </div>
          </div>

          <div className="absolute top-6 right-6 bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/10 text-white">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-black">{stats?.ymp || 0} YMP</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8 pt-20">
            <div className="flex items-center gap-3 mb-4">
              {isEditingName ? (
                <div className="flex gap-2">
                  <input 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white focus:outline-none"
                  />
                  <button onClick={updateName} className="bg-[#FF424D] text-white p-2 rounded-lg"><CheckCircle2 size={16} /></button>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-black text-white tracking-tight">{muse.name}</h2>
                  <button onClick={() => setIsEditingName(true)} className="text-white/50 hover:text-white"><Edit2 size={16} /></button>
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Charm</p>
                <p className="text-lg font-black text-white">{muse.charm}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Talent</p>
                <p className="text-lg font-black text-white">{muse.talent}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Fans</p>
                <p className="text-lg font-black text-white">{muse.fanbase}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Experience</span>
            <span className="text-sm font-black text-[#FF424D]">{muse.exp} / 1000</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(muse.exp / 1000) * 100}%` }}
              className="h-full bg-gradient-to-r from-[#FF424D] to-[#FF8A91]"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 space-y-6">
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          <button 
            onClick={() => setActiveTab('status')}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
              activeTab === 'status' ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Sparkles size={18} /> Status
          </button>
          <button 
            onClick={() => setActiveTab('missions')}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
              activeTab === 'missions' ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Trophy size={18} /> Missions
          </button>
          <button 
            onClick={() => setActiveTab('skins')}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
              activeTab === 'skins' ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Shirt size={18} /> Skins
          </button>
        </div>

        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'status' && (
              <motion.div
                key="status"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <Star className="text-yellow-400 fill-yellow-400" /> Recent Achievements
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                        <Heart size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Supporter</p>
                        <p className="text-sm font-bold">First Sponsor</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-3 opacity-40">
                      <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400">
                        <Lock size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Locked</p>
                        <p className="text-sm font-bold">Legendary</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#FF424D] to-[#FF8A91] rounded-[32px] p-8 text-white shadow-xl shadow-[#FF424D]/20">
                  <h3 className="text-xl font-black mb-2">Growth Tip</h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Sponsoring new creators gives your Muse a massive Talent boost! Try recurring sponsorships for daily YMP bonuses.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'missions' && (
              <motion.div
                key="missions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {missions.map((m) => (
                  <div key={m.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between group hover:border-[#FF424D] transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        m.type === 'daily' ? "bg-blue-50 text-blue-500" : "bg-purple-50 text-purple-500"
                      )}>
                        {m.type === 'daily' ? <Calendar size={24} /> : <Trophy size={24} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{m.title}</h4>
                        <p className="text-xs font-bold text-[#FF424D] uppercase tracking-wider">+{m.reward} YMP</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900 mb-1">{m.progress} / {m.total}</p>
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-900 transition-all" style={{ width: `${Math.min(100, (m.progress / m.total) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'skins' && (
              <motion.div
                key="skins"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 gap-4"
              >
                {['casual_1', 'idol_1', 'school_1', 'summer_1'].map((skin) => (
                  <div 
                    key={skin}
                    className={cn(
                      "bg-white rounded-3xl p-4 border-2 transition-all cursor-pointer group relative overflow-hidden",
                      muse.skin_id === skin ? "border-[#FF424D]" : "border-gray-100 hover:border-gray-200"
                    )}
                  >
                    <div className="aspect-square bg-gray-50 rounded-2xl mb-3 overflow-hidden">
                      <img src={`https://picsum.photos/seed/skin_${skin}/200/200`} alt={skin} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                    </div>
                    <p className="text-sm font-bold text-center capitalize">{skin.replace('_', ' ')}</p>
                    {muse.skin_id === skin && (
                      <div className="absolute top-2 right-2 bg-[#FF424D] text-white p-1 rounded-lg">
                        <CheckCircle2 size={12} />
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

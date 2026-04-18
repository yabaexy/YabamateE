import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Trophy, 
  CheckCircle2, 
  Circle, 
  ChevronLeft,
  Coins
} from 'lucide-react';
import Pong from './Pong';
import Tetris from './Tetris';
import Reversi from './Reversi';
import Backgammon from './Backgammon';

type GameId = 'pong' | 'tetris' | 'reversi' | 'backgammon';

interface GamePortalProps {
  onBalanceUpdate: (newBalance: number) => void;
  currentBalance: number;
}

const GamePortal: React.FC<GamePortalProps> = ({ onBalanceUpdate, currentBalance }) => {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [questStatus, setQuestStatus] = useState<Record<GameId, boolean>>({
    pong: false,
    tetris: false,
    reversi: false,
    backgammon: false
  });
  const [rewardClaimed, setRewardClaimed] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem('yaba_quest');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) {
        setQuestStatus(parsed.status);
        setRewardClaimed(parsed.claimed);
      } else {
        // Reset for new day
        localStorage.removeItem('yaba_quest');
      }
    }
  }, []);

  const updateQuest = (id: GameId) => {
    setQuestStatus(prev => {
      const next = { ...prev, [id]: true };
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('yaba_quest', JSON.stringify({
        date: today,
        status: next,
        claimed: rewardClaimed
      }));
      return next;
    });
  };

  const claimReward = () => {
    if (allGamesPlayed && !rewardClaimed) {
      const newBalance = currentBalance + 200;
      onBalanceUpdate(newBalance);
      setRewardClaimed(true);
      
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('yaba_quest', JSON.stringify({
        date: today,
        status: questStatus,
        claimed: true
      }));
    }
  };

  const allGamesPlayed = Object.values(questStatus).every(v => v);

  const games = [
    { id: 'pong', name: 'Pong', icon: '🏓', color: 'bg-blue-500' },
    { id: 'tetris', name: 'Tetris', icon: '🧱', color: 'bg-red-500' },
    { id: 'reversi', name: 'Reversi', icon: '⚪', color: 'bg-emerald-500' },
    { id: 'backgammon', name: 'Backgammon', icon: '🎲', color: 'bg-amber-700' },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Daily Quest Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
              <Trophy size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Daily Quest</h2>
              <p className="text-sm text-gray-500">Play all 4 games to earn 200 YMP</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1">
              {games.map(g => (
                <div key={g.id} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs overflow-hidden ${questStatus[g.id] ? 'bg-green-500' : 'bg-gray-100'}`}>
                  {questStatus[g.id] ? <CheckCircle2 size={14} className="text-white" /> : <span>{g.icon}</span>}
                </div>
              ))}
            </div>
            {allGamesPlayed && !rewardClaimed ? (
              <button 
                onClick={claimReward}
                className="bg-[#FF424D] text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 animate-bounce"
              >
                <Coins size={16} /> Claim 200 YMP
              </button>
            ) : rewardClaimed ? (
              <div className="text-green-500 font-bold text-sm flex items-center gap-1">
                <CheckCircle2 size={16} /> Reward Claimed
              </div>
            ) : (
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {Object.values(questStatus).filter(v => v).length} / 4 Games
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedGame ? (
          <motion.div 
            key="selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {games.map((game) => (
              <motion.div
                key={game.id}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer p-8 flex flex-col items-center group"
                onClick={() => setSelectedGame(game.id)}
              >
                <div className={`w-20 h-20 ${game.color} rounded-[24px] flex items-center justify-center text-4xl shadow-lg mb-6 group-hover:rotate-12 transition-transform`}>
                  {game.icon}
                </div>
                <h3 className="text-2xl font-black mb-2">{game.name}</h3>
                <div className="flex items-center gap-2">
                  {questStatus[game.id] ? (
                    <span className="text-xs font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle2 size={14} /> Completed
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <Circle size={14} /> Try it now
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="game-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <button 
              onClick={() => setSelectedGame(null)}
              className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#FF424D] transition-colors"
            >
              <ChevronLeft size={18} /> Back to Games
            </button>
            <div className="flex justify-center">
              {selectedGame === 'pong' && <Pong onComplete={() => updateQuest('pong')} />}
              {selectedGame === 'tetris' && <Tetris onComplete={() => updateQuest('tetris')} />}
              {selectedGame === 'reversi' && <Reversi onComplete={() => updateQuest('reversi')} />}
              {selectedGame === 'backgammon' && <Backgammon onComplete={() => updateQuest('backgammon')} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamePortal;

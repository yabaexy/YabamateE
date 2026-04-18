import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Play, ChevronRight, Hash } from 'lucide-react';

interface BackgammonProps {
  onComplete?: () => void;
}

const Backgammon: React.FC<BackgammonProps> = ({ onComplete }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');
  const [turn, setTurn] = useState<'player' | 'ai'>('player');
  const [dice, setDice] = useState<number[]>([1, 1]);
  const [positions, setPositions] = useState({ player: 0, ai: 0 });
  const [movesLeft, setMovesLeft] = useState(0);

  const WIN_SCORE = 24;

  const rollDice = () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setDice([d1, d2]);
    setMovesLeft(d1 + d2);
    
    if (turn === 'ai') {
      setTimeout(() => aiMove(d1 + d2), 1000);
    }
  };

  const playerMove = () => {
    if (turn !== 'player' || movesLeft === 0) return;
    
    const newPos = Math.min(WIN_SCORE, positions.player + movesLeft);
    setPositions(prev => ({ ...prev, player: newPos }));
    setMovesLeft(0);

    if (newPos >= WIN_SCORE) {
      setGameState('gameOver');
      if (onComplete) onComplete();
    } else {
      setTimeout(() => {
        setTurn('ai');
        rollDice();
      }, 500);
    }
  };

  const aiMove = (total: number) => {
    const newPos = Math.min(WIN_SCORE, positions.ai + total);
    setPositions(prev => ({ ...prev, ai: newPos }));
    setMovesLeft(0);

    if (newPos >= WIN_SCORE) {
      setGameState('gameOver');
      if (onComplete) onComplete();
    } else {
      setTimeout(() => {
        setTurn('player');
        setDice([0, 0]);
        setMovesLeft(0);
      }, 500);
    }
  };

  const reset = () => {
    setPositions({ player: 0, ai: 0 });
    setGameState('playing');
    setTurn('player');
    setDice([0, 0]);
    setMovesLeft(0);
  };

  return (
    <div className="bg-[#2D1B0B] p-6 rounded-3xl shadow-xl w-full max-w-sm mx-auto border-8 border-[#4A321F]">
      <div className="flex justify-between items-center mb-6">
        <div className="text-white">
          <div className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">Player</div>
          <div className="text-2xl font-mono">{positions.player} / {WIN_SCORE}</div>
        </div>
        <div className="flex gap-2">
          {dice.map((d, i) => (
            <div key={i} className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-inner font-bold text-lg text-black">
              {d || '?'}
            </div>
          ))}
        </div>
        <div className="text-white text-right">
          <div className="text-[10px] uppercase font-bold text-[#FF424D] tracking-widest">AI</div>
          <div className="text-2xl font-mono">{positions.ai} / {WIN_SCORE}</div>
        </div>
      </div>

      <div className="relative h-48 bg-[#1E1108] rounded-xl flex items-center justify-center p-4">
        {/* Simplified track representation */}
        <div className="w-full flex items-center justify-between relative px-4">
          <div className="absolute inset-0 flex justify-between px-2">
            {[...Array(WIN_SCORE/2)].map((_, i) => (
              <div key={i} className={`w-2 h-full ${i % 2 === 0 ? 'bg-[#3A2515]' : 'bg-[#2A180E]'}`} />
            ))}
          </div>

          <motion.div 
            animate={{ left: `${(positions.player / WIN_SCORE) * 100}%` }}
            className="absolute z-10 w-8 h-8 bg-amber-500 rounded-full border-2 border-amber-200 shadow-lg flex items-center justify-center text-xs font-bold"
          >
            P
          </motion.div>
          
          <motion.div 
            animate={{ left: `${(positions.ai / WIN_SCORE) * 100}%` }}
            className="absolute z-10 w-8 h-8 bg-[#FF424D] rounded-full border-2 border-[#FF8A91] shadow-lg flex items-center justify-center text-xs font-bold text-white"
          >
            A
          </motion.div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        {gameState === 'idle' ? (
          <button 
            onClick={() => setGameState('playing')}
            className="bg-[#FF424D] text-white px-8 py-3 rounded-full font-bold flex items-center gap-2"
          >
            <Play size={20} fill="currentColor" /> Play Backgammon
          </button>
        ) : gameState === 'gameOver' ? (
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-4">
              {positions.player >= WIN_SCORE ? 'You Won!' : 'AI Won!'}
            </h3>
            <button 
              onClick={reset}
              className="bg-amber-500 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2"
            >
              <RotateCcw size={20} /> Reset Race
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className={`text-sm font-bold uppercase tracking-widest ${turn === 'player' ? 'text-amber-500' : 'text-gray-500'}`}>
              {turn === 'player' ? "Your Move!" : "AI Thinking..."}
            </div>
            {turn === 'player' && (
              <div className="flex gap-4">
                {dice[0] === 0 ? (
                  <button onClick={rollDice} className="bg-amber-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                    <Hash size={18} /> Roll Dice
                  </button>
                ) : (
                  <button onClick={playerMove} className="bg-white text-black px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                    <ChevronRight size={18} /> Move {movesLeft} Steps
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Backgammon;

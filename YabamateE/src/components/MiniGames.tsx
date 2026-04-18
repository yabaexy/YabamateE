import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  RotateCcw, 
  ChevronLeft,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';

type GameType = 'pong' | 'tetris' | 'reversi' | 'backgammon';

export default function MiniGames({ address, onGameComplete }: { address: string, onGameComplete: () => void }) {
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [playedGames, setPlayedGames] = useState<Record<GameType, boolean>>({
    pong: false,
    tetris: false,
    reversi: false,
    backgammon: false
  });

  useEffect(() => {
    if (address) {
      fetchStatus();
    }
  }, [address]);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/muse/${address}`);
      const data = await res.json();
      if (data.stats && data.stats.games_played) {
        setPlayedGames(data.stats.games_played);
      }
    } catch (error) {
      console.error("Error fetching game status", error);
    }
  };

  const recordGamePlay = async (gameId: GameType) => {
    if (!address) return;
    try {
      const res = await fetch('/api/record-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, gameId })
      });
      const data = await res.json();
      if (data.success) {
        setPlayedGames(prev => ({ ...prev, [gameId]: true }));
        if (data.allPlayed) {
          alert("Congratulations! You've played all games today and earned 200 YMP!");
        }
        onGameComplete();
      }
    } catch (error) {
      console.error("Error recording game play", error);
    }
  };

  return (
    <div className="space-y-8">
      {!activeGame ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GameCard 
            id="pong" 
            title="Pong" 
            description="Classic paddle action. Hit the ball back!" 
            icon={<Gamepad2 />}
            played={playedGames.pong}
            onClick={() => setActiveGame('pong')}
          />
          <GameCard 
            id="tetris" 
            title="Tetris" 
            description="Stack blocks and clear lines." 
            icon={<Gamepad2 />}
            played={playedGames.tetris}
            onClick={() => setActiveGame('tetris')}
          />
          <GameCard 
            id="reversi" 
            title="Reversi" 
            description="Flip your opponent's pieces." 
            icon={<Gamepad2 />}
            played={playedGames.reversi}
            onClick={() => setActiveGame('reversi')}
          />
          <GameCard 
            id="backgammon" 
            title="Backgammon" 
            description="Race your checkers to the finish." 
            icon={<Gamepad2 />}
            played={playedGames.backgammon}
            onClick={() => setActiveGame('backgammon')}
          />
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <button 
              onClick={() => setActiveGame(null)}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={18} /> Back to Games
            </button>
            <h3 className="text-lg font-black capitalize">{activeGame}</h3>
            <div className="w-20" />
          </div>

          <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
            {activeGame === 'pong' && <PongGame onComplete={() => recordGamePlay('pong')} />}
            {activeGame === 'tetris' && <TetrisGame onComplete={() => recordGamePlay('tetris')} />}
            {activeGame === 'reversi' && <ReversiGame onComplete={() => recordGamePlay('reversi')} />}
            {activeGame === 'backgammon' && <BackgammonGame onComplete={() => recordGamePlay('backgammon')} />}
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
          <Zap size={24} className="fill-amber-600" />
        </div>
        <div>
          <h4 className="font-bold text-amber-900">Daily Game Challenge</h4>
          <p className="text-sm text-amber-700">Play all 4 mini-games today to earn <span className="font-black">200 YMP</span>!</p>
        </div>
        <div className="ml-auto flex gap-2">
          {Object.entries(playedGames).map(([id, played]) => (
            <div 
              key={id} 
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center border transition-all",
                played ? "bg-green-500 border-green-600 text-white" : "bg-white border-amber-200 text-amber-300"
              )}
              title={id}
            >
              {played ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GameCard({ title, description, icon, played, onClick }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-[#FF424D]/10 group-hover:text-[#FF424D] transition-all">
          {icon}
        </div>
        {played && (
          <div className="bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border border-green-100 flex items-center gap-1">
            <CheckCircle2 size={12} /> Played
          </div>
        )}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </motion.div>
  );
}

function PongGame({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballDX = 4;
    let ballDY = 4;
    let paddleY = canvas.height / 2 - 40;
    const paddleHeight = 80;
    const paddleWidth = 10;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      paddleY = e.clientY - rect.top - paddleHeight / 2;
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    const gameLoop = () => {
      if (isGameOver) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#1A1A1A';
      ctx.fillRect(10, paddleY, paddleWidth, paddleHeight);

      ctx.beginPath();
      ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
      ctx.fill();

      ballX += ballDX;
      ballY += ballDY;

      if (ballY < 0 || ballY > canvas.height) ballDY = -ballDY;
      if (ballX > canvas.width) ballDX = -ballDX;

      if (ballX < 20 && ballY > paddleY && ballY < paddleY + paddleHeight) {
        ballDX = -ballDX;
        setScore(s => s + 1);
      }

      if (ballX < 0) {
        setIsGameOver(true);
        onComplete();
      }

      requestAnimationFrame(gameLoop);
    };

    const animId = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isGameOver, onComplete]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-2xl font-black">Score: {score}</div>
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={400} 
        className="bg-gray-100 rounded-2xl border-4 border-gray-200 cursor-none"
      />
      {isGameOver && (
        <button 
          onClick={() => setIsGameOver(false)}
          className="bg-[#FF424D] text-white px-8 py-3 rounded-2xl font-bold"
        >
          Restart
        </button>
      )}
    </div>
  );
}

function TetrisGame({ onComplete }: { onComplete: () => void }) {
  const [grid] = useState<number[][]>(Array(15).fill(0).map(() => Array(10).fill(0)));
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setScore(s => {
        if (s >= 100) {
          setIsGameOver(true);
          onComplete();
          return s;
        }
        return s + 10;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver, onComplete]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-2xl font-black">Score: {score} / 100</div>
      <div className="grid grid-cols-10 gap-1 bg-gray-900 p-2 rounded-xl">
        {grid.map((row, y) => row.map((cell, x) => (
          <div 
            key={`${x}-${y}`} 
            className={cn(
              "w-6 h-6 rounded-sm",
              Math.random() > 0.8 ? "bg-[#FF424D]" : "bg-gray-800"
            )} 
          />
        )))}
      </div>
      <p className="text-sm text-gray-400 italic">Game finishes at 100 points...</p>
    </div>
  );
}

function ReversiGame({ onComplete }: { onComplete: () => void }) {
  const [board, setBoard] = useState<number[][]>(Array(8).fill(0).map(() => Array(8).fill(0)));
  const [turn, setTurn] = useState(1);
  const [moves, setMoves] = useState(0);

  const handleClick = (x: number, y: number) => {
    if (board[y][x] !== 0) return;
    const newBoard = [...board.map(r => [...r])];
    newBoard[y][x] = turn;
    setBoard(newBoard);
    setTurn(turn === 1 ? 2 : 1);
    setMoves(m => {
      if (m + 1 >= 10) {
        onComplete();
      }
      return m + 1;
    });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-2xl font-black">Moves: {moves} / 10</div>
      <div className="grid grid-cols-8 gap-1 bg-green-700 p-2 rounded-xl border-8 border-green-800 shadow-inner">
        {board.map((row, y) => row.map((cell, x) => (
          <div 
            key={`${x}-${y}`} 
            onClick={() => handleClick(x, y)}
            className="w-10 h-10 bg-green-600 border border-green-700 flex items-center justify-center cursor-pointer hover:bg-green-500 transition-colors"
          >
            {cell !== 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  "w-8 h-8 rounded-full shadow-md",
                  cell === 1 ? "bg-black" : "bg-white"
                )} 
              />
            )}
          </div>
        )))}
      </div>
    </div>
  );
}

function BackgammonGame({ onComplete }: { onComplete: () => void }) {
  const [dice, setDice] = useState<number[]>([1, 1]);
  const [rolls, setRolls] = useState(0);

  const rollDice = () => {
    setDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
    setRolls(r => {
      if (r + 1 >= 5) {
        onComplete();
      }
      return r + 1;
    });
  };

  return (
    <div className="flex flex-col items-center gap-12">
      <div className="text-2xl font-black">Rolls: {rolls} / 5</div>

      <div className="flex gap-8">
        {dice.map((d, i) => (
          <motion.div 
            key={i}
            animate={{ rotate: rolls * 90 }}
            className="w-20 h-20 bg-white border-4 border-gray-900 rounded-2xl flex items-center justify-center text-4xl font-black shadow-xl"
          >
            {d}
          </motion.div>
        ))}
      </div>

      <div className="w-full max-w-md h-40 bg-amber-100 border-4 border-amber-900 rounded-xl relative flex justify-around items-end p-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className={cn(
            "w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[100px]",
            i % 2 === 0 ? "border-b-amber-800" : "border-b-amber-200"
          )} />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <button 
            onClick={rollDice}
            className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition-all shadow-lg"
          >
            Roll Dice
          </button>
        </div>
      </div>
    </div>
  );
}

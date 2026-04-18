import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, User, Cpu } from 'lucide-react';

type Player = 'black' | 'white' | null;
type Board = Player[][];

const SIZE = 8;

interface ReversiProps {
  onComplete?: () => void;
}

const Reversi: React.FC<ReversiProps> = ({ onComplete }) => {
  const [board, setBoard] = useState<Board>([]);
  const [currentPlayer, setCurrentPlayer] = useState<'black' | 'white'>('black');
  const [gameOver, setGameOver] = useState(false);
  const [scores, setScores] = useState({ black: 2, white: 2 });
  const [status, setStatus] = useState<string>('Your Turn (Black)');

  const initBoard = useCallback(() => {
    const newBoard = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
    newBoard[3][3] = 'white';
    newBoard[3][4] = 'black';
    newBoard[4][3] = 'black';
    newBoard[4][4] = 'white';
    setBoard(newBoard);
    setCurrentPlayer('black');
    setGameOver(false);
    setScores({ black: 2, white: 2 });
    setStatus('Your Turn (Black)');
  }, []);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  const isValidMove = (r: number, c: number, player: 'black' | 'white', currentBoard: Board) => {
    if (currentBoard[r][c] !== null) return false;
    const opponent = player === 'black' ? 'white' : 'black';
    const directions = [
      [0, 1], [0, -1], [1, 0], [-1, 0],
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];

    for (const [dr, dc] of directions) {
      let nr = r + dr;
      let nc = c + dc;
      let hasOpponentBetween = false;

      while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
        if (currentBoard[nr][nc] === opponent) {
          hasOpponentBetween = true;
        } else if (currentBoard[nr][nc] === player) {
          if (hasOpponentBetween) return true;
          break;
        } else {
          break;
        }
        nr += dr;
        nc += dc;
      }
    }
    return false;
  };

  const getValidMoves = (player: 'black' | 'white', currentBoard: Board) => {
    const moves: [number, number][] = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (isValidMove(r, c, player, currentBoard)) {
          moves.push([r, c]);
        }
      }
    }
    return moves;
  };

  const makeMove = (r: number, c: number, player: 'black' | 'white') => {
    if (!isValidMove(r, c, player, board)) return;

    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = player;
    const opponent = player === 'black' ? 'white' : 'black';
    const directions = [
      [0, 1], [0, -1], [1, 0], [-1, 0],
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];

    for (const [dr, dc] of directions) {
      let nr = r + dr;
      let nc = c + dc;
      const toFlip: [number, number][] = [];

      while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
        if (newBoard[nr][nc] === opponent) {
          toFlip.push([nr, nc]);
        } else if (newBoard[nr][nc] === player) {
          toFlip.forEach(([fr, fc]) => {
            newBoard[fr][fc] = player;
          });
          break;
        } else {
          break;
        }
        nr += dr;
        nc += dc;
      }
    }

    const blackScore = newBoard.flat().filter(cell => cell === 'black').length;
    const whiteScore = newBoard.flat().filter(cell => cell === 'white').length;
    setScores({ black: blackScore, white: whiteScore });
    setBoard(newBoard);

    const nextPlayer = opponent;
    const nextMoves = getValidMoves(nextPlayer, newBoard);
    
    if (nextMoves.length > 0) {
      setCurrentPlayer(nextPlayer);
      setStatus(nextPlayer === 'black' ? 'Your Turn' : 'AI Thinking...');
    } else {
      const otherPlayerMoves = getValidMoves(player, newBoard);
      if (otherPlayerMoves.length > 0) {
        setStatus(`Opponent skips, still ${player}'s turn`);
      } else {
        setGameOver(true);
        setStatus('Game Over');
        if (onComplete) onComplete();
      }
    }
  };

  // AI Turn
  useEffect(() => {
    if (currentPlayer === 'white' && !gameOver) {
      const timer = setTimeout(() => {
        const moves = getValidMoves('white', board);
        if (moves.length > 0) {
          // Semi-intelligent: Prefer corners
          const corners = moves.filter(([r, c]) => (r === 0 || r === 7) && (c === 0 || c === 7));
          const move = corners.length > 0 ? corners[0] : moves[Math.floor(Math.random() * moves.length)];
          makeMove(move[0], move[1], 'white');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, board, gameOver]);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-sm mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className={`p-3 rounded-2xl flex items-center gap-3 ${currentPlayer === 'black' ? 'bg-black text-white' : 'bg-gray-100'}`}>
          <User size={20} />
          <div className="text-sm font-bold">{scores.black}</div>
        </div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{status}</div>
        <div className={`p-3 rounded-2xl flex items-center gap-3 ${currentPlayer === 'white' ? 'bg-[#FF424D] text-white shadow-lg shadow-[#FF424D]/20' : 'bg-gray-100'}`}>
          <div className="text-sm font-bold">{scores.white}</div>
          <Cpu size={20} />
        </div>
      </div>

      <div className="grid grid-cols-8 gap-1 bg-emerald-700 p-1 rounded-lg border-4 border-emerald-900 shadow-inner">
        {board.map((row, rIdx) => row.map((cell, cIdx) => {
          const valid = currentPlayer === 'black' && isValidMove(rIdx, cIdx, 'black', board);
          return (
            <div 
              key={`${rIdx}-${cIdx}`}
              onClick={() => valid && makeMove(rIdx, cIdx, 'black')}
              className={`aspect-square relative rounded-sm flex items-center justify-center transition-colors ${valid ? 'bg-emerald-600/50 cursor-pointer hover:bg-emerald-600' : 'bg-emerald-600/20'}`}
            >
              {valid && <div className="w-2 h-2 rounded-full bg-black/20" />}
              <AnimatePresence>
                {cell && (
                  <motion.div 
                    initial={{ scale: 0, rotateY: 180 }}
                    animate={{ scale: 0.8, rotateY: 0 }}
                    className={`w-full h-full rounded-full shadow-md ${cell === 'black' ? 'bg-black' : 'bg-gray-100'}`}
                  />
                )}
              </AnimatePresence>
            </div>
          );
        }))}
      </div>

      {gameOver && (
        <div className="mt-6 flex flex-col items-center">
            <h3 className="text-xl font-bold mb-2">
                {scores.black > scores.white ? 'You Won!' : scores.black < scores.white ? 'AI Won!' : 'Draw!'}
            </h3>
            <button 
                onClick={initBoard}
                className="bg-[#FF424D] text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-all"
            >
                <RotateCcw size={20} /> Play Again
            </button>
        </div>
      )}
    </div>
  );
};

export default Reversi;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw, ArrowLeft, ArrowRight, ArrowDown, RotateCw } from 'lucide-react';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 20;

type Shape = number[][];

const SHAPES: { [key: string]: Shape } = {
  I: [[1, 1, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
  O: [[1, 1], [1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  T: [[0, 1, 0], [1, 1, 1]],
  Z: [[1, 1, 0], [0, 1, 1]],
};

const COLORS = ['#FF424D', '#4D96FF', '#6BCB77', '#FFD93D', '#FF9292', '#B983FF', '#867070'];

interface TetrisProps {
  onComplete?: () => void;
}

const Tetris: React.FC<TetrisProps> = ({ onComplete }) => {
  const [grid, setGrid] = useState<number[][]>(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const [pos, setPos] = useState({ x: 3, y: 0 });
  const [activeShape, setActiveShape] = useState<Shape>(SHAPES.I);
  const [colorIdx, setColorIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const spawnShape = useCallback(() => {
    const keys = Object.keys(SHAPES);
    const key = keys[Math.floor(Math.random() * keys.length)];
    const shape = SHAPES[key];
    setActiveShape(shape);
    setPos({ x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 });
    setColorIdx(Math.floor(Math.random() * COLORS.length));
    
    // Check if spawn is blocked
    if (checkCollision(shape, Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), 0, grid)) {
      setGameOver(true);
      setIsPaused(true);
      if (onComplete) onComplete();
    }
  }, [grid, onComplete]);

  const checkCollision = (shape: Shape, x: number, y: number, currentGrid: number[][]) => {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] !== 0) {
          const nextIdxX = x + col;
          const nextIdxY = y + row;
          if (nextIdxX < 0 || nextIdxX >= COLS || nextIdxY >= ROWS || (nextIdxY >= 0 && currentGrid[nextIdxY][nextIdxX] !== 0)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const rotate = (matrix: Shape) => {
    const rotated = matrix[0].map((_, index) => matrix.map(col => col[index]).reverse());
    if (!checkCollision(rotated, pos.x, pos.y, grid)) {
      setActiveShape(rotated);
    }
  };

  const move = (dx: number, dy: number) => {
    if (!checkCollision(activeShape, pos.x + dx, pos.y + dy, grid)) {
      setPos(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      return true;
    }
    if (dy > 0) {
      lockShape();
    }
    return false;
  };

  const lockShape = () => {
    const newGrid = grid.map(row => [...row]);
    activeShape.forEach((row, rIdx) => {
      row.forEach((cell, cIdx) => {
        if (cell !== 0) {
          if (pos.y + rIdx >= 0) {
            newGrid[pos.y + rIdx][pos.x + cIdx] = colorIdx + 1;
          }
        }
      });
    });

    // Clear lines
    let linesCleared = 0;
    const filteredGrid = newGrid.filter(row => {
      const isFull = row.every(cell => cell !== 0);
      if (isFull) linesCleared++;
      return !isFull;
    });

    while (filteredGrid.length < ROWS) {
      filteredGrid.unshift(Array(COLS).fill(0));
    }

    setGrid(filteredGrid);
    if (linesCleared > 0) {
      setScore(prev => prev + (linesCleared === 1 ? 100 : linesCleared === 2 ? 300 : linesCleared === 3 ? 500 : 800));
    }
    spawnShape();
  };

  useEffect(() => {
    if (isPaused || gameOver) return;
    timerRef.current = setInterval(() => {
      move(0, 1);
    }, 800 - Math.min(score / 10, 500));
    return () => clearInterval(timerRef.current!);
  }, [isPaused, gameOver, pos, activeShape, grid, score]);

  const reset = () => {
    setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    spawnShape();
  };

  return (
    <div className="bg-gray-900 p-6 rounded-3xl shadow-xl flex flex-col items-center w-full max-w-sm mx-auto">
      <div className="w-full flex justify-between mb-4">
        <div>
          <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">Score</span>
          <div className="text-2xl font-mono text-white tracking-widest">{score.toString().padStart(5, '0')}</div>
        </div>
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className="bg-gray-800 text-gray-400 p-2 rounded-lg hover:text-white"
        >
          {isPaused ? <Play size={20} /> : <div className="w-5 h-5 flex justify-center gap-1"><div className="w-1.5 bg-current" /><div className="w-1.5 bg-current" /></div>}
        </button>
      </div>

      <div className="relative border-4 border-gray-800 rounded-lg overflow-hidden bg-black/50" style={{ width: COLS * BLOCK_SIZE, height: ROWS * BLOCK_SIZE }}>
        {grid.map((row, rIdx) => row.map((cell, cIdx) => (
          cell !== 0 && (
            <div key={`${rIdx}-${cIdx}`} className="absolute" style={{
              width: BLOCK_SIZE - 1,
              height: BLOCK_SIZE - 1,
              left: cIdx * BLOCK_SIZE,
              top: rIdx * BLOCK_SIZE,
              backgroundColor: COLORS[cell - 1],
              border: '2px solid rgba(255,255,255,0.2)'
            }} />
          )
        )))}
        
        {!gameOver && activeShape.map((row, rIdx) => row.map((cell, cIdx) => (
          cell !== 0 && (
            <div key={`active-${rIdx}-${cIdx}`} className="absolute" style={{
              width: BLOCK_SIZE - 1,
              height: BLOCK_SIZE - 1,
              left: (pos.x + cIdx) * BLOCK_SIZE,
              top: (pos.y + rIdx) * BLOCK_SIZE,
              backgroundColor: COLORS[colorIdx],
              border: '2px solid rgba(255,255,255,0.4)',
              boxShadow: '0 0 10px rgba(255,255,255,0.1)'
            }} />
          )
        )))}

        {(isPaused || gameOver) && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center">
            {gameOver ? (
              <>
                <h3 className="text-2xl font-bold text-white mb-2">Game Over</h3>
                <p className="text-[#FF424D] text-lg font-bold mb-6">Score: {score}</p>
                <button 
                  onClick={reset}
                  className="bg-[#FF424D] text-white px-8 py-3 rounded-full font-bold flex items-center gap-2"
                >
                  <RotateCcw size={20} /> Try Again
                </button>
              </>
            ) : (
                <button 
                  onClick={() => {
                    if (grid.every(r => r.every(c => c === 0))) reset();
                    else setIsPaused(false);
                  }}
                  className="bg-[#FF424D] text-white px-8 py-3 rounded-full font-bold flex items-center gap-2"
                >
                  <Play size={20} fill="currentColor" /> {grid.every(r => r.every(c => c === 0)) ? 'Start' : 'Resume'}
                </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 w-full">
        <div />
        <button onClick={() => rotate(activeShape)} className="p-4 bg-gray-800 rounded-2xl flex justify-center text-white"><RotateCw size={24} /></button>
        <div />
        <button onClick={() => move(-1, 0)} className="p-4 bg-gray-800 rounded-2xl flex justify-center text-white"><ArrowLeft size={24} /></button>
        <button onClick={() => move(0, 1)} className="p-4 bg-gray-800 rounded-2xl flex justify-center text-white"><ArrowDown size={24} /></button>
        <button onClick={() => move(1, 0)} className="p-4 bg-gray-800 rounded-2xl flex justify-center text-white"><ArrowRight size={24} /></button>
      </div>
    </div>
  );
};

export default Tetris;

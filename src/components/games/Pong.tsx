import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, RotateCcw, Play } from 'lucide-react';

interface PongProps {
  onComplete?: () => void;
}

const Pong: React.FC<PongProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');
  const [score, setScore] = useState({ player: 0, ai: 0 });
  
  const paddleHeight = 60;
  const paddleWidth = 10;
  const ballSize = 8;
  
  const stateRef = useRef({
    playerY: 120,
    aiY: 120,
    ballX: 200,
    ballY: 150,
    ballSpeedX: 4,
    ballSpeedY: 2,
    canvasHeight: 300,
    canvasWidth: 400
  });

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const update = () => {
      const state = stateRef.current;
      
      // Move Ball
      state.ballX += state.ballSpeedX;
      state.ballY += state.ballSpeedY;

      // Wall Collision (Top/Bottom)
      if (state.ballY <= 0 || state.ballY >= state.canvasHeight) {
        state.ballSpeedY = -state.ballSpeedY;
      }

      // AI Movement
      const aiMid = state.aiY + paddleHeight / 2;
      if (aiMid < state.ballY - 10) state.aiY += 3;
      if (aiMid > state.ballY + 10) state.aiY -= 3;

      // Paddle Collisions
      // Player
      if (state.ballX <= paddleWidth) {
        if (state.ballY > state.playerY && state.ballY < state.playerY + paddleHeight) {
          state.ballSpeedX = -state.ballSpeedX * 1.05;
          const deltaY = state.ballY - (state.playerY + paddleHeight / 2);
          state.ballSpeedY = deltaY * 0.2;
        } else {
          setScore(prev => {
            const next = { ...prev, ai: prev.ai + 1 };
            if (next.ai >= 5) {
              setGameState('gameOver');
              if (onComplete) onComplete();
            }
            resetBall();
            return next;
          });
        }
      }

      // AI
      if (state.ballX >= state.canvasWidth - paddleWidth) {
        if (state.ballY > state.aiY && state.ballY < state.aiY + paddleHeight) {
          state.ballSpeedX = -state.ballSpeedX * 1.05;
          const deltaY = state.ballY - (state.aiY + paddleHeight / 2);
          state.ballSpeedY = deltaY * 0.2;
        } else {
          setScore(prev => {
            const next = { ...prev, player: prev.player + 1 };
            if (next.player >= 5) {
              setGameState('gameOver');
              if (onComplete) onComplete();
            }
            resetBall();
            return next;
          });
        }
      }

      draw();
      animationFrameId = requestAnimationFrame(update);
    };

    const resetBall = () => {
      stateRef.current.ballX = stateRef.current.canvasWidth / 2;
      stateRef.current.ballY = stateRef.current.canvasHeight / 2;
      stateRef.current.ballSpeedX = Math.random() > 0.5 ? 4 : -4;
      stateRef.current.ballSpeedY = (Math.random() - 0.5) * 4;
    };

    const draw = () => {
      const { playerY, aiY, ballX, ballY, canvasWidth, canvasHeight } = stateRef.current;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      
      // Background
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Center line
      ctx.setLineDash([5, 15]);
      ctx.beginPath();
      ctx.moveTo(canvasWidth / 2, 0);
      ctx.lineTo(canvasWidth / 2, canvasHeight);
      ctx.strokeStyle = '#333';
      ctx.stroke();

      // Paddles
      ctx.fillStyle = '#FF424D';
      ctx.fillRect(0, playerY, paddleWidth, paddleHeight);
      ctx.fillRect(canvasWidth - paddleWidth, aiY, paddleWidth, paddleHeight);

      // Ball
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      stateRef.current.playerY = Math.max(0, Math.min(stateRef.current.canvasHeight - paddleHeight, mouseY - paddleHeight / 2));
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const touchY = e.touches[0].clientY - rect.top;
      stateRef.current.playerY = Math.max(0, Math.min(stateRef.current.canvasHeight - paddleHeight, touchY - paddleHeight / 2));
      e.preventDefault();
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    update();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gameState, onComplete]);

  return (
    <div className="flex flex-col items-center bg-gray-900 p-6 rounded-3xl shadow-xl w-full max-w-md mx-auto">
      <div className="flex justify-between w-full mb-4 text-white font-mono text-2xl">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400 uppercase">You</span>
          <span>{score.player}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400 uppercase">CPU</span>
          <span>{score.ai}</span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border-2 border-gray-800">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={300} 
          className="cursor-none"
        />
        
        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center">
            {gameState === 'idle' ? (
              <>
                <h3 className="text-xl font-bold text-white mb-2">Retro Pong</h3>
                <p className="text-gray-400 text-sm mb-6">First to 5 points wins. Use your mouse or touch to move paddle.</p>
                <button 
                  onClick={() => setGameState('playing')}
                  className="bg-[#FF424D] text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-all"
                >
                  <Play size={20} fill="currentColor" /> Start Game
                </button>
              </>
            ) : (
              <>
                <Trophy size={48} className={score.player > score.ai ? "text-yellow-400 mb-4" : "text-gray-400 mb-4"} />
                <h3 className="text-2xl font-bold text-white mb-2">
                  {score.player > score.ai ? "You Win!" : "AI Wins!"}
                </h3>
                <p className="text-gray-400 mb-6">Score: {score.player} - {score.ai}</p>
                <button 
                  onClick={() => {
                    setScore({ player: 0, ai: 0 });
                    setGameState('playing');
                  }}
                  className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-all"
                >
                  <RotateCcw size={20} /> Play Again
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pong;

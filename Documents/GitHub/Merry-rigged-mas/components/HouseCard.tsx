
import React, { useState, useRef, useEffect } from 'react';
import { House } from '../types';
import { Trophy, Snowflake, AlertCircle, TrendingUp } from 'lucide-react';
import { playBoing } from '../services/soundService';

interface HouseCardProps {
  house: House;
  voteCount: number;
  onVote: (id: number) => void;
  disabled: boolean;
}

const ChristmasLights: React.FC = () => {
  const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-400'];
  const lights = [];
  
  const getDelay = () => (Math.random() * 2).toFixed(2);
  
  // Top lights
  for (let i = 0; i < 6; i++) {
    lights.push({ 
       className: colors[i % 4],
       style: { top: '-5px', left: `${15 + i * 14}%`, animationDelay: `${getDelay()}s` }
    });
  }
  // Right lights
  for (let i = 0; i < 8; i++) {
    lights.push({ 
       className: colors[(i+1) % 4],
       style: { right: '-5px', top: `${10 + i * 11}%`, animationDelay: `${getDelay()}s` }
    });
  }
  // Bottom lights
  for (let i = 0; i < 6; i++) {
    lights.push({ 
       className: colors[(i+2) % 4],
       style: { bottom: '-5px', left: `${15 + i * 14}%`, animationDelay: `${getDelay()}s` }
    });
  }
  // Left lights
  for (let i = 0; i < 8; i++) {
    lights.push({ 
       className: colors[(i+3) % 4],
       style: { left: '-5px', top: `${10 + i * 11}%`, animationDelay: `${getDelay()}s` }
    });
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-50 rounded-2xl">
      <style>{`
        @keyframes flash {
          0%, 100% { opacity: 1; transform: scale(1.1); filter: brightness(1.5); box-shadow: 0 0 8px currentColor; }
          50% { opacity: 0.3; transform: scale(0.8); filter: brightness(0.8); box-shadow: none; }
        }
      `}</style>
      
      {/* Wire */}
      <div className="absolute inset-0 border-2 border-slate-700/50 rounded-2xl" />

      {lights.map((l, i) => (
        <div 
          key={i}
          className={`absolute w-2.5 h-2.5 rounded-full ${l.className}`}
          style={{
            ...l.style,
            animation: `flash 1.2s infinite ease-in-out`
          }}
        />
      ))}
    </div>
  );
};

const HouseCard: React.FC<HouseCardProps> = ({ house, voteCount, onVote, disabled }) => {
  const [style, setStyle] = useState({ x: 0, y: 0, rotate: 0 });
  const [attempts, setAttempts] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [overlayText, setOverlayText] = useState("Wrong choice!");
  const cardRef = useRef<HTMLDivElement>(null);
  const resetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animation state for vote count updates
  const [isVoteAnimating, setIsVoteAnimating] = useState(false);
  const isFirstRender = useRef(true);

  // Trigger animation when vote count changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsVoteAnimating(true);
    const timer = setTimeout(() => setIsVoteAnimating(false), 500); // 500ms duration
    return () => clearTimeout(timer);
  }, [voteCount]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (resetTimeout.current) clearTimeout(resetTimeout.current);
    };
  }, []);

  const triggerJump = () => {
      if (resetTimeout.current) clearTimeout(resetTimeout.current);

      playBoing();

      // Mobile optimization: Smaller jump radius so it stays somewhat on screen
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const range = isMobile ? 120 : 450; 

      const x = (Math.random() - 0.5) * range;
      const y = (Math.random() - 0.5) * range;
      const rotate = (Math.random() - 0.5) * 45; // +/- 22.5 deg rotation
      
      setStyle({ x, y, rotate });

      // Reset after delay
      resetTimeout.current = setTimeout(() => {
        setStyle({ x: 0, y: 0, rotate: 0 });
      }, 1200);
  };

  const handleMouseEnter = () => {
    if (house.isTheOne || disabled) return;

    // Randomize overlay text for humor
    const messages = [
        "Wrong choice!", 
        "Really?", 
        "Don't do it.", 
        "Pick #7!", 
        "Bad idea.", 
        "Seriously?", 
        "Nope.", 
        "Try again."
    ];
    setOverlayText(messages[Math.floor(Math.random() * messages.length)]);

    // Check if device supports hover (Desktop) to avoid double-triggering on mobile taps
    const canHover = window.matchMedia('(hover: hover)').matches;

    if (canHover) {
        // Desktop behavior: visual harassment
        // 50% chance to jump away, 50% chance to just shake judgmentally
        if (Math.random() > 0.5) {
            triggerJump();
        } else {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
        }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    
    if (house.isTheOne) {
        onVote(house.id);
        setStyle({ x: 0, y: 0, rotate: 0 });
        return;
    }

    // Logic: Keep shuffling until 3 attempts are made
    if (attempts < 3) {
        e.stopPropagation();
        setAttempts(prev => prev + 1);
        triggerJump();
    } else {
        // They persisted! Let them proceed to the rigged vote modal
        onVote(house.id);
        setStyle({ x: 0, y: 0, rotate: 0 });
        setAttempts(0); // Reset logic for next time
    }
  };

  return (
    <div 
      className="relative transition-all duration-300 ease-out z-0 hover:z-20 touch-manipulation h-full"
      style={{ transform: `translate(${style.x}px, ${style.y}px) rotate(${style.rotate}deg)` }}
      onMouseEnter={handleMouseEnter}
    >
      <style>{`
        @keyframes flash {
          0%, 100% { opacity: 1; transform: scale(1.1); filter: brightness(1.5); box-shadow: 0 0 8px currentColor; }
          50% { opacity: 0.3; transform: scale(0.8); filter: brightness(0.8); box-shadow: none; }
        }
        @keyframes shake-card {
           0%, 100% { transform: translateX(0); }
           25% { transform: translateX(-5px) rotate(-2deg); }
           75% { transform: translateX(5px) rotate(2deg); }
        }
      `}</style>
      
      <div 
        ref={cardRef}
        className={`
          group relative overflow-hidden rounded-2xl border-2 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 select-none h-full flex flex-col
          ${house.isTheOne 
            ? 'border-yellow-400/50 bg-gradient-to-b from-slate-800 to-slate-900 ring-4 ring-yellow-400/20' 
            : 'border-white/10 bg-slate-800/80 hover:bg-slate-800'
          }
          ${isShaking ? 'animate-[shake-card_0.4s_ease-in-out]' : ''}
        `}
        onClick={handleClick}
      >
        {/* Glowing effect for the main house */}
        {house.isTheOne && (
          <div className="absolute inset-0 bg-yellow-500/10 animate-pulse pointer-events-none" />
        )}

        {/* Image Placeholder */}
        <div className="h-32 md:h-48 w-full overflow-hidden bg-slate-900 relative shrink-0">
          <img 
            src={house.imageUrl} 
            alt={`House ${house.id}`}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
            draggable={false}
          />
          
          {/* Vote Count Badge Overlay */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
             <div className={`
                bg-black/60 backdrop-blur-md text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-mono border border-white/10 shadow-lg flex items-center gap-1 transition-all duration-300 transform origin-left
                ${isVoteAnimating ? 'scale-110 bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.8)] border-yellow-300 font-bold' : ''}
             `}>
               <TrendingUp size={12} className={`transition-colors duration-300 ${house.isTheOne ? "text-green-400" : "text-slate-400"} ${isVoteAnimating ? 'text-black' : ''}`} />
               {voteCount.toLocaleString()} votes
             </div>
          </div>

          {house.isTheOne && (
             <div className="absolute top-2 right-2 bg-yellow-400 text-black font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow-[0_0_15px_rgba(250,204,21,0.6)] z-10">
               <Trophy size={12} />
               <span className="hidden md:inline">FAN FAVORITE</span>
             </div>
          )}
        </div>

        {/* Content */}
        <div className="p-2 md:p-5 relative z-10 flex-grow flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start mb-2 gap-1 md:gap-0">
            <h3 className="text-xs md:text-xl font-bold text-white festive-font tracking-wide leading-tight">
              {house.address}
            </h3>
            <span className={`px-2 py-0.5 rounded text-[10px] md:text-xs font-mono border ${house.isTheOne ? 'border-yellow-500 text-yellow-400' : 'border-slate-600 text-slate-400'}`}>
              #{house.id}
            </span>
          </div>
          
          <p className="text-[10px] md:text-sm text-slate-300 mb-3 md:mb-4 line-clamp-2 leading-snug flex-grow">
            {house.description}
          </p>

          <div className="mt-auto">
            <button 
                className={`
                w-full py-2.5 md:py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-colors
                ${house.isTheOne 
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg hover:from-yellow-400 hover:to-amber-500' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }
                `}
            >
                {house.isTheOne ? (
                <>
                    <Snowflake size={16} /> VOTE NOW
                </>
                ) : (
                'Vote'
                )}
            </button>
          </div>
        </div>

        {/* Funny overlay for non-winners on hover - Desktop only mainly */}
        {!house.isTheOne && (
          <div className="hidden md:flex absolute inset-0 bg-black/60 flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
            <AlertCircle className="text-red-500 mb-2 animate-bounce" />
            <p className="text-white font-bold text-center px-4 festive-font text-xl transform -rotate-3">{overlayText}</p>
          </div>
        )}
      </div>
      
      {/* Decorative Lights Wrapper */}
      <ChristmasLights />
    </div>
  );
};

export default HouseCard;

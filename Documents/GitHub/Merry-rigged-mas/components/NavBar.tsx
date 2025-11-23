import React from 'react';
import { Home, Trophy, MessageSquare, Snowflake } from 'lucide-react';

interface NavBarProps {
  currentView: 'vote' | 'standings' | 'comments';
  onNavigate: (view: 'vote' | 'standings' | 'comments') => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentView, onNavigate }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md shadow-2xl transition-all duration-300" role="navigation" aria-label="Main navigation">
      
      {/* Candy Cane Stripe Border */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1.5 w-full z-50" 
        style={{
          background: 'repeating-linear-gradient(45deg, #ef4444, #ef4444 10px, #ffffff 10px, #ffffff 20px, #22c55e 20px, #22c55e 30px, #ffffff 30px, #ffffff 40px)'
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 relative">
          
          {/* Logo / Brand */}
          <button 
            className="flex items-center gap-2 font-bold text-xl festive-font text-white cursor-pointer group focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg p-2 -m-2" 
            onClick={() => onNavigate('vote')}
            aria-label="Go to voting page"
          >
            <div className="relative">
               <Snowflake className="text-blue-200 animate-spin-slow group-hover:text-white transition-colors" size={24} aria-hidden="true" />
               <div className="absolute inset-0 bg-blue-400/20 blur-md rounded-full animate-pulse" aria-hidden="true"></div>
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-white to-green-500 drop-shadow-sm">
              Light up the Loop
            </span>
          </button>

          {/* Nav Links */}
          <div className="flex bg-slate-800/80 p-1.5 rounded-full border border-white/10 overflow-x-auto shadow-inner" role="tablist">
            <button
              onClick={() => onNavigate('vote')}
              role="tab"
              aria-selected={currentView === 'vote'}
              aria-controls="vote-panel"
              className={`
                flex items-center gap-2 px-3 py-2 md:px-4 rounded-full text-sm font-bold transition-all whitespace-nowrap duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-800
                ${currentView === 'vote' 
                  ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)] scale-105' 
                  : 'text-slate-400 hover:text-red-400 hover:bg-white/5'
                }
              `}
            >
              <Home size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Vote</span>
              <span className="sr-only">for houses</span>
            </button>
            
            <button
              onClick={() => onNavigate('standings')}
              role="tab"
              aria-selected={currentView === 'standings'}
              aria-controls="standings-panel"
              className={`
                flex items-center gap-2 px-3 py-2 md:px-4 rounded-full text-sm font-bold transition-all whitespace-nowrap duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-800
                ${currentView === 'standings' 
                  ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.5)] scale-105' 
                  : 'text-slate-400 hover:text-yellow-400 hover:bg-white/5'
                }
              `}
            >
              <Trophy size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Standings</span>
              <span className="sr-only">and leaderboard</span>
            </button>
            
            <button
              onClick={() => onNavigate('comments')}
              role="tab"
              aria-selected={currentView === 'comments'}
              aria-controls="comments-panel"
              className={`
                flex items-center gap-2 px-3 py-2 md:px-4 rounded-full text-sm font-bold transition-all whitespace-nowrap duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-800
                ${currentView === 'comments' 
                  ? 'bg-green-600 text-white shadow-[0_0_10px_rgba(22,163,74,0.5)] scale-105' 
                  : 'text-slate-400 hover:text-green-400 hover:bg-white/5'
                }
              `}
            >
              <MessageSquare size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Guest Book</span>
              <span className="sr-only">community messages</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
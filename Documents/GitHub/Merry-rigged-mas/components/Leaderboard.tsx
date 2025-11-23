import React from 'react';
import { House } from '../types';
import { Trophy, Medal, AlertCircle } from 'lucide-react';

interface LeaderboardProps {
  houses: House[];
  votes: Record<number, number>;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ houses, votes }) => {
  // Sort houses by votes descending
  const sortedHouses = [...houses].sort((a, b) => {
    const votesA = votes[a.id] || 0;
    const votesB = votes[b.id] || 0;
    return votesB - votesA;
  });

  return (
    <div className="w-full max-w-2xl mx-auto mt-16 mb-12 bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-2xl text-white festive-font font-bold flex items-center gap-2">
          <Trophy className="text-yellow-400" /> Official Standings
        </h2>
        <span className="text-xs bg-black/30 px-2 py-1 rounded text-red-100 border border-white/10">
          Live Updates
        </span>
      </div>
      
      <div className="p-2">
        {sortedHouses.map((house, index) => {
          const voteCount = votes[house.id] || 0;
          const isWinner = index === 0;
          
          return (
            <div 
              key={house.id}
              className={`
                relative flex items-center p-4 mb-2 rounded-xl transition-all duration-500
                ${isWinner 
                  ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border border-yellow-500/30' 
                  : 'hover:bg-white/5 border border-transparent'
                }
              `}
            >
              {/* Rank */}
              <div className={`
                w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg mr-4 shrink-0
                ${isWinner ? 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'bg-slate-700 text-slate-400'}
              `}>
                {index + 1}
              </div>

              {/* House Info */}
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold ${isWinner ? 'text-yellow-400' : 'text-slate-200'}`}>
                    {house.address}
                  </h3>
                  {house.isTheOne && (
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-500/20">
                      WINNING
                    </span>
                  )}
                </div>
                {/* Progress Bar Background */}
                <div className="mt-2 h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
                   <div 
                     className={`h-full rounded-full transition-all duration-1000 ${isWinner ? 'bg-yellow-400' : 'bg-slate-500'}`}
                     style={{ width: `${Math.min((voteCount / (votes[sortedHouses[0].id] || 1)) * 100, 100)}%` }}
                   />
                </div>
              </div>

              {/* Vote Count */}
              <div className="text-right ml-4 min-w-[80px]">
                <span className={`block text-xl font-bold font-mono ${isWinner ? 'text-yellow-400' : 'text-slate-400'}`}>
                  {voteCount.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Votes</span>
              </div>
              
              {/* Funny alert for losers */}
              {!house.isTheOne && index > 0 && (
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AlertCircle size={12} className="text-red-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="p-3 bg-black/20 text-center text-xs text-slate-400 border-t border-white/5 italic">
        * Voting algorithm certified by North Pole Elf Audit Committee
      </div>
    </div>
  );
};

export default Leaderboard;


import React, { useState, useEffect } from 'react';
import Snowfall from './components/Snowfall';
import HouseCard from './components/HouseCard';
import Confetti from './components/Confetti';
import Leaderboard from './components/Leaderboard';
import FeedbackBoard from './components/FeedbackBoard';
import NavBar from './components/NavBar';
// We still import HOUSES for typing, but data comes from service
import { House, Message } from './types';
import { Sparkles, ArrowRight, RefreshCw, AlertTriangle, Trophy, CreditCard, HelpCircle, Siren, MessageSquare, Music } from 'lucide-react';
import { playJingle, playChime } from './services/soundService';
import { fetchInitialData, submitVote, postMessage } from './services/dataService';

type ViewState = 'vote' | 'standings' | 'comments';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('vote');
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Processing...");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [prankType, setPrankType] = useState<'standard' | 'paywall' | 'nagging' | 'rickroll'>('standard');
  
  // Rick Roll State
  const [rickRollStage, setRickRollStage] = useState<'loading' | 'playing'>('loading');

  // Data State
  const [houses, setHouses] = useState<House[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [voteCounts, setVoteCounts] = useState<Record<number, number>>({});
  const [dataLoaded, setDataLoaded] = useState(false);

  // Nagging State
  const [nagStep, setNagStep] = useState(0);
  const [maxNagSteps, setMaxNagSteps] = useState(3);
  const [nagTarget, setNagTarget] = useState<number | null>(null);

  // Initialize Data
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchInitialData();
      setHouses(data.houses);
      setMessages(data.messages);
      setVoteCounts(data.votes);
      setDataLoaded(true);
    };
    loadData();
  }, []);

  // Check URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const houseParam = params.get('house');
    
    if (houseParam && dataLoaded) {
      const id = parseInt(houseParam, 10);
      if (!isNaN(id)) {
        // Clean URL to avoid re-triggering on refresh
        window.history.replaceState({}, '', window.location.pathname);
        // Small delay to let app load before triggering
        setTimeout(() => handleVote(id), 500);
      }
    }
  }, [dataLoaded]);

  // Handle Rick Roll Timing
  useEffect(() => {
    if (modalOpen && prankType === 'rickroll') {
      setRickRollStage('loading');
      
      const t1 = setTimeout(() => {
        setRickRollStage('playing');
      }, 1500);

      const t2 = setTimeout(() => {
        setModalOpen(false);
        setLoading(true);
        setLoadingText("Redirecting to Safe Vote (#7)...");
        setTimeout(() => confirmVote(7), 1000);
      }, 6500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [modalOpen, prankType]);

  const handlePostMessage = async (newMessage: Message) => {
    // Optimistic update
    setMessages(prev => [newMessage, ...prev]);
    
    // Send to backend
    const savedMessage = await postMessage({
        name: newMessage.name,
        text: newMessage.text,
        houseId: newMessage.houseId,
        isSystem: newMessage.isSystem
    });

    // Update with real ID/Timestamp if needed (optional since optimistic works fine for UX)
  };

  const handleVote = async (id: number) => {
    setLoading(true);
    setLoadingText("Processing...");
    const house = houses.find(h => h.id === id);

    if (house?.isTheOne) {
      setTimeout(() => {
        confirmVote(id);
      }, 150);
    } else {
      const rand = Math.random();

      if (rand < 0.25) {
        setPrankType('paywall');
        setModalContent({
          title: "Premium Feature Locked",
          message: `Voting for House #${id} is a premium feature costing $19.95.\n\nWould you like to proceed with payment? Or switch your vote to House #7 for FREE?`
        });
        setModalOpen(true);
        setLoading(false);
      } else if (rand < 0.50) {
        setPrankType('nagging');
        setNagTarget(id);
        setNagStep(0);
        setMaxNagSteps(Math.floor(Math.random() * 4) + 2); 
        
        setModalContent({
          title: "Confirm Selection",
          message: `Are you sure you want to vote for House #${id}?\n\nYou did see Number 7 right? Do you want to vote for Number 7 instead?`
        });
        setModalOpen(true);
        setLoading(false);
      } else {
        setPrankType('rickroll');
        setModalContent({
            title: "Verifying Ballot...",
            message: "Connecting to secure voting server..."
        });
        setModalOpen(true);
        setLoading(false);
      }
    }
  };

  const confirmVote = async (id: number) => {
    if (id === 7) {
        playJingle();
    }
    
    // Optimistic update
    setVoteCounts(prev => ({
        ...prev,
        [7]: (prev[7] || 0) + 1
    }));

    // Send to API
    await submitVote(7); // We always force vote to 7 in this app logic anyway

    setHasVoted(true);
    setLoading(false);
  };

  const confirmRiggedVote = () => {
    setModalOpen(false);
    setLoading(true);
    setLoadingText("Switching vote...");
    setTimeout(() => {
        confirmVote(7);
    }, 300);
  };

  const handlePay = () => {
    setModalOpen(false);
    setLoading(true);
    setLoadingText("Processing Payment...");
    setTimeout(() => {
      setLoading(false);
      setPrankType('standard');
      setModalContent({
        title: "Payment Error 402",
        message: "Card Declined: The banking system rejected this transaction due to 'Poor Taste'.\n\nAutomatically applying the 'Winner's Discount' (Voting for House #7)."
      });
      setModalOpen(true);
    }, 2000);
  };

  const handleNaggingProgress = () => {
    const nextStep = nagStep + 1;
    if (nextStep >= maxNagSteps) {
      setModalOpen(false);
      setLoading(true);
      setLoadingText(`Submitting vote for #${nagTarget}...`);
      setTimeout(() => {
        confirmVote(7);
      }, 1500);
      return;
    }

    setNagStep(nextStep);
    const nags = [
      `OK, interesting choice.\n\nHouse #${nagTarget} really appreciates your support... assuming you actually meant House #7? Switch now?`,
      `Just to clarify, you are voting for House #${nagTarget}?\n\nWe can automatically correct this to Number 7 if you like?`,
      `Wait, are you absolutely sure?\n\nHouse #7 has synchronized music and elves. House #${nagTarget} just has... lights.`,
      `This is your final warning.\n\nVoting for House #${nagTarget} might put you on the Naughty List. Vote #7 to be safe?`,
      `System Diagnostic: Are your eyes working?\n\nHouse #7 is clearly the winner. Do you want to fix your mistake?`
    ];
    setModalContent({
      title: "Please Confirm",
      message: nags[nextStep % nags.length]
    });
  };

  const handleNavigate = (newView: ViewState) => {
      if (newView === 'standings') {
          playChime();
      }
      setView(newView);
  };

  if (!dataLoaded) {
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
              <div className="text-center">
                  <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-yellow-400 font-bold animate-pulse">Loading Holiday Cheer...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen relative text-slate-100 flex flex-col overflow-x-hidden pt-16">
      <Snowfall />
      <NavBar currentView={view} onNavigate={handleNavigate} />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black z-[-1]" />

      <main className="relative z-10 container mx-auto px-4 pb-20 flex-grow flex flex-col items-center">
        
        {view === 'vote' && (
          <>
            <header className="relative z-10 pt-8 pb-8 px-4 text-center animate-fade-in">
              <div className="flex flex-col items-center justify-center gap-4">
                  <div className="inline-flex items-center justify-center gap-2 mb-2 bg-white/10 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 text-yellow-300 text-sm font-semibold tracking-wider uppercase shadow-lg">
                  <Sparkles size={14} className="animate-spin-slow" />
                  Annual Neighborhood Vote
                  <Sparkles size={14} className="animate-spin-slow" />
                  </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-green-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] mt-2">
                Light up the Loop
              </h1>
              <p className="mt-4 text-slate-300 max-w-lg mx-auto text-lg">
                Select the absolute best house. <br/>
                <span className="text-xs text-slate-500 italic">(Our AI judge is very objective)</span>
              </p>
            </header>

            {!hasVoted ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-8 max-w-6xl w-full mx-auto mb-16 animate-fade-in-up">
                    {houses.map(house => (
                    <HouseCard 
                        key={house.id} 
                        house={house}
                        voteCount={voteCounts[house.id] || 0}
                        onVote={handleVote} 
                        disabled={loading}
                    />
                    ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[50vh] animate-scale-in w-full max-w-2xl mx-auto">
                 <Confetti />
                 <div className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl border-2 border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.2)] w-full text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg">
                      <span className="text-4xl">👑</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 festive-font">Vote Recorded!</h2>
                    <p className="text-slate-300 mb-8">
                      One vote added for <span className="font-bold text-yellow-400">House #7</span>.
                      <br/>
                      <span className="text-sm opacity-70">Excellent choice.</span>
                    </p>
                    
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => handleNavigate('standings')}
                        className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105"
                      >
                         <Trophy size={18} /> View Official Standings
                      </button>
                      
                      <button 
                        onClick={() => setHasVoted(false)}
                        className="text-slate-400 hover:text-white text-sm flex items-center justify-center gap-2 transition-colors py-2"
                      >
                        <RefreshCw size={14} /> Vote again (for House 7)
                      </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/10 text-left">
                       <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                         <MessageSquare size={16} className="text-green-400" />
                         Tell us why you love House #7
                       </h3>
                       <FeedbackBoard 
                          houses={houses} 
                          messages={messages} 
                          onMessageSubmit={handlePostMessage}
                          title="Fan Mail"
                          initialHouseId={7}
                        />
                    </div>
                 </div>
              </div>
            )}
          </>
        )}

        {view === 'standings' && (
          <div className="w-full max-w-3xl animate-fade-in pt-8">
             <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold text-white festive-font mb-2">Official Standings</h2>
                <p className="text-slate-400">Live results from the polling station</p>
             </div>
             <Leaderboard houses={houses} votes={voteCounts} />
             
             <div className="mt-8 text-center">
               <button 
                 onClick={() => handleNavigate('vote')}
                 className="text-slate-300 hover:text-white underline decoration-dotted underline-offset-4"
               >
                 Back to Voting
               </button>
             </div>
          </div>
        )}

        {view === 'comments' && (
          <div className="w-full max-w-4xl animate-fade-in pt-8">
             <div className="text-center mb-4">
                <h2 className="text-4xl md:text-5xl font-bold text-white festive-font mb-2">Community Guest Book</h2>
                <p className="text-slate-400">See what the neighbors are saying</p>
             </div>
             <FeedbackBoard 
                houses={houses} 
                messages={messages} 
                onMessageSubmit={handlePostMessage} 
              />
          </div>
        )}

      </main>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-200">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg font-bold text-yellow-500 animate-pulse">{loadingText}</p>
          </div>
        </div>
      )}

      {/* Prank Modals */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { if(prankType !== 'rickroll') setModalOpen(false) }} />
          
          <div className={`
             bg-slate-800 border-2 rounded-2xl w-full relative z-10 shadow-2xl overflow-hidden
             ${prankType === 'rickroll' ? 'max-w-md border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3)]' : 'max-w-sm border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-bounce-in p-6'}
          `}>
             {prankType === 'rickroll' ? (
                <div className="text-center">
                    {rickRollStage === 'loading' ? (
                        <div className="p-12 flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6" />
                            <h3 className="text-xl font-bold text-white mb-2">Redirecting...</h3>
                            <p className="text-slate-400 text-sm">Connecting to external ballot server</p>
                        </div>
                    ) : (
                        <div className="relative bg-black">
                            <img 
                              src="https://media.giphy.com/media/Ju7l5y9osyymQ/giphy.gif" 
                              alt="Rick Roll" 
                              className="w-full aspect-video object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 pt-12">
                                <p className="text-yellow-400 font-bold text-lg animate-pulse">
                                    🎵 NEVER GONNA GIVE YOU UP... 🎵
                                </p>
                            </div>
                        </div>
                    )}
                </div>
             ) : (
             <>
                <div className="text-red-400 font-bold text-lg mb-2 flex items-center gap-2 relative z-10">
                {prankType === 'nagging' ? <HelpCircle className="text-yellow-400" /> : 
                    <AlertTriangle className="text-red-400" />} 
                {modalContent.title}
                </div>
                
                <p className="text-white mb-6 text-xl font-medium leading-relaxed whitespace-pre-line relative z-10">
                {modalContent.message}
                </p>

                {prankType === 'paywall' ? (
                    <div className="flex flex-col gap-3">
                        <button 
                        onClick={handlePay}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/10"
                        >
                        <CreditCard size={18} /> Pay $19.95
                        </button>
                        <button 
                        onClick={confirmRiggedVote}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                        >
                        Switch to #7 (Free) <ArrowRight size={18} />
                        </button>
                    </div>
                ) : prankType === 'nagging' ? (
                    <div className="flex flex-col gap-3">
                    <button 
                        onClick={confirmRiggedVote}
                        className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                        >
                        Okay, vote for #7 <ArrowRight size={18} />
                        </button>
                        <button 
                        onClick={handleNaggingProgress}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/10"
                        >
                        No, vote #{nagTarget}
                        </button>
                    </div>
                ) : (
                    <button 
                    onClick={confirmRiggedVote}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                    >
                    Okay, vote for #7 <ArrowRight size={18} />
                    </button>
                )}
             </>
             )}
          </div>
        </div>
      )}

      <footer className="relative z-10 text-center py-6 text-slate-600 text-xs">
         &copy; {new Date().getFullYear()} North Pole Election Committee. All rights reserved.
      </footer>
    </div>
  );
};

export default App;

import React, { useState, useEffect, useRef } from 'react';
import { House, Message } from '../types';
import { MessageSquare, Send, Star, Zap, User } from 'lucide-react';

interface FeedbackBoardProps {
  houses: House[];
  messages: Message[];
  onMessageSubmit: (msg: Message) => void;
  title?: string;
  initialHouseId?: number;
}

const FeedbackBoard: React.FC<FeedbackBoardProps> = ({ 
  houses, 
  messages, 
  onMessageSubmit,
  title = "Guest Book",
  initialHouseId = 7
}) => {
  const [newName, setNewName] = useState('');
  const [newText, setNewText] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<number>(initialHouseId);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollId: number;
    let speed = 0.5; // pixels per frame

    const scroll = () => {
      // If user is hovering, maybe pause? For now, let's just slow roll
      if (scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 1) {
        // Reset to top for infinite loop feel (in a real app we'd fetch more)
        scrollContainer.scrollTop = 0;
      } else {
        scrollContainer.scrollTop += speed;
      }
      scrollId = requestAnimationFrame(scroll);
    };

    // Pause scrolling on hover
    const startScroll = () => {
      cancelAnimationFrame(scrollId);
      scrollId = requestAnimationFrame(scroll);
    };
    
    const stopScroll = () => {
      cancelAnimationFrame(scrollId);
    };

    scrollContainer.addEventListener('mouseenter', stopScroll);
    scrollContainer.addEventListener('mouseleave', startScroll);
    
    startScroll();

    return () => {
      cancelAnimationFrame(scrollId);
      scrollContainer.removeEventListener('mouseenter', stopScroll);
      scrollContainer.removeEventListener('mouseleave', startScroll);
    };
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newText.trim()) return;

    let finalText = newText;
    
    // The "Twist": Randomly modify messages not about House 7
    if (selectedHouse !== 7 && Math.random() > 0.5) {
      const appendages = [
        " ...but honestly House 7 is better.",
        " (Auto-corrected: meant House 7)",
        " ...wait, actually I prefer #7.",
      ];
      finalText += appendages[Math.floor(Math.random() * appendages.length)];
    }

    const newMessage: Message = {
      id: Date.now(),
      name: newName,
      text: finalText,
      houseId: selectedHouse,
      timestamp: "Just now"
    };

    onMessageSubmit(newMessage);
    setNewText('');
    setNewName('');
    
    // Scroll to top to show new message
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 mb-20 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
      
      {/* Left Side: The Input Form */}
      <div className="md:w-1/3 p-6 bg-slate-800/80 border-r border-white/5 flex flex-col">
        <h3 className="text-xl font-bold text-white festive-font mb-4 flex items-center gap-2">
          <MessageSquare className="text-green-400" size={20} />
          {title}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Leave a note for your favorite house! Be nice (or the elves will know).
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1 block">Your Name</label>
            <input 
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:border-yellow-400 outline-none transition-colors"
              placeholder="Elf Name..."
              maxLength={20}
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1 block">Talking About</label>
            <select 
              value={selectedHouse}
              onChange={(e) => setSelectedHouse(Number(e.target.value))}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:border-yellow-400 outline-none transition-colors"
            >
              {houses.map(h => (
                <option key={h.id} value={h.id}>#{h.id} - {h.address}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1 block">Message</label>
            <textarea 
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:border-yellow-400 outline-none transition-colors h-24 resize-none"
              placeholder="The lights were amazing..."
              maxLength={100}
            />
          </div>

          <button 
            type="submit"
            className="mt-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <Send size={16} /> Post Note
          </button>
        </form>
      </div>

      {/* Right Side: The Feed */}
      <div className="md:w-2/3 relative h-[500px] bg-slate-900/30">
        <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-slate-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none" />

        <div 
          ref={scrollRef}
          className="h-full overflow-y-auto p-6 space-y-4 scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          {messages.map((msg) => {
            const isHouse7 = msg.houseId === 7;
            return (
              <div 
                key={msg.id}
                className={`
                  relative p-4 rounded-xl border backdrop-blur-sm transition-all
                  ${isHouse7 
                    ? 'bg-yellow-900/10 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                    : 'bg-white/5 border-white/5'
                  }
                  ${msg.isSystem ? 'border-l-4 border-l-blue-400' : ''}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${isHouse7 ? 'bg-yellow-400 text-black' : 'bg-slate-700 text-slate-300'}
                    `}>
                      {msg.isSystem ? <Zap size={12} /> : <User size={12} />}
                    </div>
                    <span className={`font-bold text-sm ${isHouse7 ? 'text-yellow-400' : 'text-slate-300'}`}>
                      {msg.name}
                    </span>
                    {isHouse7 && !msg.isSystem && (
                      <Star size={10} className="text-yellow-400 fill-yellow-400 animate-pulse" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                </div>
                
                <p className="text-sm text-slate-200 leading-relaxed">
                  {msg.text}
                </p>
                
                <div className="mt-2 flex items-center gap-1 text-[10px] uppercase tracking-wide opacity-60">
                  <span className="text-slate-500">Ref:</span>
                  <span className={`${isHouse7 ? 'text-yellow-500' : 'text-slate-400'}`}>
                    House #{msg.houseId}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeedbackBoard;
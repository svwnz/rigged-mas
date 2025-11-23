import React, { useEffect, useState } from 'react';

interface ElfAnimationProps {
  onComplete: () => void;
}

const ElfAnimation: React.FC<ElfAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'enter' | 'act' | 'exit'>('enter');
  const [speech, setSpeech] = useState('');
  const [action, setAction] = useState<'wave' | 'raspberry'>('wave');
  const [appearanceStyle, setAppearanceStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    // Randomize the action type for variety
    setAction(Math.random() > 0.5 ? 'wave' : 'raspberry');

    // Randomize Appearance (30% chance) to change hat/outfit color
    if (Math.random() < 0.3) {
        const hue = Math.floor(Math.random() * 360);
        setAppearanceStyle({ filter: `hue-rotate(${hue}deg)` });
    }

    // Phase 1: Enter (Slide up)
    const enterTimeout = setTimeout(() => {
        setPhase('act');
        setSpeech("AH AH AH!");
    }, 800);

    // Phase 2: First Speech
    const actTimeout1 = setTimeout(() => {
       if (action === 'wave') {
         setSpeech("You didn't say the magic word!");
       } else {
         setSpeech("*PFFFFFFFFT!*");
       }
    }, 1800);

    // Phase 3: Second Speech / Correction
    const actTimeout2 = setTimeout(() => {
       setSpeech("House #7 is the ONLY option!");
    }, 3500);

    // Phase 4: Exit
    const exitTimeout = setTimeout(() => {
        setPhase('exit');
    }, 5500);

    // Phase 5: Complete Callback
    const completeTimeout = setTimeout(() => {
        onComplete();
    }, 6500);

    return () => {
        clearTimeout(enterTimeout);
        clearTimeout(actTimeout1);
        clearTimeout(actTimeout2);
        clearTimeout(exitTimeout);
        clearTimeout(completeTimeout);
    };
  }, [action, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center overflow-hidden pointer-events-auto bg-black/40 backdrop-blur-sm">
       
       {/* CSS for custom animations */}
       <style>{`
         @keyframes wiggle {
           0%, 100% { transform: rotate(-5deg); }
           50% { transform: rotate(5deg); }
         }
         @keyframes shake {
           0%, 100% { transform: translateX(0); }
           25% { transform: translateX(-5px) rotate(-2deg); }
           75% { transform: translateX(5px) rotate(2deg); }
         }
         @keyframes pop {
           0% { transform: scale(0); opacity: 0; }
           80% { transform: scale(1.1); opacity: 1; }
           100% { transform: scale(1); opacity: 1; }
         }
       `}</style>

       {/* The Elf Container */}
       <div className={`
          relative transition-all duration-700 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] transform
          ${phase === 'enter' ? 'translate-y-[120%]' : phase === 'exit' ? 'translate-y-[120%]' : 'translate-y-10'}
       `}>
          
          {/* Speech Bubble */}
          <div className={`
             absolute -top-32 -right-4 md:-right-20 bg-white text-black p-4 rounded-3xl rounded-bl-none border-4 border-black shadow-2xl w-60 text-center font-bold text-lg font-comic transform origin-bottom-left z-20
             ${phase === 'act' ? 'scale-100 opacity-100' : 'scale-0 opacity-0 transition-all duration-300'}
          `}>
             {speech}
          </div>

          {/* Elf Body */}
          <div className={`
             relative w-72 h-72 md:w-96 md:h-96
             ${action === 'raspberry' && phase === 'act' ? 'animate-[shake_0.2s_infinite]' : ''}
          `}>
             <img 
               src="https://images.unsplash.com/photo-1545048702-79362596cdc9?auto=format&fit=crop&w=400&q=80" 
               alt="Naughty Elf" 
               className="w-full h-full object-cover rounded-t-full border-8 border-white shadow-2xl"
               style={appearanceStyle}
             />
             
             {/* Action Overlays */}
             {phase === 'act' && action === 'wave' && (
                 <div className="absolute top-10 right-16 text-8xl animate-[wiggle_0.5s_ease-in-out_infinite] filter drop-shadow-lg">
                    ☝️
                 </div>
             )}
             
             {phase === 'act' && action === 'raspberry' && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-black text-white bg-red-600 px-4 py-2 rotate-12 border-4 border-white shadow-lg animate-[pop_0.3s_ease-out_forwards]">
                    NOPE!
                 </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default ElfAnimation;
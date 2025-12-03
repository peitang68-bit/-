import React from 'react';
import { TreeState } from '../types';
import { Sparkles, Gift } from 'lucide-react';

interface OverlayProps {
  mode: TreeState;
  setMode: (mode: TreeState) => void;
}

const Overlay: React.FC<OverlayProps> = ({ mode, setMode }) => {
  const toggleMode = () => {
    setMode(mode === TreeState.SCATTERED ? TreeState.TREE_SHAPE : TreeState.SCATTERED);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12 z-10">
      
      {/* Header / Brand */}
      <header className="flex flex-col items-start space-y-2 animate-fade-in">
        <h2 className="text-emerald-400 tracking-widest text-xs font-sans uppercase font-bold opacity-80">
          Interactive Experience
        </h2>
        <h1 className="text-4xl md:text-6xl font-serif text-white leading-tight drop-shadow-lg">
          Arix <span className="text-pink-300 italic">Signature</span><br/> 
          Christmas Tree
        </h1>
        <div className="h-1 w-24 bg-pink-400 mt-4 rounded-full shadow-[0_0_10px_rgba(244,114,182,0.6)]"></div>
      </header>

      {/* Controls */}
      <div className="flex flex-col items-center justify-end pb-8">
        <button
          onClick={toggleMode}
          className="pointer-events-auto group relative flex items-center gap-3 px-8 py-4 bg-emerald-950/40 backdrop-blur-md border border-emerald-500/30 rounded-full text-white transition-all duration-500 hover:bg-emerald-900/60 hover:scale-105 hover:border-pink-400/50 hover:shadow-[0_0_30px_rgba(244,114,182,0.3)] active:scale-95"
        >
          {mode === TreeState.SCATTERED ? (
            <>
              <Sparkles className="w-5 h-5 text-pink-300 animate-pulse" />
              <span className="font-sans tracking-wide uppercase text-sm font-semibold">Assemble Tree</span>
            </>
          ) : (
            <>
              <Gift className="w-5 h-5 text-pink-300 animate-bounce" />
              <span className="font-sans tracking-wide uppercase text-sm font-semibold">Scatter Joy</span>
            </>
          )}
          
          {/* Button Glow Effect */}
          <div className="absolute inset-0 rounded-full ring-1 ring-white/10 group-hover:ring-pink-400/30 transition-all duration-500" />
        </button>
        
        <p className="mt-4 text-emerald-200/50 font-sans text-xs tracking-wider">
          {mode === TreeState.SCATTERED ? 'Chaos & Magic' : 'Structure & Elegance'}
        </p>
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-0 right-0 p-12 opacity-50 hidden md:block">
        <div className="text-right">
          <p className="text-emerald-300 font-serif italic text-lg">Est. 2024</p>
          <p className="text-xs text-white/40 font-sans uppercase tracking-widest">Limited Edition</p>
        </div>
      </div>
    </div>
  );
};

export default Overlay;

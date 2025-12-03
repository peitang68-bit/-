import React, { useState, Suspense } from 'react';
import Experience from './components/Experience';
import Overlay from './components/Overlay';
import { TreeState } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<TreeState>(TreeState.SCATTERED);

  return (
    <div className="w-full h-screen relative bg-black overflow-hidden">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-[#012b22] text-emerald-300 font-serif italic">
            Gathering magic...
          </div>
        }>
          <Experience mode={mode} />
        </Suspense>
      </div>

      {/* UI Overlay Layer */}
      <Overlay mode={mode} setMode={setMode} />
      
      {/* Vignette Overlay (Static CSS for extra framing) */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] z-20" />
    </div>
  );
};

export default App;

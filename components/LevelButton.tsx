
import React from 'react';
import { StarRating } from './StarRating';
import { LevelData } from '../types';

interface LevelButtonProps {
  level: LevelData;
  onClick: (id: number) => void;
}

export const LevelButton: React.FC<LevelButtonProps> = ({ level, onClick }) => {
  return (
    <div className="flex flex-col items-center gap-3 relative group">
      <button
        disabled={level.isLocked}
        onClick={() => onClick(level.id)}
        className={`
          relative w-24 h-24 rounded-[2.5rem] border-b-[8px] flex items-center justify-center text-4xl font-black transition-all transform
          ${level.isLocked 
            ? 'bg-slate-700 border-slate-900 text-slate-500 opacity-80 cursor-not-allowed scale-90' 
            : 'bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 border-blue-800 text-white shadow-2xl hover:scale-110 active:scale-95 active:border-b-0 active:translate-y-2'
          }
        `}
      >
        {level.isLocked ? (
          <svg className="w-10 h-10 opacity-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C9.243 2 7 4.243 7 7V9H6C4.897 9 4 9.897 4 11V21C4 22.103 4.897 23 6 23H18C19.103 23 20 22.103 20 21V11C20 9.897 19.103 9 18 9H17V7C17 4.243 14.757 2 12 2ZM9 7C9 5.346 10.346 4 12 4C13.654 4 15 5.346 15 7V9H9V7ZM12 18C10.897 18 10 17.103 10 16C10 14.897 10.897 14 12 14C13.103 14 14 14.897 14 16C14 17.103 13.103 18 12 18Z"/></svg>
        ) : (
          <span className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)] font-black">{level.id}</span>
        )}
        
        {!level.isLocked && level.stars > 0 && (
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-amber-400 rounded-full border-4 border-white flex items-center justify-center shadow-lg ring-4 ring-amber-400/30 animate-pulse">
             <span className="text-white text-lg">★</span>
          </div>
        )}
      </button>
      <div className="px-4 py-1.5 bg-black/40 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
        <StarRating stars={level.stars} size="sm" />
      </div>
    </div>
  );
};

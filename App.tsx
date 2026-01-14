
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, LevelData, Question, Animal } from './types';
import { ANIMALS, TOTAL_LEVELS, QUESTIONS_PER_LEVEL } from './constants';
import { LevelButton } from './components/LevelButton';
import { StarRating } from './components/StarRating';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MAP);
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lastStars, setLastStars] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<{name: string, isCorrect: boolean} | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      const savedLevels = localStorage.getItem('animal_game_levels');
      if (savedLevels) {
        setLevels(JSON.parse(savedLevels));
      } else {
        const initial: LevelData[] = Array.from({ length: TOTAL_LEVELS }).map((_, i) => ({
          id: i + 1,
          stars: 0,
          isLocked: i !== 0
        }));
        setLevels(initial);
      }
    } catch (e) {
      console.error("Storage error:", e);
      // Fallback
      const initial: LevelData[] = Array.from({ length: TOTAL_LEVELS }).map((_, i) => ({
        id: i + 1,
        stars: 0,
        isLocked: i !== 0
      }));
      setLevels(initial);
    }
  }, []);

  const saveLevels = (updatedLevels: LevelData[]) => {
    setLevels(updatedLevels);
    try {
      localStorage.setItem('animal_game_levels', JSON.stringify(updatedLevels));
    } catch (e) {
      console.error("Save error:", e);
    }
  };

  const generateLevelQuestions = useCallback((levelId: number) => {
    const levelQuestions: Question[] = [];
    
    const animalsPerPool = 4;
    const startIndex = ((levelId - 1) * 2) % ANIMALS.length; 
    const levelPool = [];
    
    for(let i = 0; i < animalsPerPool; i++) {
        levelPool.push(ANIMALS[(startIndex + i) % ANIMALS.length]);
    }

    for (let i = 0; i < QUESTIONS_PER_LEVEL; i++) {
      const correct = levelPool[Math.floor(Math.random() * levelPool.length)];
      let options = [correct];
      while (options.length < 4) {
        const random = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
        if (!options.find(o => o.name === random.name)) {
          options.push(random);
        }
      }
      levelQuestions.push({
        correctAnimal: correct,
        options: options.sort(() => Math.random() - 0.5)
      });
    }
    setQuestions(levelQuestions);
  }, []);

  const playSound = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = ""; 
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(e => console.warn("Audio play blocked", e));
  };

  const startLevel = (id: number) => {
    setCurrentLevelId(id);
    generateLevelQuestions(id);
    setCurrentQuestionIdx(0);
    setScore(0);
    setSelectedAnswer(null);
    setGameState(GameState.PLAYING);
  };

  useEffect(() => {
    if (gameState === GameState.PLAYING && questions.length > 0) {
      const currentQ = questions[currentQuestionIdx];
      const animal = currentQ.correctAnimal as any;
      const t = setTimeout(() => {
        playSound(animal.soundUrl);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [gameState, currentQuestionIdx, questions]);

  const handleAnswer = (animal: Animal) => {
    if (selectedAnswer || isLoading) return;

    const isCorrect = animal.name === questions[currentQuestionIdx].correctAnimal.name;
    setSelectedAnswer({ name: animal.name, isCorrect });

    if (isCorrect) {
      setScore(prev => prev + 1);
      playSound('https://www.soundjay.com/buttons/sounds/button-37.mp3'); 
    } else {
      playSound('https://www.soundjay.com/buttons/sounds/button-10.mp3'); 
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentQuestionIdx < QUESTIONS_PER_LEVEL - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
      } else {
        finishLevel(isCorrect ? score + 1 : score);
      }
    }, 1200);
  };

  const finishLevel = (finalScore: number) => {
    let stars = 0;
    if (finalScore >= 9) stars = 3;
    else if (finalScore >= 6) stars = 2;
    else if (finalScore >= 3) stars = 1;

    setLastStars(stars);
    
    const updatedLevels = levels.map(l => {
      if (l.id === currentLevelId) {
        return { ...l, stars: Math.max(l.stars, stars) };
      }
      if (l.id === currentLevelId + 1 && stars > 0) {
        return { ...l, isLocked: false };
      }
      return l;
    });
    
    saveLevels(updatedLevels);
    setGameState(GameState.RESULT);
    
    if (stars > 0) {
      playSound('https://www.soundjay.com/human/sounds/applause-01.mp3');
    }
  };

  const renderMap = () => (
    <div className="relative h-full flex flex-col">
      <div className="bg-layer bg-vignette"></div>
      <div className="relative z-10 p-6 flex flex-col h-full">
        <header className="mb-14 text-center pt-10">
          <h1 className="text-5xl font-black text-white tracking-widest drop-shadow-[0_8px_15px_rgba(0,0,0,0.5)] bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent italic">
            خريطة العالم
          </h1>
          <div className="mt-3 h-1.5 w-32 bg-amber-400 mx-auto rounded-full"></div>
        </header>
        <div className="grid grid-cols-2 gap-y-24 gap-x-12 flex-1 content-start overflow-y-auto pb-48 no-scrollbar px-8">
          {levels.map((level, idx) => (
            <div key={level.id} className={`${idx % 2 === 0 ? 'translate-x-6' : '-translate-x-6'} transition-all duration-500 hover:scale-105`}>
              <LevelButton level={level} onClick={startLevel} />
            </div>
          ))}
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-10 z-20 max-w-[500px] mx-auto">
          <div className="glass-card rounded-[3rem] p-5 flex gap-4 shadow-2xl border-t border-white/60">
             <button onClick={() => {
               const next = levels.find(l => !l.isLocked && l.stars < 3) || levels[0];
               startLevel(next.id);
             }} className="flex-1 py-5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-[1.5rem] text-white font-black text-2xl shadow-xl border-b-8 border-orange-800 transition-all active:border-b-0 active:translate-y-2">
                لعب سريع
             </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlaying = () => {
    const currentQ = questions[currentQuestionIdx];
    return (
      <div className="relative h-full flex flex-col overflow-hidden">
        <div className="bg-layer bg-vignette"></div>
        <div className="relative z-10 p-8 flex flex-col h-full text-center">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl px-7 py-2.5 rounded-full border border-white/20">
               <div className="w-3.5 h-3.5 bg-green-400 rounded-full animate-pulse"></div>
               <span className="text-white font-black text-2xl">{currentQuestionIdx + 1} / {QUESTIONS_PER_LEVEL}</span>
            </div>
            <button onClick={() => setGameState(GameState.MAP)} className="bg-white/10 text-white w-14 h-14 rounded-full border border-white/20 text-2xl flex items-center justify-center">
              ✕
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-14">
            <div className="glass-card p-12 rounded-[4rem] shadow-2xl relative z-10 border-b-[8px] border-slate-300 w-full max-w-sm">
              <h2 className="text-4xl font-black text-slate-800 mb-10">من هذا الحيوان؟</h2>
              <button 
                onClick={() => playSound((currentQ.correctAnimal as any).soundUrl)}
                className="w-44 h-44 mx-auto rounded-[3rem] bg-gradient-to-br from-indigo-700 to-cyan-500 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-90"
              >
                <svg className="w-28 h-28 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-2 0L7 7H3v10h4l5 3.77V3.23zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-8 w-full">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswer?.name === option.name;
                const isCorrectAnswer = option.name === currentQ.correctAnimal.name;
                let btnClass = "bg-white border-slate-100 shadow-lg";
                if (selectedAnswer) {
                  if (isCorrectAnswer) btnClass = "bg-green-500 text-white animate-correct-zoom ring-4 ring-green-200";
                  else if (isSelected) btnClass = "bg-red-500 text-white animate-shake ring-4 ring-red-200";
                  else btnClass = "opacity-30 scale-95";
                }
                return (
                  <button
                    key={idx}
                    disabled={!!selectedAnswer}
                    onClick={() => handleAnswer(option)}
                    className={`p-5 rounded-[3rem] border-b-4 transition-all duration-400 ${btnClass}`}
                  >
                    <img src={option.image} className="w-full h-36 object-cover rounded-[2rem] mb-4 border-2 border-white" />
                    <span className="font-black text-3xl">{option.arabicName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResult = () => (
    <div className="relative h-full flex items-center justify-center p-10 overflow-hidden">
      <div className="bg-layer bg-vignette"></div>
      <div className="relative z-10 glass-card rounded-[5rem] p-14 w-full max-w-md shadow-2xl border-b-[12px] border-slate-300 space-y-12">
        <div className="bg-white rounded-[2.5rem] py-8 border-2 border-amber-100 shadow-inner">
          <StarRating stars={lastStars} size="lg" />
        </div>
        <div className="text-center">
          <h2 className="text-6xl font-black text-slate-800 italic">{lastStars >= 2 ? 'مذهل!' : 'رائع!'}</h2>
          <p className="text-8xl font-black text-blue-600 mt-4">{score} <span className="text-2xl text-slate-300">/ 10</span></p>
        </div>
        <div className="grid gap-5">
          {lastStars > 0 && currentLevelId < TOTAL_LEVELS && (
            <button onClick={() => startLevel(currentLevelId + 1)} className="py-6 bg-gradient-to-r from-blue-600 to-indigo-600 border-b-8 border-indigo-900 rounded-[2rem] text-white font-black text-3xl shadow-xl active:translate-y-2">المرحلة التالية</button>
          )}
          <div className="flex gap-5">
            <button onClick={() => startLevel(currentLevelId)} className="flex-1 py-5 bg-slate-100 border-b-6 border-slate-300 rounded-[2rem] text-slate-600 font-black text-xl">إعادة ↻</button>
            <button onClick={() => setGameState(GameState.MAP)} className="flex-1 py-5 bg-slate-800 border-b-6 border-black rounded-[2rem] text-white font-black text-xl">الخريطة</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="game-container">
      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-12px); } 40% { transform: translateX(12px); } 60% { transform: translateX(-12px); } 80% { transform: translateX(12px); } }
        @keyframes correct-zoom { 0% { transform: scale(1); } 50% { transform: scale(1.18); } 100% { transform: scale(1.05); } }
        .animate-shake { animation: shake 0.4s both; }
        .animate-correct-zoom { animation: correct-zoom 0.6s forwards; }
      `}</style>
      {gameState === GameState.MAP && renderMap()}
      {gameState === GameState.PLAYING && questions.length > 0 && renderPlaying()}
      {gameState === GameState.RESULT && renderResult()}
    </div>
  );
};

export default App;

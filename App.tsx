
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
  const [selectedAnswer, setSelectedAnswer] = useState<{name: string, isCorrect: boolean} | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // تحميل المستويات مع معالجة أخطاء JSON
  useEffect(() => {
    const initLevels = () => {
      const initial: LevelData[] = Array.from({ length: TOTAL_LEVELS }).map((_, i) => ({
        id: i + 1,
        stars: 0,
        isLocked: i !== 0
      }));

      try {
        const saved = localStorage.getItem('animal_game_levels');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLevels(parsed);
            return;
          }
        }
      } catch (e) {
        console.warn("Could not load levels from storage, using defaults");
      }
      setLevels(initial);
    };

    initLevels();
  }, []);

  const saveLevels = (updatedLevels: LevelData[]) => {
    setLevels(updatedLevels);
    try {
      localStorage.setItem('animal_game_levels', JSON.stringify(updatedLevels));
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  };

  const generateLevelQuestions = useCallback((levelId: number) => {
    const levelQuestions: Question[] = [];
    
    // نظام الـ Pool: كل مستوى له مجموعة حيوانات صحيحة مختلفة
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
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ""; 
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play().catch(() => {}); // منع أخطاء الـ Autoplay
    } catch (e) {
      console.error("Audio error", e);
    }
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
      const t = setTimeout(() => {
        playSound((currentQ.correctAnimal as any).soundUrl);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [gameState, currentQuestionIdx, questions]);

  const handleAnswer = (animal: Animal) => {
    if (selectedAnswer) return;

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
      setTimeout(() => playSound('https://www.soundjay.com/human/sounds/applause-01.mp3'), 500);
    }
  };

  if (levels.length === 0) return <div className="game-container flex items-center justify-center text-white">جاري التحميل...</div>;

  return (
    <div className="game-container">
      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-12px); } 40% { transform: translateX(12px); } 60% { transform: translateX(-12px); } 80% { transform: translateX(12px); } }
        @keyframes correct-zoom { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1.05); } }
        .animate-shake { animation: shake 0.4s both; }
        .animate-correct-zoom { animation: correct-zoom 0.5s forwards; }
      `}</style>
      
      {gameState === GameState.MAP && (
        <div className="relative h-full flex flex-col p-6">
          <header className="mb-14 text-center pt-10">
            <h1 className="text-5xl font-black text-white drop-shadow-lg italic">خريطة العالم</h1>
            <div className="mt-3 h-1.5 w-32 bg-amber-400 mx-auto rounded-full"></div>
          </header>
          <div className="grid grid-cols-2 gap-y-20 gap-x-12 flex-1 content-start overflow-y-auto no-scrollbar px-6 pb-40">
            {levels.map((level, idx) => (
              <div key={level.id} className={idx % 2 === 0 ? 'translate-x-4' : '-translate-x-4'}>
                <LevelButton level={level} onClick={startLevel} />
              </div>
            ))}
          </div>
          <div className="fixed bottom-10 left-0 right-0 max-w-[500px] mx-auto px-10">
            <button onClick={() => startLevel(levels.find(l => !l.isLocked && l.stars < 3)?.id || 1)} className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl text-white font-black text-2xl shadow-xl border-b-8 border-orange-800 active:border-b-0 active:translate-y-2">
              لعب سريع
            </button>
          </div>
        </div>
      )}

      {gameState === GameState.PLAYING && questions.length > 0 && (
        <div className="relative h-full flex flex-col p-8 text-center">
          <div className="flex justify-between items-center mb-8">
            <div className="bg-black/30 px-6 py-2 rounded-full text-white font-bold text-xl">
              {currentQuestionIdx + 1} / {QUESTIONS_PER_LEVEL}
            </div>
            <button onClick={() => setGameState(GameState.MAP)} className="bg-white/20 w-12 h-12 rounded-full text-white text-xl">✕</button>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-10">
            <div className="glass-card p-10 rounded-[3rem] shadow-xl">
              <h2 className="text-3xl font-black text-slate-800 mb-6">من صاحب الصوت؟</h2>
              <button onClick={() => playSound((questions[currentQuestionIdx].correctAnimal as any).soundUrl)} className="w-40 h-40 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95">
                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-2 0L7 7H3v10h4l5 3.77V3.23z"/></svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {questions[currentQuestionIdx].options.map((opt, i) => {
                const isCorrect = opt.name === questions[currentQuestionIdx].correctAnimal.name;
                const isSelected = selectedAnswer?.name === opt.name;
                let c = "bg-white";
                if (selectedAnswer) {
                  if (isCorrect) c = "bg-green-500 text-white animate-correct-zoom";
                  else if (isSelected) c = "bg-red-500 text-white animate-shake";
                  else c = "opacity-30 scale-95";
                }
                return (
                  <button key={i} onClick={() => handleAnswer(opt)} className={`p-4 rounded-3xl border-b-4 border-slate-200 transition-all ${c}`}>
                    <img src={opt.image} className="w-full h-32 object-cover rounded-2xl mb-2" />
                    <span className="font-bold text-2xl">{opt.arabicName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {gameState === GameState.RESULT && (
        <div className="h-full flex items-center justify-center p-8">
          <div className="glass-card rounded-[4rem] p-12 w-full text-center shadow-2xl space-y-8">
            <StarRating stars={lastStars} size="lg" />
            <div>
              <h2 className="text-5xl font-black text-slate-800">{lastStars >= 2 ? 'مبدع!' : 'جيد جداً'}</h2>
              <p className="text-7xl font-black text-blue-600 mt-4">{score} <span className="text-2xl text-slate-400">/ 10</span></p>
            </div>
            <div className="space-y-4">
              {lastStars > 0 && currentLevelId < TOTAL_LEVELS && (
                <button onClick={() => startLevel(currentLevelId + 1)} className="w-full py-5 bg-blue-600 rounded-3xl text-white font-black text-2xl shadow-lg active:translate-y-1">المرحلة التالية</button>
              )}
              <div className="flex gap-4">
                <button onClick={() => startLevel(currentLevelId)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold">إعادة ↻</button>
                <button onClick={() => setGameState(GameState.MAP)} className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold">الخريطة</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
